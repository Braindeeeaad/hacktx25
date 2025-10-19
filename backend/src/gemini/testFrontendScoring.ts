/**
 * Frontend Scoring API Test
 * Demonstrates how the frontend can easily access wellness and finance scores
 */

import { getScoringSystem, getQuickScores, getWellnessScore, getFinanceScore } from './scoringAPI';
import { MoodEntry } from './moodTypes';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Generate test data
 */
function generateTestData() {
  const moodEntries: Omit<MoodEntry, 'id' | 'userId'>[] = [];
  const transactions: any[] = [];
  const today = new Date();

  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Generate mood data
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseWellbeing = isWeekend ? 6 + Math.random() * 3 : 4 + Math.random() * 4;
    const baseStress = isWeekend ? Math.random() * 4 : 3 + Math.random() * 5;
    const baseSleep = 4 + Math.random() * 4;
    const baseActivity = isWeekend ? 4 + Math.random() * 4 : 2 + Math.random() * 4;
    const baseSocial = isWeekend ? 6 + Math.random() * 3 : 2 + Math.random() * 4;
    const baseDiet = 4 + Math.random() * 4;

    moodEntries.push({
      date: dateString,
      overall_wellbeing: Math.round(Math.max(0, Math.min(10, baseWellbeing))),
      sleep_quality: Math.round(Math.max(0, Math.min(10, baseSleep))),
      physical_activity: Math.round(Math.max(0, Math.min(10, baseActivity))),
      time_with_family_friends: Math.round(Math.max(0, Math.min(10, baseSocial))),
      diet_quality: Math.round(Math.max(0, Math.min(10, baseDiet))),
      stress_levels: Math.round(Math.max(0, Math.min(10, baseStress))),
      notes: `Day ${i + 1}`
    });

    // Generate spending data
    const baseSpending = 50 + Math.random() * 100;
    let moodMultiplier = 1;
    if (baseWellbeing < 4) moodMultiplier = 1.3;
    if (baseStress > 7) moodMultiplier *= 1.2;
    if (baseSleep < 4) moodMultiplier *= 1.15;
    if (baseSocial < 3) moodMultiplier *= 1.25;

    const dailySpending = baseSpending * moodMultiplier;
    
    const categories = [
      { name: 'Food', amount: dailySpending * 0.4 },
      { name: 'Entertainment', amount: dailySpending * 0.2 },
      { name: 'Shopping', amount: dailySpending * 0.15 },
      { name: 'Transportation', amount: dailySpending * 0.1 },
      { name: 'Health', amount: dailySpending * 0.1 },
      { name: 'Utilities', amount: dailySpending * 0.05 }
    ];
    
    categories.forEach(category => {
      if (category.amount > 5) {
        transactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: dateString,
          amount: Math.round(category.amount * 100) / 100,
          category: category.name,
          description: `${category.name} expense`
        });
      }
    });
  }

  return { moodEntries, transactions };
}

/**
 * Display frontend-friendly scoring results
 */
