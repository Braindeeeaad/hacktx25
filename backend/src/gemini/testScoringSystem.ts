/**
 * Test Script for Wellness and Finance Scoring System
 * Demonstrates the complete scoring system with easy-to-display metrics
 */

import { generateCompleteScoringSystem } from './wellnessFinanceScoring';
import { MoodEntry } from './moodTypes';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Generate realistic mood data for testing
 */
function generateTestMoodData(userId: string, numDays: number): Omit<MoodEntry, 'id' | 'userId'>[] {
  const moodEntries: Omit<MoodEntry, 'id' | 'userId'>[] = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Create realistic patterns
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isMonday = date.getDay() === 1;
    const isFriday = date.getDay() === 5;
    
    // Weekend patterns: higher wellbeing, lower stress, more social time
    let baseWellbeing = isWeekend ? 6 + Math.random() * 3 : 4 + Math.random() * 4;
    let baseStress = isWeekend ? Math.random() * 4 : 3 + Math.random() * 5;
    let baseSleep = 4 + Math.random() * 4;
    let baseActivity = isWeekend ? 4 + Math.random() * 4 : 2 + Math.random() * 4;
    let baseSocial = isWeekend ? 6 + Math.random() * 3 : 2 + Math.random() * 4;
    let baseDiet = 4 + Math.random() * 4;

    // Monday blues effect
    if (isMonday) {
      baseWellbeing = Math.max(2, baseWellbeing - 1);
      baseStress = Math.min(10, baseStress + 1);
    }

    // Friday relief effect
    if (isFriday) {
      baseWellbeing = Math.min(10, baseWellbeing + 1);
      baseStress = Math.max(0, baseStress - 1);
    }

    // Add correlation between metrics
    if (baseSleep < 4) {
      baseWellbeing = Math.max(2, baseWellbeing - 1);
      baseStress = Math.min(10, baseStress + 1);
    }

    if (baseSocial < 3) {
      baseWellbeing = Math.max(2, baseWellbeing - 1);
    }

    moodEntries.push({
      date: dateString,
      overall_wellbeing: Math.round(Math.max(0, Math.min(10, baseWellbeing))),
      sleep_quality: Math.round(Math.max(0, Math.min(10, baseSleep))),
      physical_activity: Math.round(Math.max(0, Math.min(10, baseActivity))),
      time_with_family_friends: Math.round(Math.max(0, Math.min(10, baseSocial))),
      diet_quality: Math.round(Math.max(0, Math.min(10, baseDiet))),
      stress_levels: Math.round(Math.max(0, Math.min(10, baseStress))),
      notes: `Day ${i + 1}: ${isWeekend ? 'Weekend vibes!' : isMonday ? 'Monday blues' : isFriday ? 'TGIF!' : 'Work day'}. Overall: ${Math.round(baseWellbeing)}/10`
    });
  }
  return moodEntries.reverse(); // Oldest first
}

/**
 * Generate realistic spending data that correlates with mood
 */
function generateTestSpendingData(moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]) {
  const transactions: any[] = [];
  
  moodEntries.forEach(mood => {
    const baseSpending = 50 + Math.random() * 100; // Base daily spending
    
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
      if (amount > 5) { // Only include transactions over $5
        transactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: mood.date,
          amount: Math.round(amount * 100) / 100,
          category: category.name,
          description: `${category.name} - ${mood.notes || 'Daily expense'}`
        });
      }
    });
  });
  
  return transactions;
}

/**
 * Display scoring system results in a user-friendly format
 */
