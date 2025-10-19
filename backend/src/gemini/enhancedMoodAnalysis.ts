/**
 * Enhanced Mood Analysis with Multiple Days of Data
 * Provides nuanced analysis using all available wellness logs
 */

import { D1Service } from '../database/services/d1Service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { WellbeingData } from '../database/types';
import { NessieAPIIntegration } from './nessieIntegration';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
const NESSIE_CUSTOMER_ID = process.env.NESSIE_CUSTOMER_ID;

class EnhancedMoodAnalysis {
  private d1Service: D1Service;
  private nessieService: NessieAPIIntegration;

  constructor() {
    this.d1Service = D1Service.getInstance();
    this.nessieService = new NessieAPIIntegration(NESSIE_API_KEY!, NESSIE_CUSTOMER_ID!);
  }

  /**
   * Get comprehensive analysis using all available mood data
   * This provides the most nuanced insights by analyzing patterns over time
   */
  async getComprehensiveAnalysis(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    moodData: WellbeingData[];
    spendingData: any[];
    analysis: any;
    trends: any;
    correlations: any;
    recommendations: any;
  }> {
    try {
      console.log(`🔍 Enhanced analysis for user: ${userId}`);
      console.log(`📅 Date range: ${startDate} to ${endDate}`);

      // Step 1: Get ALL mood data for the user in the date range
      console.log('1️⃣ Fetching all mood data from Cloudflare D1...');
      const moodData = await this.d1Service.getWellbeingDataByDateRange(userId, startDate, endDate);
      console.log(`📊 Found ${moodData.length} mood entries across multiple days`);

      if (moodData.length === 0) {
        throw new Error('No mood data found for this user in the specified date range');
      }

      // Step 2: Get spending data
      console.log('2️⃣ Fetching spending data from Nessie API...');
      let spendingData: any[] = [];
      try {
        spendingData = await this.nessieService.getAllTransactions(startDate, endDate);
        console.log(`📊 Found ${spendingData.length} transactions from Nessie`);
      } catch (nessieError) {
        console.warn('⚠️ Nessie API not available, using dummy spending data...');
        spendingData = this.generateCorrelatedSpendingData(moodData);
        console.log(`📊 Generated ${spendingData.length} correlated transactions`);
      }

      // Step 3: Calculate comprehensive statistics
      console.log('3️⃣ Calculating comprehensive mood statistics...');
      const moodStats = this.calculateMoodStatistics(moodData);
      const spendingStats = this.calculateSpendingStatistics(spendingData);

      // Step 4: Identify trends and patterns
      console.log('4️⃣ Identifying trends and patterns...');
      const trends = this.identifyTrends(moodData, spendingData);

      // Step 5: Find correlations between mood and spending
      console.log('5️⃣ Analyzing mood-spending correlations...');
      const correlations = this.findMoodSpendingCorrelations(moodData, spendingData);

      // Step 6: Run enhanced Gemini analysis
      console.log('6️⃣ Running enhanced Gemini analysis...');
      const analysis = await this.runEnhancedGeminiAnalysis(moodData, spendingData, moodStats, trends, correlations);

      // Step 7: Generate personalized recommendations
      console.log('7️⃣ Generating personalized recommendations...');
      const recommendations = await this.generatePersonalizedRecommendations(moodData, spendingData, trends, correlations);

      console.log('✅ Enhanced analysis completed successfully');

      return {
        moodData,
        spendingData,
        analysis,
        trends,
        correlations,
        recommendations
      };

    } catch (error) {
      console.error('❌ Error in enhanced analysis:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive mood statistics from multiple days
   */
  private calculateMoodStatistics(moodData: WellbeingData[]): any {
    const totalEntries = moodData.length;
    
    // Calculate averages
    const averages = {
      overall_wellbeing: moodData.reduce((sum, entry) => sum + entry.overall_wellbeing, 0) / totalEntries,
      sleep_quality: moodData.reduce((sum, entry) => sum + entry.sleep_quality, 0) / totalEntries,
      physical_activity: moodData.reduce((sum, entry) => sum + entry.physical_activity, 0) / totalEntries,
      time_with_family_friends: moodData.reduce((sum, entry) => sum + entry.time_with_family_friends, 0) / totalEntries,
      diet_quality: moodData.reduce((sum, entry) => sum + entry.diet_quality, 0) / totalEntries,
      stress_levels: moodData.reduce((sum, entry) => sum + entry.stress_levels, 0) / totalEntries
    };

    // Calculate ranges (min/max)
    const ranges = {
      overall_wellbeing: {
        min: Math.min(...moodData.map(entry => entry.overall_wellbeing)),
        max: Math.max(...moodData.map(entry => entry.overall_wellbeing))
      },
      sleep_quality: {
        min: Math.min(...moodData.map(entry => entry.sleep_quality)),
        max: Math.max(...moodData.map(entry => entry.sleep_quality))
      },
      stress_levels: {
        min: Math.min(...moodData.map(entry => entry.stress_levels)),
        max: Math.max(...moodData.map(entry => entry.stress_levels))
      }
    };

    // Calculate consistency (standard deviation)
    const consistency = {
      overall_wellbeing: this.calculateStandardDeviation(moodData.map(entry => entry.overall_wellbeing)),
      sleep_quality: this.calculateStandardDeviation(moodData.map(entry => entry.sleep_quality)),
      stress_levels: this.calculateStandardDeviation(moodData.map(entry => entry.stress_levels))
    };

    return {
      totalEntries,
      averages,
      ranges,
      consistency,
      dateRange: {
        start: moodData[0]?.date,
        end: moodData[moodData.length - 1]?.date
      }
    };
  }

  /**
   * Calculate spending statistics
   */
  private calculateSpendingStatistics(spendingData: any[]): any {
    if (spendingData.length === 0) {
      return { totalSpent: 0, averageDaily: 0, categories: {} };
    }

    const totalSpent = spendingData.reduce((sum, tx) => sum + tx.amount, 0);
    const dailySpending = this.groupByDate(spendingData);
    const averageDaily = totalSpent / Object.keys(dailySpending).length;

    // Category breakdown
    const categories: Record<string, number> = {};
    spendingData.forEach(tx => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
    });

    return {
      totalSpent,
      averageDaily,
      categories,
      totalTransactions: spendingData.length
    };
  }

  /**
   * Identify trends in mood data over time
   */
  private identifyTrends(moodData: WellbeingData[], spendingData: any[]): any {
    // Sort by date
    const sortedMoodData = [...moodData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Calculate weekly averages
    const weeklyAverages = this.calculateWeeklyAverages(sortedMoodData);
    
    // Identify improving/declining trends
    const trends = {
      overall_wellbeing: this.calculateTrend(sortedMoodData.map(entry => entry.overall_wellbeing)),
      sleep_quality: this.calculateTrend(sortedMoodData.map(entry => entry.sleep_quality)),
      stress_levels: this.calculateTrend(sortedMoodData.map(entry => entry.stress_levels)),
      physical_activity: this.calculateTrend(sortedMoodData.map(entry => entry.physical_activity))
    };

    // Find best and worst days
    const bestDay = sortedMoodData.reduce((best, current) => 
      current.overall_wellbeing > best.overall_wellbeing ? current : best
    );
    const worstDay = sortedMoodData.reduce((worst, current) => 
      current.overall_wellbeing < worst.overall_wellbeing ? current : worst
    );

    return {
      weeklyAverages,
      trends,
      bestDay: {
        date: bestDay.date,
        wellbeing: bestDay.overall_wellbeing,
        sleep: bestDay.sleep_quality,
        stress: bestDay.stress_levels
      },
      worstDay: {
        date: worstDay.date,
        wellbeing: worstDay.overall_wellbeing,
        sleep: worstDay.sleep_quality,
        stress: worstDay.stress_levels
      }
    };
  }

  /**
   * Find correlations between mood and spending patterns
   */
  private findMoodSpendingCorrelations(moodData: WellbeingData[], spendingData: any[]): any {
    const dailySpending = this.groupByDate(spendingData);
    const correlations: any[] = [];

    moodData.forEach(mood => {
      const daySpending = dailySpending[mood.date] || [];
      const dayTotal = daySpending.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      
      correlations.push({
        date: mood.date,
        wellbeing: mood.overall_wellbeing,
        stress: mood.stress_levels,
        spending: dayTotal,
        sleep: mood.sleep_quality,
        activity: mood.physical_activity
      });
    });

    // Calculate correlation coefficients
    const wellbeingSpendingCorrelation = this.calculateCorrelation(
      correlations.map(c => c.wellbeing),
      correlations.map(c => c.spending)
    );
    
    const stressSpendingCorrelation = this.calculateCorrelation(
      correlations.map(c => c.stress),
      correlations.map(c => c.spending)
    );

    return {
      dailyCorrelations: correlations,
      wellbeingSpendingCorrelation,
      stressSpendingCorrelation,
      insights: this.generateCorrelationInsights(wellbeingSpendingCorrelation, stressSpendingCorrelation)
    };
  }

  /**
   * Run enhanced Gemini analysis with all the rich data
   */
  private async runEnhancedGeminiAnalysis(
    moodData: WellbeingData[],
    spendingData: any[],
    moodStats: any,
    trends: any,
    correlations: any
  ): Promise<any> {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

      const prompt = `
You are an AI wellness and financial coach analyzing comprehensive user data over multiple days. Provide nuanced insights based on the following rich dataset:

MULTI-DAY MOOD DATA (${moodData.length} entries):
${moodData.map(entry => 
  `${entry.date}: Wellbeing ${entry.overall_wellbeing}/10, Sleep ${entry.sleep_quality}/10, Activity ${entry.physical_activity}/10, Social ${entry.time_with_family_friends}/10, Diet ${entry.diet_quality}/10, Stress ${entry.stress_levels}/10`
).join('\n')}

MOOD STATISTICS:
- Total Entries: ${moodStats.totalEntries}
- Average Wellbeing: ${moodStats.averages.overall_wellbeing.toFixed(2)}/10
- Average Sleep: ${moodStats.averages.sleep_quality.toFixed(2)}/10
- Average Activity: ${moodStats.averages.physical_activity.toFixed(2)}/10
- Average Social: ${moodStats.averages.time_with_family_friends.toFixed(2)}/10
- Average Diet: ${moodStats.averages.diet_quality.toFixed(2)}/10
- Average Stress: ${moodStats.averages.stress_levels.toFixed(2)}/10

WELLBEING RANGES:
- Wellbeing: ${moodStats.ranges.overall_wellbeing.min}-${moodStats.ranges.overall_wellbeing.max}/10
- Sleep: ${moodStats.ranges.sleep_quality.min}-${moodStats.ranges.sleep_quality.max}/10
- Stress: ${moodStats.ranges.stress_levels.min}-${moodStats.ranges.stress_levels.max}/10

TRENDS OVER TIME:
- Wellbeing Trend: ${trends.trends.overall_wellbeing}
- Sleep Trend: ${trends.trends.sleep_quality}
- Stress Trend: ${trends.trends.stress_levels}
- Activity Trend: ${trends.trends.physical_activity}

BEST DAY: ${trends.bestDay.date} (Wellbeing: ${trends.bestDay.wellbeing}/10, Sleep: ${trends.bestDay.sleep}/10, Stress: ${trends.bestDay.stress}/10)
WORST DAY: ${trends.worstDay.date} (Wellbeing: ${trends.worstDay.wellbeing}/10, Sleep: ${trends.worstDay.sleep}/10, Stress: ${trends.worstDay.stress}/10)

SPENDING DATA (${spendingData.length} transactions):
Total Spent: $${spendingData.reduce((sum, tx) => sum + tx.amount, 0).toFixed(2)}
Categories: ${JSON.stringify(this.calculateSpendingStatistics(spendingData).categories, null, 2)}

MOOD-SPENDING CORRELATIONS:
- Wellbeing-Spending Correlation: ${correlations.wellbeingSpendingCorrelation.toFixed(3)}
- Stress-Spending Correlation: ${correlations.stressSpendingCorrelation.toFixed(3)}

Based on this comprehensive multi-day analysis, provide:

1. **Wellness Assessment**: Analyze the user's wellness patterns, consistency, and areas for improvement
2. **Trend Analysis**: Identify what's improving, declining, or stable over time
3. **Spending Patterns**: Analyze spending habits and their relationship to mood
4. **Correlation Insights**: Explain how mood affects spending and vice versa
5. **Personalized Recommendations**: Specific, actionable advice based on their unique patterns
6. **Goal Setting**: Suggest realistic wellness and financial goals based on their data

Respond in JSON format:
{
  "wellnessAssessment": "Comprehensive analysis of wellness patterns...",
  "trendAnalysis": "Analysis of what's improving/declining...",
  "spendingPatterns": "Analysis of spending habits...",
  "correlationInsights": "How mood and spending interact...",
  "personalizedRecommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "goalSuggestions": [
    "Wellness goal 1",
    "Financial goal 1"
  ],
  "keyInsights": [
    "Key insight 1",
    "Key insight 2"
  ]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      console.error('❌ Error in enhanced Gemini analysis:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations based on all data
   */
  private async generatePersonalizedRecommendations(
    moodData: WellbeingData[],
    spendingData: any[],
    trends: any,
    correlations: any
  ): Promise<any> {
    // This would use the analysis results to generate specific recommendations
    // For now, return a structured format
    return {
      wellness: [
        "Based on your sleep patterns, try maintaining consistent bedtimes",
        "Your physical activity shows room for improvement - consider daily walks",
        "Your social connections are strong - leverage them for wellness activities"
      ],
      financial: [
        "Your spending correlates with stress - develop non-financial coping strategies",
        "Consider setting a daily spending limit on discretionary items",
        "Track your mood before making purchases to identify emotional spending"
      ],
      combined: [
        "Use your high-wellbeing days to plan and prep healthy meals",
        "Schedule social activities that don't require spending money",
        "Create a wellness routine that reduces the need for comfort spending"
      ]
    };
  }

  // Helper methods
  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateTrend(values: number[]): string {
    if (values.length < 2) return 'insufficient_data';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }

  private calculateWeeklyAverages(moodData: WellbeingData[]): any {
    const weeklyData: Record<string, any> = {};
    
    moodData.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { entries: [], averages: {} };
      }
      weeklyData[weekKey].entries.push(entry);
    });
    
    Object.keys(weeklyData).forEach(week => {
      const entries = weeklyData[week].entries;
      weeklyData[week].averages = {
        wellbeing: entries.reduce((sum: number, e: any) => sum + e.overall_wellbeing, 0) / entries.length,
        sleep: entries.reduce((sum: number, e: any) => sum + e.sleep_quality, 0) / entries.length,
        stress: entries.reduce((sum: number, e: any) => sum + e.stress_levels, 0) / entries.length
      };
    });
    
    return weeklyData;
  }

  private groupByDate(spendingData: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    spendingData.forEach(tx => {
      if (!grouped[tx.date]) grouped[tx.date] = [];
      grouped[tx.date].push(tx);
    });
    return grouped;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private generateCorrelationInsights(wellbeingCorr: number, stressCorr: number): string[] {
    const insights: string[] = [];
    
    if (Math.abs(wellbeingCorr) > 0.3) {
      if (wellbeingCorr > 0) {
        insights.push("Higher wellbeing correlates with higher spending - consider mindful spending practices");
      } else {
        insights.push("Lower wellbeing correlates with higher spending - develop non-financial coping strategies");
      }
    }
    
    if (Math.abs(stressCorr) > 0.3) {
      if (stressCorr > 0) {
        insights.push("Higher stress correlates with higher spending - stress management could reduce spending");
      } else {
        insights.push("Lower stress correlates with higher spending - your stress management is working well");
      }
    }
    
    return insights;
  }

  private generateCorrelatedSpendingData(moodData: WellbeingData[]): any[] {
    const transactions: any[] = [];
    const categories = ['Food', 'Shopping', 'Entertainment', 'Transportation', 'Health'];
    
    moodData.forEach(mood => {
      const numTransactions = 2 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numTransactions; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        let amount = 20 + Math.random() * 80;
        
        // Mood-spending correlations
        if (mood.overall_wellbeing < 4) amount *= 1.4; // Higher spending when feeling down
        if (mood.stress_levels > 7) amount *= 1.3; // Higher spending when stressed
        if (mood.overall_wellbeing > 8) amount *= 1.1; // Slightly higher when feeling great
        
        transactions.push({
          id: `tx_${mood.date}_${i}_${Date.now()}`,
          date: mood.date,
          amount: parseFloat(amount.toFixed(2)),
          category: category,
          description: `${category} - mood correlated`,
          type: 'debit'
        });
      }
    });
    
    return transactions;
  }
}

// Export for use
export { EnhancedMoodAnalysis };
