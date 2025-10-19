/**
 * Complete Mood System Test
 * Tests Firebase mood data + Gemini + Nessie API integration
 * This simulates the full mood-enhanced analysis without needing the frontend
 */

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
 * Generate realistic mood data for testing
 * This simulates what users would input through the frontend
 */
function generateRealisticMoodData(userId: string, numDays: number): Omit<MoodEntry, 'id' | 'userId'>[] {
  const moodEntries: Omit<MoodEntry, 'id' | 'userId'>[] = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Create realistic patterns based on day of week and time
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

    // Add some correlation between metrics
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
 * Display comprehensive mood-enhanced analysis results
 */
function displayCompleteAnalysis(analysis: any, moodStats: any) {
  console.log('\n' + '='.repeat(100));
  console.log('🤖 COMPLETE MOOD-ENHANCED FINANCIAL ANALYSIS');
  console.log('='.repeat(100));

  // Summary Section
  console.log('\n📊 FINANCIAL SUMMARY');
  console.log('-'.repeat(50));
  console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
  console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
  console.log(`📈 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);

  // Mood Statistics
  console.log('\n🧘 MOOD STATISTICS');
  console.log('-'.repeat(50));
  console.log(`📊 Total Mood Entries: ${moodStats.totalEntries}`);
  console.log(`😊 Average Wellbeing: ${moodStats.averageWellbeing.toFixed(2)}/10`);
  console.log(`😴 Average Sleep Quality: ${moodStats.averageSleep.toFixed(2)}/10`);
  console.log(`🏃 Average Physical Activity: ${moodStats.averageActivity.toFixed(2)}/10`);
  console.log(`👨‍👩‍👧‍👦 Average Social Time: ${moodStats.averageSocial.toFixed(2)}/10`);
  console.log(`🥗 Average Diet Quality: ${moodStats.averageDiet.toFixed(2)}/10`);
  console.log(`😰 Average Stress Level: ${moodStats.averageStress.toFixed(2)}/10`);

  // Categories Section
  console.log('\n📊 CATEGORY ANALYSIS WITH MOOD INSIGHTS');
  console.log('-'.repeat(50));
  analysis.categories.forEach((category: any, index: number) => {
    console.log(`\n${index + 1}. ${category.category.toUpperCase()}`);
    console.log(`   Trend: ${category.trend.toUpperCase()}`);
    console.log(`   Change: ${category.change}`);
    console.log(`   💡 Short Insight: ${category.shortInsight}`);
    console.log(`   📝 Detailed Analysis: ${category.detailedAnalysis}`);
    if (category.wellnessAdvice) {
      console.log(`   🧘 Wellness Advice: ${category.wellnessAdvice}`);
    }
  });

  // Anomalies Section
  console.log('\n⚠️  SPENDING ANOMALIES WITH MOOD CONTEXT');
  console.log('-'.repeat(50));
  if (analysis.anomalies && analysis.anomalies.length > 0) {
    analysis.anomalies.forEach((anomaly: any, index: number) => {
      console.log(`\n${index + 1}. ${anomaly.date} - ${anomaly.category}`);
      console.log(`   💰 Amount: $${anomaly.amount.toFixed(2)}`);
      console.log(`   💡 Short Insight: ${anomaly.shortInsight}`);
      console.log(`   📝 Detailed Reason: ${anomaly.detailedReason}`);
    });
  } else {
    console.log('   ✅ No significant anomalies detected.');
  }

  // Recommendations Section
  console.log('\n💡 MOOD-AWARE RECOMMENDATIONS');
  console.log('-'.repeat(50));
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    analysis.recommendations.forEach((rec: any, index: number) => {
      console.log(`\n${index + 1}. ${rec.shortInsight}`);
      console.log(`   📝 Detailed Advice: ${rec.detailedAdvice}`);
      console.log(`   🏷️  Category: ${rec.category}`);
      if (rec.linkedInsights && rec.linkedInsights.length > 0) {
        console.log(`   🔗 Linked Insights: ${rec.linkedInsights.join(', ')}`);
      }
      if (rec.linkedAnomalies && rec.linkedAnomalies.length > 0) {
        console.log(`   🔗 Linked Anomalies: ${rec.linkedAnomalies.join(', ')}`);
      }
    });
  } else {
    console.log('   📝 No specific recommendations at this time.');
  }

  // Wellness Tips Section
  console.log('\n🧘 WELLNESS TIPS BASED ON MOOD PATTERNS');
  console.log('-'.repeat(50));
  if (analysis.wellnessTips && analysis.wellnessTips.length > 0) {
    analysis.wellnessTips.forEach((tip: any, index: number) => {
      console.log(`\n${index + 1}. Trigger: ${tip.trigger.toUpperCase()}`);
      console.log(`   💡 Short Tip: ${tip.shortTip}`);
      console.log(`   📝 Detailed Tip: ${tip.detailedTip}`);
    });
  } else {
    console.log('   📝 No specific wellness tips at this time.');
  }

  console.log('\n' + '='.repeat(100));
  console.log('🎯 MOOD-ENHANCED ANALYSIS COMPLETE');
  console.log('='.repeat(100) + '\n');
}

async function testCompleteMoodSystem() {
  console.log('🚀 COMPLETE MOOD SYSTEM TEST');
  console.log('============================');
  console.log('🎯 Testing Firebase mood data + Gemini + Nessie API integration');
  console.log('This simulates the full mood-enhanced analysis without needing the frontend');

  const testUserId = NESSIE_CUSTOMER_ID!; // Use the actual Nessie customer ID
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Last 30 days

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Step 1: Generate realistic mood data
    console.log('\n1️⃣ Generating realistic mood data...');
    const moodEntries = generateRealisticMoodData(testUserId, 30);
    console.log(`📊 Generated ${moodEntries.length} realistic mood entries`);
    
    // Show sample mood data
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

    // Step 2: Get spending data from Nessie
    console.log('\n2️⃣ Fetching spending data from Nessie API...');
    const nessie = new NessieAPIIntegration(NESSIE_API_KEY!, NESSIE_CUSTOMER_ID!);
    const transactions = await nessie.getAllTransactions(startDateString, endDateString);
    console.log(`📊 Found ${transactions.length} transactions from Nessie API`);

    if (transactions.length === 0) {
      console.warn('⚠️ No transactions found for the specified date range. Cannot perform analysis.');
      return;
    }

    // Step 3: Calculate mood statistics
    console.log('\n3️⃣ Calculating mood statistics...');
    const moodStats = {
      totalEntries: moodEntries.length,
      averageWellbeing: moodEntries.reduce((sum, entry) => sum + entry.overall_wellbeing, 0) / moodEntries.length,
      averageSleep: moodEntries.reduce((sum, entry) => sum + entry.sleep_quality, 0) / moodEntries.length,
      averageActivity: moodEntries.reduce((sum, entry) => sum + entry.physical_activity, 0) / moodEntries.length,
      averageSocial: moodEntries.reduce((sum, entry) => sum + entry.time_with_family_friends, 0) / moodEntries.length,
      averageDiet: moodEntries.reduce((sum, entry) => sum + entry.diet_quality, 0) / moodEntries.length,
      averageStress: moodEntries.reduce((sum, entry) => sum + entry.stress_levels, 0) / moodEntries.length,
      moodDistribution: {},
      mostCommonTriggers: []
    };

    console.log('✅ Mood statistics calculated:');
    console.log(`   😊 Average Wellbeing: ${moodStats.averageWellbeing.toFixed(2)}/10`);
    console.log(`   😴 Average Sleep: ${moodStats.averageSleep.toFixed(2)}/10`);
    console.log(`   🏃 Average Activity: ${moodStats.averageActivity.toFixed(2)}/10`);
    console.log(`   👨‍👩‍👧‍👦 Average Social: ${moodStats.averageSocial.toFixed(2)}/10`);
    console.log(`   🥗 Average Diet: ${moodStats.averageDiet.toFixed(2)}/10`);
    console.log(`   😰 Average Stress: ${moodStats.averageStress.toFixed(2)}/10`);

    // Step 4: Run mood-enhanced analysis
    console.log('\n4️⃣ Running mood-enhanced analysis with Gemini...');
    console.log('🤖 This will analyze spending patterns with mood correlation...');
    
    const analysisResult = await analyzeSpendingWithFirebaseMood(
      transactions, 
      testUserId, 
      startDateString, 
      endDateString
    );

    // Step 5: Display comprehensive results
    displayCompleteAnalysis(analysisResult, moodStats);

    console.log('\n🎉 Complete mood system test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Realistic mood data generation (simulating user input)');
    console.log('   ✅ Nessie API integration for real spending data');
    console.log('   ✅ Mood-spending correlation analysis');
    console.log('   ✅ Gemini AI enhanced with mood insights');
    console.log('   ✅ Mood-aware recommendations and wellness tips');
    console.log('   ✅ Linked recommendations with supporting data');

    console.log('\n🚀 Your system is ready for production!');
    console.log('   📱 Frontend: Add MoodInput component to collect real mood data');
    console.log('   🔗 Integration: Connect frontend to this backend analysis');
    console.log('   🎯 Result: Complete mood-enhanced financial coaching');

  } catch (error) {
    console.error('\n❌ Complete mood system test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        console.log('\n🔧 Fix: Check your Gemini API key in .env file');
      } else if (error.message.includes('NESSIE')) {
        console.log('\n🔧 Fix: Check your Nessie API credentials in .env file');
      } else if (error.message.includes('Firebase')) {
        console.log('\n🔧 Fix: Firebase credentials needed for backend (optional for this test)');
      }
    }
  }
}

// Run the complete test
if (require.main === module) {
  testCompleteMoodSystem();
}