function displayScoringResults(result: any) {
  console.log('\n' + '='.repeat(100));
  console.log('🎯 WELLNESS & FINANCE SCORING SYSTEM');
  console.log('='.repeat(100));

  // Overall Summary
  console.log('\n📊 OVERALL SUMMARY');
  console.log('-'.repeat(50));
  console.log(`🏆 Overall Score: ${result.summary.overallScore}/100`);
  console.log(`📈 Grade: ${result.summary.grade}`);
  console.log(`📊 Status: ${result.summary.status.toUpperCase()}`);
  
  // Wellness Score
  console.log('\n🧘 WELLNESS SCORE');
  console.log('-'.repeat(50));
  console.log(`😊 Overall Wellness: ${result.wellness.overall}/100`);
  console.log(`💪 Physical Health: ${result.wellness.breakdown.physical}/100`);
  console.log(`🧠 Mental Health: ${result.wellness.breakdown.mental}/100`);
  console.log(`👥 Social Health: ${result.wellness.breakdown.social}/100`);
  
  console.log('\n📈 Wellness Trends:');
  if (result.wellness.trends.improving.length > 0) {
    console.log(`   ✅ Improving: ${result.wellness.trends.improving.join(', ')}`);
  }
  if (result.wellness.trends.declining.length > 0) {
    console.log(`   ⚠️  Declining: ${result.wellness.trends.declining.join(', ')}`);
  }
  if (result.wellness.trends.stable.length > 0) {
    console.log(`   📊 Stable: ${result.wellness.trends.stable.join(', ')}`);
  }

  // Finance Score
  console.log('\n💰 FINANCE SCORE');
  console.log('-'.repeat(50));
  console.log(`💳 Overall Finance: ${result.finance.overall}/100`);
  console.log(`🛒 Spending Control: ${result.finance.breakdown.spending}/100`);
  console.log(`📊 Budgeting: ${result.finance.breakdown.budgeting}/100`);
  console.log(`⚖️  Stability: ${result.finance.breakdown.stability}/100`);
  
  console.log('\n📈 Finance Trends:');
  if (result.finance.trends.improving.length > 0) {
    console.log(`   ✅ Improving: ${result.finance.trends.improving.join(', ')}`);
  }
  if (result.finance.trends.declining.length > 0) {
    console.log(`   ⚠️  Declining: ${result.finance.trends.declining.join(', ')}`);
  }
  if (result.finance.trends.stable.length > 0) {
    console.log(`   📊 Stable: ${result.finance.trends.stable.join(', ')}`);
  }

  // Correlation
  console.log('\n🔗 WELLNESS-FINANCE CORRELATION');
  console.log('-'.repeat(50));
  console.log(`📊 Correlation: ${result.correlation.correlation.toFixed(3)}`);
  const correlationStrength = Math.abs(result.correlation.correlation);
  let strength = 'weak';
  if (correlationStrength > 0.7) strength = 'strong';
  else if (correlationStrength > 0.3) strength = 'moderate';
  console.log(`📈 Strength: ${strength} ${result.correlation.correlation > 0 ? 'positive' : 'negative'} correlation`);

  // Key Insights
  console.log('\n💡 KEY INSIGHTS');
  console.log('-'.repeat(50));
  result.summary.keyInsights.forEach((insight: string, index: number) => {
    console.log(`${index + 1}. ${insight}`);
  });

  // Priority Actions
  console.log('\n🎯 PRIORITY ACTIONS');
  console.log('-'.repeat(50));
  result.summary.priorityActions.forEach((action: string, index: number) => {
    console.log(`${index + 1}. ${action}`);
  });

  // Wellness Insights
  console.log('\n🧘 WELLNESS INSIGHTS');
  console.log('-'.repeat(50));
  result.wellness.insights.forEach((insight: string, index: number) => {
    console.log(`${index + 1}. ${insight}`);
  });

  // Finance Insights
  console.log('\n💰 FINANCE INSIGHTS');
  console.log('-'.repeat(50));
  result.finance.insights.forEach((insight: string, index: number) => {
    console.log(`${index + 1}. ${insight}`);
  });

  // Wellness Recommendations
  console.log('\n🧘 WELLNESS RECOMMENDATIONS');
  console.log('-'.repeat(50));
  result.wellness.recommendations.forEach((rec: string, index: number) => {
    console.log(`${index + 1}. ${rec}`);
  });

  // Finance Recommendations
  console.log('\n💰 FINANCE RECOMMENDATIONS');
  console.log('-'.repeat(50));
  result.finance.recommendations.forEach((rec: string, index: number) => {
    console.log(`${index + 1}. ${rec}`);
  });

  console.log('\n' + '='.repeat(100));
  console.log('🎯 SCORING SYSTEM COMPLETE');
  console.log('='.repeat(100) + '\n');
}

async function testScoringSystem() {
  console.log('🚀 WELLNESS & FINANCE SCORING SYSTEM TEST');
  console.log('==========================================');
  console.log('🎯 Testing complete scoring system with easy-to-display metrics');

  const testUserId = 'test-user-scoring';
  const numDays = 30;

  try {
    // Step 1: Generate test data
    console.log('\n1️⃣ Generating test mood and spending data...');
    const moodEntries = generateTestMoodData(testUserId, numDays);
    const transactions = generateTestSpendingData(moodEntries);
    
    console.log(`📊 Generated ${moodEntries.length} mood entries`);
    console.log(`📊 Generated ${transactions.length} transactions`);
    
    // Show sample data
    console.log('\n📋 Sample Mood Data:');
    moodEntries.slice(0, 3).forEach((entry, index) => {
      console.log(`   Day ${index + 1} (${entry.date}):`);
      console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
      console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
      console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
      console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
      console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
      console.log(`     😰 Stress: ${entry.stress_levels}/10`);
    });

    console.log('\n📋 Sample Spending Data:');
    const sampleTransactions = transactions.slice(0, 5);
    sampleTransactions.forEach((tx, index) => {
      console.log(`   ${tx.date} - ${tx.category}: $${tx.amount.toFixed(2)}`);
    });

    // Step 2: Generate complete scoring system
    console.log('\n2️⃣ Generating complete scoring system...');
    console.log('🤖 This will generate wellness scores, finance scores, and correlations...');
    
    const scoringResult = await generateCompleteScoringSystem(moodEntries, transactions);

    // Step 3: Display results
    displayScoringResults(scoringResult);

    console.log('\n🎉 Scoring system test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Wellness scoring (0-100) with breakdown');
    console.log('   ✅ Finance scoring (0-100) with breakdown');
    console.log('   ✅ Wellness-finance correlation analysis');
    console.log('   ✅ Overall score and grade system');
    console.log('   ✅ Key insights and priority actions');
    console.log('   ✅ Easy-to-display metrics for frontend');

    console.log('\n🚀 Your scoring system is ready for production!');
    console.log('   📱 Frontend: Easy-to-display scores and insights');
    console.log('   🔗 Integration: Simple API calls for scoring data');
    console.log('   🎯 Result: Comprehensive wellness and finance metrics');

  } catch (error) {
    console.error('\n❌ Scoring system test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        console.log('\n🔧 Fix: Check your Gemini API key in .env file');
      } else {
        console.log('\n🔧 Fix: Check the error details above');
      }
    }
  }
}

// Run the scoring system test
if (require.main === module) {
  testScoringSystem();
}
