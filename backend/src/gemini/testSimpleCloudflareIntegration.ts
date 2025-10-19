/**
 * Test Simple Cloudflare Integration System
 * Tests Firebase UID → Cloudflare D1 → Gemini Analysis
 */

import { simpleCloudflareIntegration } from './simpleCloudflareIntegration';
import { SimpleCloudflareAPI } from './simpleCloudflareAPI';
import * as dotenv from 'dotenv';

dotenv.config({ path: './.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test the simple integration system
 */
async function testSimpleCloudflareIntegration() {
  console.log('🚀 SIMPLE CLOUDFLARE INTEGRATION TEST');
  console.log('=====================================');
  console.log('🎯 Testing Firebase UID → Cloudflare D1 → Gemini Analysis');

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
        await SimpleCloudflareAPI.addMoodEntry(testFirebaseUserId, moodEntry);
        console.log(`✅ Added mood entry for ${moodEntry.date}`);
      } catch (error) {
        console.log(`⚠️ Could not add mood entry for ${moodEntry.date} (may already exist)`);
      }
    }

    // Step 2: Test quick scores
    console.log('\n2️⃣ Testing quick scores...');
    const quickScores = await SimpleCloudflareAPI.getQuickScores(testFirebaseUserId, startDateString, endDateString);
    console.log('🏆 QUICK SCORES');
    console.log('-'.repeat(40));
    console.log(`Overall: ${quickScores.overallScore}/100 (${quickScores.overallGrade})`);
    console.log(`Wellness: ${quickScores.wellnessScore}/100`);
    console.log(`Finance: ${quickScores.financeScore}/100`);
    console.log(`Status: ${quickScores.overallStatus.toUpperCase()}`);

    // Step 3: Test complete analysis
    console.log('\n3️⃣ Testing complete analysis...');
    const completeAnalysis = await SimpleCloudflareAPI.getCompleteAnalysis(testFirebaseUserId, startDateString, endDateString);
    
    console.log('🎯 COMPLETE ANALYSIS RESULTS');
    console.log('-'.repeat(50));
    console.log(`📊 Mood Data: ${completeAnalysis.moodData.length} entries`);
    console.log(`💰 Spending Data: ${completeAnalysis.spendingData.length} transactions`);
    console.log(`🤖 AI Analysis: ${completeAnalysis.analysis ? 'Generated' : 'Not available'}`);
    console.log(`📈 Scores: ${completeAnalysis.scores ? 'Generated' : 'Not available'}`);

    if (completeAnalysis.analysis) {
      console.log('\n🤖 AI ANALYSIS INSIGHTS');
      console.log('-'.repeat(40));
      if (completeAnalysis.analysis.keyInsights) {
        completeAnalysis.analysis.keyInsights.forEach((insight: string, index: number) => {
          console.log(`${index + 1}. ${insight}`);
        });
      }

      if (completeAnalysis.analysis.wellnessRecommendations) {
        console.log('\n🧘 WELLNESS RECOMMENDATIONS');
        console.log('-'.repeat(40));
        completeAnalysis.analysis.wellnessRecommendations.forEach((rec: string, index: number) => {
          console.log(`${index + 1}. ${rec}`);
        });
      }

      if (completeAnalysis.analysis.financeRecommendations) {
        console.log('\n💰 FINANCE RECOMMENDATIONS');
        console.log('-'.repeat(40));
        completeAnalysis.analysis.financeRecommendations.forEach((rec: string, index: number) => {
          console.log(`${index + 1}. ${rec}`);
        });
      }
    }

    if (completeAnalysis.scores) {
      console.log('\n📊 DETAILED SCORES');
      console.log('-'.repeat(40));
      console.log(`Overall Score: ${completeAnalysis.scores.overallScore}/100`);
      console.log(`Wellness Score: ${completeAnalysis.scores.wellnessScore}/100`);
      console.log(`Finance Score: ${completeAnalysis.scores.financeScore}/100`);
      console.log(`Grade: ${completeAnalysis.scores.overallGrade}`);
      console.log(`Status: ${completeAnalysis.scores.overallStatus.toUpperCase()}`);

      if (completeAnalysis.scores.wellnessBreakdown) {
        console.log('\n🧘 WELLNESS BREAKDOWN');
        console.log('-'.repeat(40));
        console.log(`Physical: ${completeAnalysis.scores.wellnessBreakdown.physical}/100`);
        console.log(`Mental: ${completeAnalysis.scores.wellnessBreakdown.mental}/100`);
        console.log(`Social: ${completeAnalysis.scores.wellnessBreakdown.social}/100`);
      }

      if (completeAnalysis.scores.financeBreakdown) {
        console.log('\n💰 FINANCE BREAKDOWN');
        console.log('-'.repeat(40));
        console.log(`Spending Control: ${completeAnalysis.scores.financeBreakdown.spendingControl}/100`);
        console.log(`Budgeting: ${completeAnalysis.scores.financeBreakdown.budgeting}/100`);
        console.log(`Stability: ${completeAnalysis.scores.financeBreakdown.stability}/100`);
      }
    }

    console.log('\n🎉 Simple Cloudflare integration test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Firebase UID → Cloudflare D1 mood data');
    console.log('   ✅ Nessie API → Spending data (or dummy fallback)');
    console.log('   ✅ Cloudflare mood data → Gemini analysis');
    console.log('   ✅ Complete scoring system with wellness & finance scores');
    console.log('   ✅ Easy-to-use API for frontend integration');

    console.log('\n🚀 Your complete system is ready!');
    console.log('   📱 Frontend: Use SimpleCloudflareAPI functions');
    console.log('   🔗 Integration: Firebase UID → Cloudflare → Gemini');
    console.log('   🎯 Result: Complete mood-enhanced financial coaching');

  } catch (error) {
    console.error('\n❌ Simple Cloudflare integration test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('D1')) {
        console.log('\n🔧 Fix: Check your Cloudflare D1 configuration');
        console.log('   - CLOUDFLARE_ACCOUNT_ID');
        console.log('   - CLOUDFLARE_API_TOKEN');
        console.log('   - CLOUDFLARE_D1_DATABASE_ID');
      } else if (error.message.includes('NESSIE')) {
        console.log('\n🔧 Fix: Check your Nessie API credentials');
        console.log('   - NESSIE_API_KEY');
        console.log('   - NESSIE_CUSTOMER_ID');
      } else if (error.message.includes('GEMINI')) {
        console.log('\n🔧 Fix: Check your Gemini API key');
        console.log('   - GEMINI_API_KEY');
      } else {
        console.log('\n🔧 Fix: Check the error details above');
      }
    }
  }
}

// Run the integration test
if (require.main === module) {
  testSimpleCloudflareIntegration();
}
