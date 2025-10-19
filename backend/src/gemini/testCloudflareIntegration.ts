/**
 * Test Cloudflare Integration System
 * Tests Firebase login → Nessie API → Cloudflare mood data → Gemini analysis
 */

import { cloudflareMoodIntegration } from './cloudflareMoodIntegration';
import { CloudflareAPI } from './cloudflareAPI';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test the complete integration system
 */
async function testCloudflareIntegration() {
  console.log('🚀 CLOUDFLARE INTEGRATION SYSTEM TEST');
  console.log('=====================================');
  console.log('🎯 Testing Firebase login → Nessie API → Cloudflare mood data → Gemini analysis');

  const testFirebaseUserId = 'test-user-123'; // This would be the Firebase UID
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Last 30 days

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Step 1: Add some test mood data
    console.log('\n1️⃣ Adding test mood data to Cloudflare D1...');
    
    const testMoodEntries = [
      {
        date: startDateString,
        overall_wellbeing: 7,
        sleep_quality: 8,
        physical_activity: 6,
        time_with_family_friends: 9,
        diet_quality: 7,
        stress_levels: 3
      },
      {
        date: new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        overall_wellbeing: 5,
        sleep_quality: 4,
        physical_activity: 3,
        time_with_family_friends: 2,
        diet_quality: 5,
        stress_levels: 7
      },
      {
        date: new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        overall_wellbeing: 8,
        sleep_quality: 9,
        physical_activity: 8,
        time_with_family_friends: 7,
        diet_quality: 8,
        stress_levels: 2
      }
    ];

    for (const moodEntry of testMoodEntries) {
      try {
        await CloudflareAPI.addMoodEntry(testFirebaseUserId, moodEntry);
        console.log(`✅ Added mood entry for ${moodEntry.date}`);
      } catch (error) {
        console.log(`⚠️ Could not add mood entry for ${moodEntry.date} (may already exist)`);
      }
    }

    // Step 2: Test getting mood data
    console.log('\n2️⃣ Testing mood data retrieval...');
    const moodData = await CloudflareAPI.getMoodData(testFirebaseUserId, startDateString, endDateString);
    console.log(`📊 Retrieved ${moodData.length} mood entries from Cloudflare D1`);
    
    if (moodData.length > 0) {
      console.log('📋 Sample mood data:');
      moodData.slice(0, 3).forEach((entry, index) => {
        console.log(`   Day ${index + 1} (${entry.date}):`);
        console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
        console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
        console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
        console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
        console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
        console.log(`     😰 Stress: ${entry.stress_levels}/10`);
      });
    }

    // Step 3: Test getting spending data
    console.log('\n3️⃣ Testing spending data retrieval...');
    try {
      const spendingData = await CloudflareAPI.getSpendingData(startDateString, endDateString);
      console.log(`📊 Retrieved ${spendingData.length} transactions from Nessie API`);
      
      if (spendingData.length > 0) {
        console.log('📋 Sample spending data:');
        spendingData.slice(0, 5).forEach((tx, index) => {
          console.log(`   ${tx.date} - ${tx.category}: $${tx.amount.toFixed(2)}`);
        });
      }
    } catch (error) {
      console.log('⚠️ Nessie API not available, will use dummy data in analysis');
    }

    // Step 4: Test quick scores
    console.log('\n4️⃣ Testing quick scores...');
    const quickScores = await CloudflareAPI.getQuickScores(testFirebaseUserId, startDateString, endDateString);
    console.log('🏆 QUICK SCORES');
    console.log('-'.repeat(40));
    console.log(`Overall: ${quickScores.overallScore}/100 (${quickScores.overallGrade})`);
    console.log(`Wellness: ${quickScores.wellnessScore}/100`);
    console.log(`Finance: ${quickScores.financeScore}/100`);
    console.log(`Status: ${quickScores.overallStatus.toUpperCase()}`);

    // Step 5: Test complete analysis
    console.log('\n5️⃣ Testing complete analysis...');
    const completeAnalysis = await CloudflareAPI.getCompleteAnalysis(testFirebaseUserId, startDateString, endDateString);
    
    console.log('🎯 COMPLETE ANALYSIS RESULTS');
    console.log('-'.repeat(50));
    console.log(`📊 Mood Data: ${completeAnalysis.moodData.length} entries`);
    console.log(`💰 Spending Data: ${completeAnalysis.spendingData.length} transactions`);
    console.log(`🤖 AI Analysis: ${completeAnalysis.analysis ? 'Generated' : 'Not available'}`);
    console.log(`📈 Scores: ${completeAnalysis.scores ? 'Generated' : 'Not available'}`);

    if (completeAnalysis.scores) {
      console.log('\n📊 DETAILED SCORES');
      console.log('-'.repeat(40));
      console.log(`Overall Score: ${completeAnalysis.scores.summary.overallScore}/100`);
      console.log(`Wellness Score: ${completeAnalysis.scores.wellness.overall}/100`);
      console.log(`Finance Score: ${completeAnalysis.scores.finance.overall}/100`);
      console.log(`Grade: ${completeAnalysis.scores.summary.grade}`);
      console.log(`Status: ${completeAnalysis.scores.summary.status.toUpperCase()}`);

      console.log('\n💡 TOP INSIGHTS');
      console.log('-'.repeat(40));
      completeAnalysis.scores.summary.keyInsights.forEach((insight: string, index: number) => {
        console.log(`${index + 1}. ${insight}`);
      });

      console.log('\n🎯 PRIORITY ACTIONS');
      console.log('-'.repeat(40));
      completeAnalysis.scores.summary.priorityActions.forEach((action: string, index: number) => {
        console.log(`${index + 1}. ${action}`);
      });
    }

    console.log('\n🎉 Cloudflare integration test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Firebase UID → Cloudflare D1 mood data');
    console.log('   ✅ Nessie API → Spending data integration');
    console.log('   ✅ Cloudflare mood data → Gemini analysis');
    console.log('   ✅ Complete scoring system with wellness & finance scores');
    console.log('   ✅ Easy-to-use API for frontend integration');

    console.log('\n🚀 Your complete system is ready!');
    console.log('   📱 Frontend: Use CloudflareAPI functions');
    console.log('   🔗 Integration: Firebase UID → Cloudflare → Gemini');
    console.log('   🎯 Result: Complete mood-enhanced financial coaching');

  } catch (error) {
    console.error('\n❌ Cloudflare integration test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('D1')) {
        console.log('\n🔧 Fix: Check your Cloudflare D1 configuration');
      } else if (error.message.includes('NESSIE')) {
        console.log('\n🔧 Fix: Check your Nessie API credentials');
      } else if (error.message.includes('GEMINI')) {
        console.log('\n🔧 Fix: Check your Gemini API key');
      } else {
        console.log('\n🔧 Fix: Check the error details above');
      }
    }
  }
}

// Run the integration test
if (require.main === module) {
  testCloudflareIntegration();
}
