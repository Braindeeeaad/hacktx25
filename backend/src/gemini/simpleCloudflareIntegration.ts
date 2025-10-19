/**
 * Simple Cloudflare Integration System
 * Direct integration: Firebase UID → Cloudflare D1 → Gemini Analysis
 */

import { D1Service } from '../database/services/d1Service';
import { WellbeingData } from '../database/types';
import { NessieAPIIntegration } from './nessieIntegration';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
const NESSIE_CUSTOMER_ID = process.env.NESSIE_CUSTOMER_ID;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required.');
}

/**
 * Simple integration service
 */
export class SimpleCloudflareIntegration {
  private d1Service: D1Service;
  private nessieService: NessieAPIIntegration | null;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.d1Service = D1Service.getInstance();
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    
    if (NESSIE_API_KEY && NESSIE_CUSTOMER_ID) {
      this.nessieService = new NessieAPIIntegration(NESSIE_API_KEY, NESSIE_CUSTOMER_ID);
    } else {
      this.nessieService = null;
      console.warn('⚠️ Nessie API not configured, will use dummy spending data');
    }
  }

  /**
   * Get complete analysis for a user
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

      // Step 1: Get mood data from Cloudflare D1
      console.log('1️⃣ Fetching mood data from Cloudflare D1...');
      const moodData = await this.d1Service.getWellbeingDataByDateRange(
        firebaseUserId,
        startDate,
        endDate
      );
      console.log(`📊 Found ${moodData.length} mood entries`);

      // Step 2: Get spending data
      console.log('2️⃣ Fetching spending data...');
      let spendingData: any[] = [];
      
      if (this.nessieService) {
        try {
          spendingData = await this.nessieService.getAllTransactions(startDate, endDate);
          console.log(`📊 Found ${spendingData.length} transactions from Nessie`);
        } catch (error) {
          console.warn('⚠️ Nessie API failed, using dummy data');
          spendingData = this.generateDummySpendingData(moodData);
        }
      } else {
        spendingData = this.generateDummySpendingData(moodData);
        console.log(`📊 Generated ${spendingData.length} dummy transactions`);
      }

      // Step 3: Run Gemini analysis
      console.log('3️⃣ Running Gemini AI analysis...');
      const analysis = await this.runGeminiAnalysis(moodData, spendingData);

      // Step 4: Generate scores
      console.log('4️⃣ Generating wellness and finance scores...');
      const scores = await this.generateScores(moodData, spendingData);

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
   * Get quick scores for dashboard
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
        overallScore: scores.overallScore,
        wellnessScore: scores.wellnessScore,
        financeScore: scores.financeScore,
        overallGrade: scores.overallGrade,
        overallStatus: scores.overallStatus
      };
    } catch (error) {
      console.error('❌ Error getting quick scores:', error);
      throw error;
    }
  }

  /**
   * Add mood entry
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
   * Run Gemini analysis
   */
  private async runGeminiAnalysis(moodData: WellbeingData[], spendingData: any[]): Promise<any> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

      // Format data for Gemini
      const moodSummary = this.formatMoodDataForGemini(moodData);
      const spendingSummary = this.formatSpendingDataForGemini(spendingData);

      const prompt = `
You are an AI financial and wellness coach. Analyze the following mood and spending data to provide insights and recommendations.

MOOD DATA SUMMARY:
${moodSummary}

SPENDING DATA SUMMARY:
${spendingSummary}

Please provide:
1. Key insights about mood-spending correlations
2. Wellness recommendations based on mood patterns
3. Financial recommendations based on spending patterns
4. Overall assessment and priority actions

Respond with a JSON object containing:
{
  "keyInsights": ["insight1", "insight2"],
  "wellnessRecommendations": ["rec1", "rec2"],
  "financeRecommendations": ["rec1", "rec2"],
  "priorityActions": ["action1", "action2"],
  "moodSpendingCorrelation": 0.5,
  "overallAssessment": "Your overall assessment"
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('❌ Error running Gemini analysis:', error);
      return {
        keyInsights: ['Analysis failed'],
        wellnessRecommendations: ['Check system configuration'],
        financeRecommendations: ['Check system configuration'],
        priorityActions: ['Fix analysis system'],
        moodSpendingCorrelation: 0,
        overallAssessment: 'Analysis system error'
      };
    }
  }

  /**
   * Generate scores based on mood and spending data
   */
  private async generateScores(moodData: WellbeingData[], spendingData: any[]): Promise<any> {
    try {
      // Calculate wellness score
      const wellnessScore = this.calculateWellnessScore(moodData);
      
      // Calculate finance score
      const financeScore = this.calculateFinanceScore(spendingData);
      
      // Calculate overall score
      const overallScore = Math.round((wellnessScore + financeScore) / 2);
      
      // Determine grade and status
      const { grade, status } = this.calculateGradeAndStatus(overallScore);

      return {
        overallScore,
        wellnessScore,
        financeScore,
        overallGrade: grade,
        overallStatus: status,
        wellnessBreakdown: {
          physical: Math.round((wellnessScore.physical + wellnessScore.mental + wellnessScore.social) / 3),
          mental: wellnessScore.mental,
          social: wellnessScore.social
        },
        financeBreakdown: {
          spendingControl: financeScore.spendingControl,
          budgeting: financeScore.budgeting,
          stability: financeScore.stability
        }
      };

    } catch (error) {
      console.error('❌ Error generating scores:', error);
      return {
        overallScore: 50,
        wellnessScore: 50,
        financeScore: 50,
        overallGrade: 'C',
        overallStatus: 'fair'
      };
    }
  }

  /**
   * Calculate wellness score
   */
  private calculateWellnessScore(moodData: WellbeingData[]): any {
    if (moodData.length === 0) {
      return { overall: 0, physical: 0, mental: 0, social: 0 };
    }

    const avgWellbeing = moodData.reduce((sum, m) => sum + m.overall_wellbeing, 0) / moodData.length;
    const avgSleep = moodData.reduce((sum, m) => sum + m.sleep_quality, 0) / moodData.length;
    const avgActivity = moodData.reduce((sum, m) => sum + m.physical_activity, 0) / moodData.length;
    const avgSocial = moodData.reduce((sum, m) => sum + m.time_with_family_friends, 0) / moodData.length;
    const avgDiet = moodData.reduce((sum, m) => sum + m.diet_quality, 0) / moodData.length;
    const avgStress = moodData.reduce((sum, m) => sum + m.stress_levels, 0) / moodData.length;

    // Convert 0-10 scale to 0-100 scale
    const physical = Math.round((avgSleep + avgActivity + avgDiet) / 3 * 10);
    const mental = Math.round((avgWellbeing + (10 - avgStress)) / 2 * 10);
    const social = Math.round(avgSocial * 10);
    const overall = Math.round((physical + mental + social) / 3);

    return { overall, physical, mental, social };
  }

  /**
   * Calculate finance score
   */
  private calculateFinanceScore(spendingData: any[]): any {
    if (spendingData.length === 0) {
      return { overall: 0, spendingControl: 0, budgeting: 0, stability: 0 };
    }

    const totalSpent = spendingData.reduce((sum, tx) => sum + tx.amount, 0);
    const avgDaily = totalSpent / 30; // Assuming 30 days
    const categories = [...new Set(spendingData.map(tx => tx.category))];

    // Simple scoring based on spending patterns
    const spendingControl = Math.max(0, 100 - (avgDaily / 50) * 20); // Lower daily spending = higher score
    const budgeting = Math.min(100, categories.length * 20); // More categories = better budgeting
    const stability = 80; // Default stability score

    const overall = Math.round((spendingControl + budgeting + stability) / 3);

    return { overall, spendingControl, budgeting, stability };
  }

  /**
   * Calculate grade and status
   */
  private calculateGradeAndStatus(score: number): { grade: 'A' | 'B' | 'C' | 'D' | 'F', status: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical' } {
    if (score >= 90) return { grade: 'A', status: 'excellent' };
    if (score >= 80) return { grade: 'B', status: 'good' };
    if (score >= 70) return { grade: 'C', status: 'fair' };
    if (score >= 60) return { grade: 'D', status: 'needs_improvement' };
    return { grade: 'F', status: 'critical' };
  }

  /**
   * Format mood data for Gemini
   */
  private formatMoodDataForGemini(moodData: WellbeingData[]): string {
    if (moodData.length === 0) return 'No mood data available';

    const avgWellbeing = moodData.reduce((sum, m) => sum + m.overall_wellbeing, 0) / moodData.length;
    const avgSleep = moodData.reduce((sum, m) => sum + m.sleep_quality, 0) / moodData.length;
    const avgActivity = moodData.reduce((sum, m) => sum + m.physical_activity, 0) / moodData.length;
    const avgSocial = moodData.reduce((sum, m) => sum + m.time_with_family_friends, 0) / moodData.length;
    const avgDiet = moodData.reduce((sum, m) => sum + m.diet_quality, 0) / moodData.length;
    const avgStress = moodData.reduce((sum, m) => sum + m.stress_levels, 0) / moodData.length;

    return `
- Total mood entries: ${moodData.length}
- Average wellbeing: ${avgWellbeing.toFixed(2)}/10
- Average sleep quality: ${avgSleep.toFixed(2)}/10
- Average physical activity: ${avgActivity.toFixed(2)}/10
- Average social time: ${avgSocial.toFixed(2)}/10
- Average diet quality: ${avgDiet.toFixed(2)}/10
- Average stress level: ${avgStress.toFixed(2)}/10
`;
  }

  /**
   * Format spending data for Gemini
   */
  private formatSpendingDataForGemini(spendingData: any[]): string {
    if (spendingData.length === 0) return 'No spending data available';

    const totalSpent = spendingData.reduce((sum, tx) => sum + tx.amount, 0);
    const avgDaily = totalSpent / 30;
    const categories = [...new Set(spendingData.map(tx => tx.category))];

    return `
- Total transactions: ${spendingData.length}
- Total spent: $${totalSpent.toFixed(2)}
- Average daily spending: $${avgDaily.toFixed(2)}
- Spending categories: ${categories.join(', ')}
`;
  }

  /**
   * Generate dummy spending data
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
export const simpleCloudflareIntegration = new SimpleCloudflareIntegration();
