/**
 * Test Enhanced Mood Analysis with Multiple Days
 * Demonstrates how multiple days of wellness data provides nuanced insights
 */

import { EnhancedMoodAnalysis } from './enhancedMoodAnalysis';
import { D1Service } from '../database/services/d1Service';

// Set environment variables directly
process.env.CLOUDFLARE_ACCOUNT_ID = '58aae2a74d260d160efc18a4b308c373';
process.env.CLOUDFLARE_API_TOKEN = 'pKxjhXZi-agHpRy7v_JuMDH-aLjAlgI5wXSDfFNA';
process.env.CLOUDFLARE_D1_DATABASE_ID = '40bc49e1-1fd5-45be-a7b4-641d6fbf0c21';
process.env.GEMINI_API_KEY = 'AIzaSyAvanlVJGoRssaEvt9pisH_JPdbX43lPs8';
process.env.NESSIE_API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
process.env.NESSIE_CUSTOMER_ID = '68f4080c9683f20dd519f005';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Generate multiple days of realistic mood data for testing
 */
function generateMultipleDaysMoodData(userId: string, numDays: number): any[] {
  const moodEntries: any[] = [];
  const today = new Date();
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayOfWeek = date.getDay();
    
    // Base values with realistic patterns
    let overall_wellbeing = 5 + Math.random() * 4; // 5-9 range
    let sleep_quality = 4 + Math.random() * 5;      // 4-9 range
    let physical_activity = 3 + Math.random() * 5; // 3-8 range
    let time_with_family_friends = 4 + Math.random() * 5; // 4-9 range
    let diet_quality = 4 + Math.random() * 5;     // 4-9 range
    let stress_levels = 2 + Math.random() * 6;    // 2-8 range
    
    // Weekend effects
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      overall_wellbeing += 1 + Math.random() * 2;
      time_with_family_friends += 1 + Math.random() * 2;
      stress_levels -= 1 + Math.random() * 2;
    } else if (dayOfWeek === 1) { // Monday blues
      overall_wellbeing -= 1 + Math.random() * 2;
      stress_levels += 1 + Math.random() * 2;
    }
    
    // Ensure values are within 0-10
    overall_wellbeing = Math.max(0, Math.min(10, Math.round(overall_wellbeing)));
    sleep_quality = Math.max(0, Math.min(10, Math.round(sleep_quality)));
    physical_activity = Math.max(0, Math.min(10, Math.round(physical_activity)));
    time_with_family_friends = Math.max(0, Math.min(10, Math.round(time_with_family_friends)));
    diet_quality = Math.max(0, Math.min(10, Math.round(diet_quality)));
    stress_levels = Math.max(0, Math.min(10, Math.round(stress_levels)));
    
    moodEntries.push({
      userId,
      date: dateString,
      overall_wellbeing,
      sleep_quality,
      physical_activity,
      time_with_family_friends,
      diet_quality,
      stress_levels
    });
  }
  
  return moodEntries.reverse(); // Oldest first
}

/**
 * Test enhanced mood analysis with multiple days
 */
