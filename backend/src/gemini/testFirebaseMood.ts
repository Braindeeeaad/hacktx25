/**
 * Test Firebase Mood Integration
 * Tests mood data storage and mood-enhanced analysis with Firebase
 */

import { FirebaseMoodService } from './firebaseMoodService';
import { analyzeSpendingWithFirebaseMood } from './firebaseMoodAnalysis';
import { MoodEntry } from './moodTypes';
import { NessieAPIIntegration } from './nessieIntegration';
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
  console.error('NESSIE_API_KEY and NESSIE_CUSTOMER_ID environment variables are required for Nessie integration.');
  process.exit(1);
}

/**
 * Generate dummy mood data for testing
 */
function generateDummyMoodData(userId: string, numDays: number): Omit<MoodEntry, 'id' | 'userId'>[] {
  const moodEntries: Omit<MoodEntry, 'id' | 'userId'>[] = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Create realistic patterns (weekends are better, weekdays more stressed)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Weekend: higher wellbeing, lower stress
    const baseWellbeing = isWeekend ? 6 + Math.random() * 3 : 3 + Math.random() * 4;
    const baseStress = isWeekend ? Math.random() * 4 : 4 + Math.random() * 4;
    const baseSleep = 4 + Math.random() * 4;
    const baseActivity = isWeekend ? 3 + Math.random() * 4 : 2 + Math.random() * 3;
    const baseSocial = isWeekend ? 5 + Math.random() * 4 : 2 + Math.random() * 3;
    const baseDiet = 4 + Math.random() * 4;

    moodEntries.push({
      date: dateString,
      overall_wellbeing: Math.round(baseWellbeing),
      sleep_quality: Math.round(baseSleep),
      physical_activity: Math.round(baseActivity),
      time_with_family_friends: Math.round(baseSocial),
      diet_quality: Math.round(baseDiet),
      stress_levels: Math.round(baseStress),
      notes: `Day ${i + 1}: ${isWeekend ? 'Weekend vibes!' : 'Work day.'} Overall: ${Math.round(baseWellbeing)}/10`
    });
  }
  return moodEntries.reverse(); // Oldest first
}

/**
 * Display mood-enhanced analysis results
 */
function displayMoodAnalysis(analysis: any) {
  console.log('\n' + '='.repeat(80));
  console.log('🤖 FIREBASE MOOD-ENHANCED ANALYSIS RESULTS');
  console.log('='.repeat(80));

  // Summary Section
  console.log('\n📊 SUMMARY');
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
    console.log(`   Short Insight: ${category.shortInsight}`);
    console.log(`   Detailed Analysis: ${category.detailedAnalysis}`);
    if (category.wellnessAdvice) {
      console.log(`   Wellness Advice: ${category.wellnessAdvice}`);
    }
  });

  // Anomalies Section
  console.log('\n⚠️  ANOMALIES DETECTED');
  console.log('-'.repeat(40));
  if (analysis.anomalies && analysis.anomalies.length > 0) {
    analysis.anomalies.forEach((anomaly: any, index: number) => {
      console.log(`\n${index + 1}. ${anomaly.date} - ${anomaly.category}`);
      console.log(`   Amount: $${anomaly.amount.toFixed(2)}`);
      console.log(`   Short Insight: ${anomaly.shortInsight}`);
      console.log(`   Detailed Reason: ${anomaly.detailedReason}`);
    });
  } else {
    console.log('   No significant anomalies detected.');
  }

  // Recommendations Section
  console.log('\n💡 AI RECOMMENDATIONS');
  console.log('-'.repeat(40));
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    analysis.recommendations.forEach((rec: any, index: number) => {
      console.log(`\n${index + 1}. ${rec.shortInsight}`);
      console.log(`   Detailed Advice: ${rec.detailedAdvice}`);
      console.log(`   Category: ${rec.category}`);
      if (rec.linkedInsights && rec.linkedInsights.length > 0) {
        console.log(`   Linked Insights: ${rec.linkedInsights.join(', ')}`);
      }
      if (rec.linkedAnomalies && rec.linkedAnomalies.length > 0) {
        console.log(`   Linked Anomalies: ${rec.linkedAnomalies.join(', ')}`);
      }
    });
  } else {
    console.log('   No specific recommendations at this time.');
  }

  // Wellness Tips Section
  console.log('\n🧘 WELLNESS TIPS');
  console.log('-'.repeat(40));
  if (analysis.wellnessTips && analysis.wellnessTips.length > 0) {
    analysis.wellnessTips.forEach((tip: any, index: number) => {
      console.log(`\n${index + 1}. Trigger: ${tip.trigger}`);
      console.log(`   Short Tip: ${tip.shortTip}`);
      console.log(`   Detailed Tip: ${tip.detailedTip}`);
    });
  } else {
    console.log('   No specific wellness tips at this time.');
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 MOOD-ENHANCED ANALYSIS COMPLETE');
  console.log('='.repeat(80) + '\n');
}

