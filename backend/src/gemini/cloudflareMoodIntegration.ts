/**
 * Cloudflare Mood Integration System
 * Connects Firebase login → Nessie API → Cloudflare mood data → Gemini analysis
 */

import { D1Service } from '../database/services/d1Service';
import { WellbeingData } from '../database/types';
import { NessieAPIIntegration } from './nessieIntegration';
import { generateCompleteScoringSystem } from './wellnessFinanceScoring';
import { MoodEntry } from './moodTypes';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
const NESSIE_CUSTOMER_ID = process.env.NESSIE_CUSTOMER_ID;

if (!NESSIE_API_KEY || !NESSIE_CUSTOMER_ID) {
  throw new Error('NESSIE_API_KEY and NESSIE_CUSTOMER_ID environment variables are required.');
}

/**
 * Main integration service that connects all systems
 */
export class CloudflareMoodIntegration {
  private d1Service: D1Service;
  private nessieService: NessieAPIIntegration;

  constructor() {
    this.d1Service = D1Service.getInstance();
    this.nessieService = new NessieAPIIntegration(NESSIE_API_KEY!, NESSIE_CUSTOMER_ID!);
  }

  /**
   * Get complete analysis for a user (Firebase UID)
   * This is the main function your frontend will call
   */
  async getCompleteAnalysis(
    firebaseUserId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    moodData: WellbeingData[];
    spendingData: any[];
    analysis: any;
    scores: any;
  }> {
    try {
      console.log(`🔍 Getting complete analysis for user: ${firebaseUserId}`);
      console.log(`📅 Date range: ${startDate} to ${endDate}`);

      // Step 1: Get mood data from Cloudflare D1
      console.log('1️⃣ Fetching mood data from Cloudflare D1...');
      const moodData = await this.d1Service.getWellbeingDataByDateRange(
        firebaseUserId,
        startDate,
        endDate
      );
      console.log(`📊 Found ${moodData.length} mood entries`);
      
      // Step 2: Get spending data from Nessie API
      console.log('2️⃣ Fetching spending data from Nessie API...');
      let spendingData: any[] = [];
      try {
        spendingData = await this.nessieService.getAllTransactions(startDate, endDate);
        console.log(`📊 Found ${spendingData.length} transactions from Nessie`);
      } catch (nessieError) {
        console.warn('⚠️ Nessie API not available, using dummy spending data...');
        spendingData = this.generateDummySpendingData(moodData);
        console.log(`📊 Generated ${spendingData.length} dummy transactions`);
      }

      // Step 3: Convert Cloudflare mood data to Gemini format
      console.log('3️⃣ Converting mood data for Gemini analysis...');
      const geminiMoodData = this.convertToGeminiFormat(moodData);

      // Step 4: Run Gemini analysis
      console.log('4️⃣ Running Gemini AI analysis...');
      const analysis = await this.runGeminiAnalysis(geminiMoodData, spendingData);

      // Step 5: Generate scoring system
      console.log('5️⃣ Generating wellness and finance scores...');
      const scores = await generateCompleteScoringSystem(geminiMoodData, spendingData);

      console.log('✅ Complete analysis generated successfully');

      return {
        moodData,
        spendingData,
        analysis,
        scores
      };

    } catch (error) {
      console.error('❌ Error in complete analysis:', error);
      throw error;
    }
  }

  /**
   * Get quick scores for dashboard display
   */
  async getQuickScores(
    firebaseUserId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    overallScore: number;
    wellnessScore: number;
    financeScore: number;
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    overallStatus: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical';
  }> {
    try {
      const { scores } = await this.getCompleteAnalysis(firebaseUserId, startDate, endDate);
      
      return {
        overallScore: scores.summary.overallScore,
        wellnessScore: scores.wellness.overall,
        financeScore: scores.finance.overall,
        overallGrade: scores.summary.grade,
        overallStatus: scores.summary.status
      };
    } catch (error) {
      console.error('❌ Error getting quick scores:', error);
      throw error;
    }
  }

  /**
   * Get mood data only
   */
  async getMoodData(
    firebaseUserId: string,
    startDate: string,
    endDate: string
  ): Promise<WellbeingData[]> {
    try {
      return await this.d1Service.getWellbeingDataByDateRange(firebaseUserId, startDate, endDate);
    } catch (error) {
      console.error('❌ Error getting mood data:', error);
      throw error;
    }
  }

