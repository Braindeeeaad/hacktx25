/**
 * Mood-Enhanced Analysis Test
 * Tests the integration of mood data with spending analysis
 */

import { MoodEnhancedAnalyzer } from './moodEnhancedAnalysis';
import { NessieAPIIntegration } from './nessieIntegration';
import { MoodEntry } from './moodTypes';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Display mood-enhanced analysis results
 */
function displayMoodEnhancedAnalysis(analysis: any) {
  console.log('\n' + '='.repeat(80));
  console.log('🧠 MOOD-ENHANCED FINANCIAL ANALYSIS');
  console.log('='.repeat(80));
  
  // Summary Section
  console.log('\n📊 FINANCIAL SUMMARY');
  console.log('-'.repeat(40));
  console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
  console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
  console.log(`📈 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);
  
  // Categories Section
  console.log('\n📊 CATEGORY ANALYSIS');
  console.log('-'.repeat(40));
  analysis.categories.forEach((category: any, index: number) => {
    console.log(`\n${index + 1}. ${category.category.toUpperCase()}`);
    console.log(`   Trend: ${category.trend.toUpperCase()}`);
    console.log(`   Change: ${category.change}`);
    console.log(`   AI Insight: ${category.note}`);
  });

  // Mood-Spending Correlations
  if (analysis.moodSpendingCorrelations && analysis.moodSpendingCorrelations.length > 0) {
    console.log('\n🧠 MOOD-SPENDING CORRELATIONS');
    console.log('-'.repeat(40));
    analysis.moodSpendingCorrelations.forEach((correlation: any, index: number) => {
      console.log(`\n${index + 1}. ${correlation.date}`);
      console.log(`   Mood: ${correlation.mood.toFixed(2)} (${correlation.mood > 0 ? '😊' : '😔'})`);
      console.log(`   Spending: $${correlation.spending.toFixed(2)}`);
      console.log(`   Category: ${correlation.category}`);
      console.log(`   Correlation: ${correlation.correlation.toFixed(2)}`);
    });
  }

  // Emotional Insights
  if (analysis.emotionalInsights && analysis.emotionalInsights.length > 0) {
    console.log('\n💡 EMOTIONAL INSIGHTS');
    console.log('-'.repeat(40));
    analysis.emotionalInsights.forEach((insight: string, index: number) => {
      console.log(`${index + 1}. ${insight}`);
    });
  }

  // Mood-Based Recommendations
  if (analysis.moodBasedRecommendations && analysis.moodBasedRecommendations.length > 0) {
    console.log('\n🎯 MOOD-BASED RECOMMENDATIONS');
    console.log('-'.repeat(40));
    analysis.moodBasedRecommendations.forEach((recommendation: string, index: number) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
  }

  // Emotional Spending Patterns
  if (analysis.emotionalSpendingPatterns && analysis.emotionalSpendingPatterns.length > 0) {
    console.log('\n🔄 EMOTIONAL SPENDING PATTERNS');
    console.log('-'.repeat(40));
    analysis.emotionalSpendingPatterns.forEach((pattern: any, index: number) => {
      console.log(`\n${index + 1}. ${pattern.pattern.toUpperCase()}`);
      console.log(`   Description: ${pattern.description}`);
      console.log(`   Frequency: ${pattern.frequency} occurrences`);
      console.log(`   Impact: ${pattern.impact.toUpperCase()}`);
      console.log(`   Recommendation: ${pattern.recommendation}`);
    });
  }

  // Predictive Alerts
  if (analysis.predictiveAlerts && analysis.predictiveAlerts.length > 0) {
    console.log('\n⚠️  PREDICTIVE ALERTS');
    console.log('-'.repeat(40));
    analysis.predictiveAlerts.forEach((alert: any, index: number) => {
      const severityIcon = alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢';
      console.log(`\n${index + 1}. ${severityIcon} ${alert.type.toUpperCase()}`);
      console.log(`   Message: ${alert.message}`);
      console.log(`   Action: ${alert.action}`);
    });
  }

  // Anomalies
  if (analysis.anomalies && analysis.anomalies.length > 0) {
    console.log('\n⚠️  ANOMALIES DETECTED');
    console.log('-'.repeat(40));
    analysis.anomalies.forEach((anomaly: any, index: number) => {
      console.log(`\n${index + 1}. ${anomaly.date} - ${anomaly.category}`);
      console.log(`   Amount: $${anomaly.amount}`);
      console.log(`   Reason: ${anomaly.reason}`);
    });
  }

  // Regular Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    console.log('\n💡 FINANCIAL RECOMMENDATIONS');
    console.log('-'.repeat(40));
    analysis.recommendations.forEach((recommendation: string, index: number) => {
      console.log(`${index + 1}. ${recommendation}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 MOOD-ENHANCED ANALYSIS COMPLETE');
  console.log('='.repeat(80));
}

/**
 * Test mood-enhanced analysis with Nessie data
 */
async function testMoodEnhancedAnalysis() {
  try {
    console.log('🚀 MOOD-ENHANCED ANALYSIS TEST');
    console.log('============================================================');
    console.log('🎯 Testing mood-enhanced analysis with Nessie API Data');
    console.log('This will analyze your spending data with mood correlations');
    
    // Initialize the mood-enhanced analyzer
    const analyzer = new MoodEnhancedAnalyzer();
    
    // Initialize mood database
    console.log('🔧 Initializing mood database...');
    await analyzer.initializeMoodDatabase();
    
    // Get Nessie data
    console.log('🔍 Fetching data from Nessie API...');
    const nessie = new NessieAPIIntegration(
      process.env.NESSIE_API_KEY!,
      process.env.NESSIE_CUSTOMER_ID!
    );
    
    const startDate = '2025-09-18';
    const endDate = '2025-10-18';
    const userId = 'test-user-123';
    
    console.log(`📅 Date Range: ${startDate} to ${endDate} (30 days)`);
    
    const transactions = await nessie.getAllTransactions(startDate, endDate);
    console.log(`📊 Found ${transactions.length} transactions from Nessie API`);
    
    // Add some sample mood data for testing
    console.log('🧠 Adding sample mood data for testing...');
    const sampleMoodEntries: Omit<MoodEntry, 'id'>[] = [
      {
        userId,
        date: '2025-09-20',
        mood: 'happy',
        energy: 'high',
        stress: 'low',
        notes: 'Great day at work',
        tags: ['work', 'productive']
      },
      {
        userId,
        date: '2025-09-25',
        mood: 'sad',
        energy: 'low',
        stress: 'high',
        notes: 'Feeling stressed about finances',
        tags: ['stress', 'money']
      },
      {
        userId,
        date: '2025-10-01',
        mood: 'very_happy',
        energy: 'very_high',
        stress: 'very_low',
        notes: 'Weekend celebration',
        tags: ['weekend', 'celebration']
      },
      {
        userId,
        date: '2025-10-10',
        mood: 'neutral',
        energy: 'medium',
        stress: 'medium',
        notes: 'Regular day',
        tags: ['routine']
      }
    ];
    
    for (const moodEntry of sampleMoodEntries) {
      await analyzer.addMoodEntry(moodEntry);
    }
    
    console.log('✅ Sample mood data added');
    
    // Perform mood-enhanced analysis
    console.log('🤖 Performing mood-enhanced analysis...');
    const analysis = await analyzer.analyzeWithMood(transactions, userId, startDate, endDate);
    
    // Display results
    displayMoodEnhancedAnalysis(analysis);
    
  } catch (error) {
    console.error('❌ Mood-enhanced analysis test failed:', error);
    console.error('Error details:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMoodEnhancedAnalysis();
}

export { testMoodEnhancedAnalysis, displayMoodEnhancedAnalysis };
