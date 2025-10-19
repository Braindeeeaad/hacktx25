/**
 * Mood-Enhanced Spending Analysis
 * Seamlessly integrates mood data with existing spending analysis
 */

import { analyzeSpending, Transaction, AnalysisResult } from './analyzeSpending';
import { CloudflareMoodService } from './cloudflareMoodService';
import { MoodSpendingCorrelation, EmotionalSpendingPattern, MoodEntry } from './moodTypes';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SPENDING_ANALYSIS_PROMPT } from './prompts/spendingAnalysisPrompt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export interface MoodEnhancedAnalysisResult extends AnalysisResult {
  moodSpendingCorrelations: MoodSpendingCorrelation[];
  emotionalInsights: string[];
  moodBasedRecommendations: string[];
  emotionalSpendingPatterns: EmotionalSpendingPattern[];
  predictiveAlerts: PredictiveAlert[];
}

export interface PredictiveAlert {
  type: 'mood_spending' | 'emotional_trigger' | 'wellness_reminder';
  message: string;
  severity: 'low' | 'medium' | 'high';
  action: string;
  timestamp: string;
}

export class MoodEnhancedAnalyzer {
  private moodService: CloudflareMoodService;
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.moodService = new CloudflareMoodService();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });
  }

  /**
   * Perform mood-enhanced spending analysis
   * This is the main function that integrates mood data with your existing analysis
   */
  async analyzeWithMood(
    transactions: Transaction[],
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MoodEnhancedAnalysisResult> {
    try {
      console.log('🧠 Starting mood-enhanced analysis...');

      // Get mood data for the same period
      const moodSpendingCorrelations = await this.moodService.analyzeMoodSpendingCorrelation(
        userId, startDate, endDate, transactions
      );

      // Perform regular spending analysis (your existing function)
      const spendingAnalysis = await analyzeSpending(transactions);

      // Generate emotional insights using your existing Gemini prompt
      const emotionalInsights = await this.generateEmotionalInsights(
        spendingAnalysis, moodSpendingCorrelations
      );

      // Generate mood-based recommendations
      const moodBasedRecommendations = await this.generateMoodBasedRecommendations(
        spendingAnalysis, moodSpendingCorrelations
      );

      // Identify emotional spending patterns
      const emotionalSpendingPatterns = this.identifyEmotionalSpendingPatterns(
        moodSpendingCorrelations
      );

      // Generate predictive alerts
      const predictiveAlerts = this.generatePredictiveAlerts(
        moodSpendingCorrelations, spendingAnalysis
      );

      console.log('✅ Mood-enhanced analysis completed');

      return {
        ...spendingAnalysis,
        moodSpendingCorrelations,
        emotionalInsights,
        moodBasedRecommendations,
        emotionalSpendingPatterns,
        predictiveAlerts
      };

    } catch (error) {
      console.error('❌ Mood-enhanced analysis failed:', error);
      
      // Fallback to regular analysis if mood data is unavailable
      console.log('🔄 Falling back to regular spending analysis...');
      const regularAnalysis = await analyzeSpending(transactions);
      
      return {
        ...regularAnalysis,
        moodSpendingCorrelations: [],
        emotionalInsights: ['Mood data unavailable - analysis based on spending patterns only'],
        moodBasedRecommendations: ['Consider tracking your mood to get personalized insights'],
        emotionalSpendingPatterns: [],
        predictiveAlerts: []
      };
    }
  }

  /**
   * Generate emotional insights using your existing Gemini prompt
   */
  private async generateEmotionalInsights(
    spendingAnalysis: AnalysisResult,
    correlations: MoodSpendingCorrelation[]
  ): Promise<string[]> {
    const prompt = `
${SPENDING_ANALYSIS_PROMPT}

ADDITIONAL MOOD DATA:
${correlations.map(c => `- ${c.date}: Mood ${c.mood.toFixed(2)}, Spending $${c.spending.toFixed(2)}, Category: ${c.category}`).join('\n')}

Please analyze the correlation between mood and spending behavior. Focus on:
1. Emotional triggers for spending
2. Patterns between mood states and spending categories
3. Recommendations for emotional spending management
4. Positive emotional spending patterns to maintain

Respond with a JSON array of insight strings.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.warn('Failed to generate emotional insights, using fallback');
      return [
        'Mood data analysis unavailable - consider tracking your emotional state for personalized insights',
        'Spending patterns show typical behavior - mood tracking could reveal emotional triggers',
        'Regular spending analysis completed - add mood tracking for enhanced insights'
      ];
    }
  }

  /**
   * Generate mood-based recommendations
   */
  private async generateMoodBasedRecommendations(
    spendingAnalysis: AnalysisResult,
    correlations: MoodSpendingCorrelation[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Analyze mood-spending correlations
    const highCorrelationDays = correlations.filter(c => Math.abs(c.correlation) > 0.5);
    
    if (highCorrelationDays.length > 0) {
      recommendations.push('Consider setting spending limits on days when you\'re feeling particularly emotional');
    }

    // Analyze low mood spending
    const lowMoodDays = correlations.filter(c => c.mood < -0.5);
    if (lowMoodDays.length > 0) {
      recommendations.push('You tend to spend more when feeling down - consider alternative mood-boosting activities like exercise or calling a friend');
    }

    // Analyze high mood spending
    const highMoodDays = correlations.filter(c => c.mood > 0.5);
    if (highMoodDays.length > 0) {
      recommendations.push('You spend more when feeling good - this is normal, but ensure it stays within your budget');
    }

    // Analyze stress spending
    const stressDays = correlations.filter(c => c.correlation > 0.3);
    if (stressDays.length > 0) {
      recommendations.push('Consider stress management techniques before making purchases during high-stress periods');
    }

    return recommendations;
  }

  /**
   * Identify emotional spending patterns
   */
  private identifyEmotionalSpendingPatterns(
    correlations: MoodSpendingCorrelation[]
  ): EmotionalSpendingPattern[] {
    const patterns: EmotionalSpendingPattern[] = [];

    // Pattern 1: Emotional spending on low mood days
    const lowMoodDays = correlations.filter(c => c.mood < -0.5);
    if (lowMoodDays.length > 0) {
      patterns.push({
        pattern: 'Emotional Spending on Low Mood Days',
        description: `You tend to spend more when feeling down (${lowMoodDays.length} days identified)`,
        frequency: lowMoodDays.length,
        impact: 'negative',
        recommendation: 'Consider alternative mood-boosting activities like exercise, calling a friend, or engaging in hobbies'
      });
    }

    // Pattern 2: Positive mood spending
    const highMoodDays = correlations.filter(c => c.mood > 0.5);
    if (highMoodDays.length > 0) {
      patterns.push({
        pattern: 'Celebratory Spending on Good Mood Days',
        description: `You tend to spend more when feeling good (${highMoodDays.length} days identified)`,
        frequency: highMoodDays.length,
        impact: 'neutral',
        recommendation: 'This is normal behavior, but ensure it stays within your budget'
      });
    }

    // Pattern 3: Weekend mood spending
    const weekendDays = correlations.filter(c => {
      const day = new Date(c.date).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });

    if (weekendDays.length > 0) {
      const weekendMood = weekendDays.reduce((sum, c) => sum + c.mood, 0) / weekendDays.length;
      if (weekendMood > 0.5) {
        patterns.push({
          pattern: 'Weekend Mood Boost Spending',
          description: 'You tend to spend more on weekends when your mood is better',
          frequency: weekendDays.length,
          impact: 'positive',
          recommendation: 'Weekend spending is normal, but ensure it aligns with your financial goals'
        });
      }
    }

    return patterns;
  }

  /**
   * Generate predictive alerts for mood-spending patterns
   */
  private generatePredictiveAlerts(
    correlations: MoodSpendingCorrelation[],
    spendingAnalysis: AnalysisResult
  ): PredictiveAlert[] {
    const alerts: PredictiveAlert[] = [];

    // Alert 1: High correlation between mood and spending
    const highCorrelationDays = correlations.filter(c => Math.abs(c.correlation) > 0.7);
    if (highCorrelationDays.length > 0) {
      alerts.push({
        type: 'mood_spending',
        message: `Strong correlation detected between mood and spending on ${highCorrelationDays.length} days`,
        severity: 'medium',
        action: 'Consider setting spending limits on emotional days',
        timestamp: new Date().toISOString()
      });
    }

    // Alert 2: Low mood spending pattern
    const lowMoodDays = correlations.filter(c => c.mood < -0.5);
    if (lowMoodDays.length > 0) {
      alerts.push({
        type: 'emotional_trigger',
        message: 'You tend to spend more when feeling down - consider mood-boosting activities',
        severity: 'high',
        action: 'Try exercise, meditation, or calling a friend before making purchases',
        timestamp: new Date().toISOString()
      });
    }

    // Alert 3: Wellness reminder
    const stressDays = correlations.filter(c => c.correlation > 0.5);
    if (stressDays.length > 0) {
      alerts.push({
        type: 'wellness_reminder',
        message: 'High stress levels detected - consider stress management techniques',
        severity: 'medium',
        action: 'Try 10 minutes of meditation or deep breathing before making purchases',
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * Add a mood entry
   */
  async addMoodEntry(moodEntry: Omit<MoodEntry, 'id'>): Promise<MoodEntry> {
    return await this.moodService.addMoodEntry(moodEntry);
  }

  /**
   * Get mood entries for a user
   */
  async getMoodEntries(userId: string, startDate: string, endDate: string): Promise<MoodEntry[]> {
    return await this.moodService.getMoodEntries(userId, startDate, endDate);
  }

  /**
   * Initialize the mood database
   */
  async initializeMoodDatabase(): Promise<void> {
    return await this.moodService.initializeDatabase();
  }
}