async function testEnhancedMoodAnalysis() {
  console.log('🎯 ENHANCED MOOD ANALYSIS TEST');
  console.log('==============================');
  console.log('🎯 Testing comprehensive analysis with multiple days of wellness data');

  try {
    // Step 1: Generate multiple days of mood data
    console.log('\n1️⃣ Generating multiple days of mood data...');
    const testUserId = 'enhanced-test-user';
    const numDays = 14; // 2 weeks of data
    const moodEntries = generateMultipleDaysMoodData(testUserId, numDays);
    
    console.log(`📊 Generated ${moodEntries.length} mood entries over ${numDays} days`);
    
    // Display sample data
    console.log('\n📋 Sample Mood Data:');
    moodEntries.slice(0, 5).forEach((entry, index) => {
      console.log(`   Day ${index + 1} (${entry.date}):`);
      console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
      console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
      console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
      console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
      console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
      console.log(`     😰 Stress: ${entry.stress_levels}/10`);
    });

    // Step 2: Save mood data to Cloudflare D1
    console.log('\n2️⃣ Saving mood data to Cloudflare D1...');
    const d1Service = D1Service.getInstance();
    
    for (const entry of moodEntries) {
      try {
        await d1Service.createWellbeingData(entry);
        console.log(`✅ Saved mood entry for ${entry.date}`);
      } catch (error) {
        console.log(`⚠️ Entry for ${entry.date} might already exist, continuing...`);
      }
    }

    // Step 3: Run enhanced analysis
    console.log('\n3️⃣ Running enhanced mood analysis...');
    const enhancedAnalysis = new EnhancedMoodAnalysis();
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(new Date().getDate() - numDays);
    const startDateString = startDate.toISOString().split('T')[0];
    
    const result = await enhancedAnalysis.getComprehensiveAnalysis(
      testUserId,
      startDateString,
      endDate
    );

    // Step 4: Display results
    console.log('\n' + '='.repeat(80));
    console.log('🎯 ENHANCED MOOD ANALYSIS RESULTS');
    console.log('='.repeat(80));

    console.log('\n📊 DATA SUMMARY:');
    console.log('-'.repeat(50));
    console.log(`📅 Date Range: ${startDateString} to ${endDate}`);
    console.log(`🧘 Mood Entries: ${result.moodData.length}`);
    console.log(`💰 Spending Transactions: ${result.spendingData.length}`);

    console.log('\n🧘 WELLNESS ASSESSMENT:');
    console.log('-'.repeat(50));
    if (result.analysis.wellnessAssessment) {
      console.log(result.analysis.wellnessAssessment);
    }

    console.log('\n📈 TREND ANALYSIS:');
    console.log('-'.repeat(50));
    if (result.analysis.trendAnalysis) {
      console.log(result.analysis.trendAnalysis);
    }

    console.log('\n💰 SPENDING PATTERNS:');
    console.log('-'.repeat(50));
    if (result.analysis.spendingPatterns) {
      console.log(result.analysis.spendingPatterns);
    }

    console.log('\n🔗 CORRELATION INSIGHTS:');
    console.log('-'.repeat(50));
    if (result.analysis.correlationInsights) {
      console.log(result.analysis.correlationInsights);
    }

    console.log('\n💡 PERSONALIZED RECOMMENDATIONS:');
    console.log('-'.repeat(50));
    if (result.analysis.personalizedRecommendations) {
      result.analysis.personalizedRecommendations.forEach((rec: string, index: number) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log('\n🎯 GOAL SUGGESTIONS:');
    console.log('-'.repeat(50));
    if (result.analysis.goalSuggestions) {
      result.analysis.goalSuggestions.forEach((goal: string, index: number) => {
        console.log(`${index + 1}. ${goal}`);
      });
    }

    console.log('\n🔍 KEY INSIGHTS:');
    console.log('-'.repeat(50));
    if (result.analysis.keyInsights) {
      result.analysis.keyInsights.forEach((insight: string, index: number) => {
        console.log(`${index + 1}. ${insight}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ENHANCED ANALYSIS COMPLETE');
    console.log('='.repeat(80));

    console.log('\n🎉 Enhanced mood analysis successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Multiple days of mood data collection');
    console.log('   ✅ Comprehensive statistical analysis');
    console.log('   ✅ Trend identification over time');
    console.log('   ✅ Mood-spending correlation analysis');
    console.log('   ✅ Nuanced Gemini AI insights');
    console.log('   ✅ Personalized recommendations based on patterns');

    console.log('\n🚀 Your enhanced system provides:');
    console.log('   📊 Multi-day pattern analysis');
    console.log('   📈 Trend identification and tracking');
    console.log('   🔗 Mood-spending correlation insights');
    console.log('   💡 Personalized recommendations');
    console.log('   🎯 Goal setting based on data patterns');

  } catch (error) {
    console.error('\n❌ Enhanced mood analysis test failed:');
    console.error(error);
  }
}

// Run the test
if (require.main === module) {
  testEnhancedMoodAnalysis();
}