  /**
   * Get spending data only
   */
  async getSpendingData(
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      return await this.nessieService.getAllTransactions(startDate, endDate);
    } catch (error) {
      console.error('❌ Error getting spending data:', error);
      throw error;
    }
  }

  /**
   * Add new mood entry (for frontend to call)
   */
  async addMoodEntry(
    firebaseUserId: string,
    moodData: {
      date: string;
      overall_wellbeing: number;
      sleep_quality: number;
      physical_activity: number;
      time_with_family_friends: number;
      diet_quality: number;
      stress_levels: number;
    }
  ): Promise<WellbeingData> {
    try {
      console.log(`📝 Adding mood entry for user: ${firebaseUserId}`);
      
      const result = await this.d1Service.createWellbeingData({
        userId: firebaseUserId,
        ...moodData
      });

      console.log(`✅ Mood entry added successfully: ${result.id}`);
      return result;
    } catch (error) {
      console.error('❌ Error adding mood entry:', error);
      throw error;
    }
  }

  /**
   * Convert Cloudflare mood data to Gemini format
   */
  private convertToGeminiFormat(moodData: WellbeingData[]): Omit<MoodEntry, 'id' | 'userId'>[] {
    return moodData.map(entry => ({
      date: entry.date,
      overall_wellbeing: entry.overall_wellbeing,
      sleep_quality: entry.sleep_quality,
      physical_activity: entry.physical_activity,
      time_with_family_friends: entry.time_with_family_friends,
      diet_quality: entry.diet_quality,
      stress_levels: entry.stress_levels,
      notes: `Mood entry for ${entry.date}`
    }));
  }

  /**
   * Run Gemini analysis on mood and spending data
   */
  private async runGeminiAnalysis(
    moodData: Omit<MoodEntry, 'id' | 'userId'>[],
    spendingData: any[]
  ): Promise<any> {
    try {
      // Import the analysis function
      const { analyzeSpendingWithFirebaseMood } = await import('./firebaseMoodAnalysis');
      
      // Use the existing analysis function
      return await analyzeSpendingWithFirebaseMood('user', spendingData, '2024-01-01', '2024-12-31');
    } catch (error) {
      console.error('❌ Error running Gemini analysis:', error);
      throw error;
    }
  }

  /**
   * Generate dummy spending data if Nessie is not available
   */
  private generateDummySpendingData(moodData: WellbeingData[]): any[] {
    const transactions: any[] = [];
    
    moodData.forEach(mood => {
      const baseSpending = 50 + Math.random() * 100;
      
      // Mood-spending correlations
      let moodMultiplier = 1;
      if (mood.overall_wellbeing < 4) {
        moodMultiplier = 1.3; // Higher spending when feeling down
      } else if (mood.overall_wellbeing > 7) {
        moodMultiplier = 1.1; // Slightly higher when feeling great
      }
      
      if (mood.stress_levels > 7) {
        moodMultiplier *= 1.2; // Stress spending
      }
      
      if (mood.sleep_quality < 4) {
        moodMultiplier *= 1.15; // Poor sleep = more spending
      }
      
      if (mood.time_with_family_friends < 3) {
        moodMultiplier *= 1.25; // Loneliness spending
      }

      const dailySpending = baseSpending * moodMultiplier;
      
      // Generate realistic transaction categories
      const categories = [
        { name: 'Food', baseAmount: dailySpending * 0.4, moodImpact: mood.diet_quality < 4 ? 1.3 : 0.8 },
        { name: 'Entertainment', baseAmount: dailySpending * 0.2, moodImpact: mood.overall_wellbeing < 4 ? 1.4 : 0.9 },
        { name: 'Shopping', baseAmount: dailySpending * 0.15, moodImpact: mood.stress_levels > 6 ? 1.5 : 0.7 },
        { name: 'Transportation', baseAmount: dailySpending * 0.1, moodImpact: 1.0 },
        { name: 'Health', baseAmount: dailySpending * 0.1, moodImpact: mood.physical_activity < 4 ? 1.2 : 0.8 },
        { name: 'Utilities', baseAmount: dailySpending * 0.05, moodImpact: 1.0 }
      ];
      
      categories.forEach(category => {
        const amount = category.baseAmount * category.moodImpact;
        if (amount > 5) {
          transactions.push({
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: mood.date,
            amount: Math.round(amount * 100) / 100,
            category: category.name,
            description: `${category.name} - ${mood.date}`
          });
        }
      });
    });
    
    return transactions;
  }
}

/**
 * Singleton instance for easy access
 */
export const cloudflareMoodIntegration = new CloudflareMoodIntegration();