function displayFrontendResults(result: any) {
  console.log('\n' + '='.repeat(80));
  console.log('📱 FRONTEND SCORING RESULTS');
  console.log('='.repeat(80));

  // Overall Summary
  console.log('\n🏆 OVERALL SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Overall Score: ${result.overallScore}/100`);
  console.log(`Grade: ${result.overallGrade}`);
  console.log(`Status: ${result.overallStatus.toUpperCase()}`);

  // Scores
  console.log('\n📊 SCORES');
  console.log('-'.repeat(40));
  console.log(`Wellness: ${result.wellnessScore}/100`);
  console.log(`Finance: ${result.financeScore}/100`);

  // Wellness Breakdown
  console.log('\n🧘 WELLNESS BREAKDOWN');
  console.log('-'.repeat(40));
  console.log(`Physical: ${result.wellnessBreakdown.physical}/100`);
  console.log(`Mental: ${result.wellnessBreakdown.mental}/100`);
  console.log(`Social: ${result.wellnessBreakdown.social}/100`);

  // Finance Breakdown
  console.log('\n💰 FINANCE BREAKDOWN');
  console.log('-'.repeat(40));
  console.log(`Spending: ${result.financeBreakdown.spending}/100`);
  console.log(`Budgeting: ${result.financeBreakdown.budgeting}/100`);
  console.log(`Stability: ${result.financeBreakdown.stability}/100`);

  // Key Metrics
  console.log('\n📈 KEY METRICS');
  console.log('-'.repeat(40));
  console.log(`Correlation: ${result.keyMetrics.correlation.toFixed(3)}`);
  console.log(`Spending Consistency: ${result.keyMetrics.spendingConsistency.toFixed(1)}/100`);
  console.log(`Stress Level: ${result.keyMetrics.stressLevel.toFixed(1)}/10`);
  console.log(`Social Connection: ${result.keyMetrics.socialConnection.toFixed(1)}/10`);

  // Top Insights
  console.log('\n💡 TOP INSIGHTS');
  console.log('-'.repeat(40));
  result.topInsights.forEach((insight: string, index: number) => {
    console.log(`${index + 1}. ${insight}`);
  });

  // Top Actions
  console.log('\n🎯 TOP ACTIONS');
  console.log('-'.repeat(40));
  result.topActions.forEach((action: string, index: number) => {
    console.log(`${index + 1}. ${action}`);
  });

  // Trends
  console.log('\n📈 TRENDS');
  console.log('-'.repeat(40));
  console.log('Wellness:');
  if (result.trends.wellness.improving.length > 0) {
    console.log(`  ✅ Improving: ${result.trends.wellness.improving.join(', ')}`);
  }
  if (result.trends.wellness.declining.length > 0) {
    console.log(`  ⚠️  Declining: ${result.trends.wellness.declining.join(', ')}`);
  }
  if (result.trends.wellness.stable.length > 0) {
    console.log(`  📊 Stable: ${result.trends.wellness.stable.join(', ')}`);
  }
  
  console.log('Finance:');
  if (result.trends.finance.improving.length > 0) {
    console.log(`  ✅ Improving: ${result.trends.finance.improving.join(', ')}`);
  }
  if (result.trends.finance.declining.length > 0) {
    console.log(`  ⚠️  Declining: ${result.trends.finance.declining.join(', ')}`);
  }
  if (result.trends.finance.stable.length > 0) {
    console.log(`  📊 Stable: ${result.trends.finance.stable.join(', ')}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📱 FRONTEND RESULTS COMPLETE');
  console.log('='.repeat(80) + '\n');
}

async function testFrontendScoring() {
  console.log('🚀 FRONTEND SCORING API TEST');
  console.log('============================');
  console.log('🎯 Testing easy-to-use scoring API for frontend integration');

  try {
    // Generate test data
    console.log('\n1️⃣ Generating test data...');
    const { moodEntries, transactions } = generateTestData();
    console.log(`📊 Generated ${moodEntries.length} mood entries and ${transactions.length} transactions`);

    // Test 1: Complete scoring system
    console.log('\n2️⃣ Testing complete scoring system...');
    const completeResult = await getScoringSystem(moodEntries, transactions);
    displayFrontendResults(completeResult);

    // Test 2: Quick scores only
    console.log('\n3️⃣ Testing quick scores...');
    const quickScores = await getQuickScores(moodEntries, transactions);
    console.log('\n🏆 QUICK SCORES');
    console.log('-'.repeat(40));
    console.log(`Overall: ${quickScores.overallScore}/100 (${quickScores.overallGrade})`);
    console.log(`Wellness: ${quickScores.wellnessScore}/100`);
    console.log(`Finance: ${quickScores.financeScore}/100`);
    console.log(`Status: ${quickScores.overallStatus.toUpperCase()}`);

    // Test 3: Wellness score only
    console.log('\n4️⃣ Testing wellness score only...');
    const wellnessScore = await getWellnessScore(moodEntries);
    console.log('\n🧘 WELLNESS SCORE');
    console.log('-'.repeat(40));
    console.log(`Overall: ${wellnessScore.overall}/100`);
    console.log(`Physical: ${wellnessScore.breakdown.physical}/100`);
    console.log(`Mental: ${wellnessScore.breakdown.mental}/100`);
    console.log(`Social: ${wellnessScore.breakdown.social}/100`);

    // Test 4: Finance score only
    console.log('\n5️⃣ Testing finance score only...');
    const financeScore = await getFinanceScore(transactions);
    console.log('\n💰 FINANCE SCORE');
    console.log('-'.repeat(40));
    console.log(`Overall: ${financeScore.overall}/100`);
    console.log(`Spending: ${financeScore.breakdown.spending}/100`);
    console.log(`Budgeting: ${financeScore.breakdown.budgeting}/100`);
    console.log(`Stability: ${financeScore.breakdown.stability}/100`);

    console.log('\n🎉 Frontend scoring API test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Complete scoring system with all metrics');
    console.log('   ✅ Quick scores for dashboard display');
    console.log('   ✅ Individual wellness and finance scores');
    console.log('   ✅ Easy-to-use API for frontend integration');
    console.log('   ✅ Structured data for UI components');

    console.log('\n🚀 Your frontend scoring API is ready!');
    console.log('   📱 Frontend: Simple API calls for scores');
    console.log('   🎯 Display: Easy-to-show metrics and insights');
    console.log('   🔗 Integration: Ready for React Native components');

  } catch (error) {
    console.error('\n❌ Frontend scoring API test failed:');
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

// Run the frontend scoring test
if (require.main === module) {
  testFrontendScoring();
}