async function testFirebaseMoodIntegration() {
  console.log('🚀 FIREBASE MOOD INTEGRATION TEST');
  console.log('==================================');
  console.log('🎯 Testing Firebase mood data storage and mood-enhanced analysis');

  const testUserId = 'test-user-firebase-123';
  const moodService = new FirebaseMoodService();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Last 30 days

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Step 1: Test Firebase mood service
    console.log('\n1️⃣ Testing Firebase mood service...');
    
    // Generate and add dummy mood data
    const dummyMoodData = generateDummyMoodData(testUserId, 30);
    console.log(`📊 Generated ${dummyMoodData.length} dummy mood entries`);

    // Add mood entries to Firebase
    for (const moodData of dummyMoodData) {
      await moodService.addMoodEntry(testUserId, moodData);
    }
    console.log('✅ Mood entries added to Firebase successfully');

    // Step 2: Test mood data retrieval
    console.log('\n2️⃣ Testing mood data retrieval...');
    const retrievedMoodEntries = await moodService.getMoodEntries(testUserId, startDateString, endDateString);
    console.log(`✅ Retrieved ${retrievedMoodEntries.length} mood entries from Firebase`);

    // Step 3: Test mood statistics
    console.log('\n3️⃣ Testing mood statistics...');
    const moodStats = await moodService.getMoodStatistics(testUserId, startDateString, endDateString);
    console.log('✅ Mood statistics calculated:');
    console.log(`   Total Entries: ${moodStats.totalEntries}`);
    console.log(`   Average Wellbeing: ${moodStats.averageWellbeing.toFixed(2)}`);
    console.log(`   Average Sleep: ${moodStats.averageSleep.toFixed(2)}`);
    console.log(`   Average Stress: ${moodStats.averageStress.toFixed(2)}`);

    // Step 4: Get spending data from Nessie
    console.log('\n4️⃣ Fetching spending data from Nessie...');
    const nessie = new NessieAPIIntegration(NESSIE_API_KEY!, NESSIE_CUSTOMER_ID!);
    const transactions = await nessie.getAllTransactions(startDateString, endDateString);
    console.log(`📊 Found ${transactions.length} transactions from Nessie API`);

    if (transactions.length === 0) {
      console.warn('No transactions found for the specified date range. Cannot perform analysis.');
      return;
    }

    // Step 5: Test mood-enhanced analysis
    console.log('\n5️⃣ Running mood-enhanced analysis...');
    const analysisResult = await analyzeSpendingWithFirebaseMood(
      transactions, 
      testUserId, 
      startDateString, 
      endDateString
    );

    // Step 6: Display results
    displayMoodAnalysis(analysisResult);

    // Step 7: Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    for (const moodEntry of retrievedMoodEntries) {
      await moodService.deleteMoodEntry(testUserId, moodEntry.id);
    }
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All Firebase mood integration tests passed!');
    console.log('\nNext steps:');
    console.log('1. Add mood input to your React Native app');
    console.log('2. Connect to Firebase for mood data storage');
    console.log('3. Use analyzeSpendingWithFirebaseMood() for enhanced analysis');

  } catch (error) {
    console.error('\n❌ Firebase mood integration test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('Firebase Admin initialization failed')) {
        console.log('\n🔧 Fix: Set up Firebase service account key');
        console.log('   1. Go to Firebase Console > Project Settings > Service Accounts');
        console.log('   2. Generate a new private key');
        console.log('   3. Add FIREBASE_SERVICE_ACCOUNT_KEY to your .env file');
      } else if (error.message.includes('Permission denied')) {
        console.log('\n🔧 Fix: Check Firebase security rules');
        console.log('   Make sure your Firestore rules allow read/write access');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testFirebaseMoodIntegration();
}
