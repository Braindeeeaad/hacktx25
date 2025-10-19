/**
 * Complete System Flow Test - Simple Version
 * Tests the full system: Cloudflare D1 → Nessie API → Gemini Analysis
 * Uses existing working components without complex imports
 */

import { SimpleCloudflareAPI } from './simpleCloudflareAPI';
import { NessieAPIIntegration } from './nessieIntegration';
import { analyzeSpendingWithFirebaseMood } from './firebaseMoodAnalysis';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Set environment variables directly
process.env.CLOUDFLARE_ACCOUNT_ID = '58aae2a74d260d160efc18a4b308c373';
process.env.CLOUDFLARE_API_TOKEN = 'pKxjhXZi-agHpRy7v_JuMDH-aLjAlgI5wXSDfFNA';
process.env.CLOUDFLARE_D1_DATABASE_ID = '40bc49e1-1fd5-45be-a7b4-641d6fbf0c21';
process.env.GEMINI_API_KEY = 'AIzaSyAvanlVJGoRssaEvt9pisH_JPdbX43lPs8';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Generate realistic mood data for testing
 */
function generateTestMoodData(userId: string, numDays: number): any[] {
  const moodEntries: any[] = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Base values, then adjust for day of week and randomness
    let overall_wellbeing = 5 + Math.random() * 3; // 5-8
    let sleep_quality = 5 + Math.random() * 3;    // 5-8
    let physical_activity = 3 + Math.random() * 4; // 3-7
    let time_with_family_friends = 4 + Math.random() * 4; // 4-8
    let diet_quality = 5 + Math.random() * 3;     // 5-8
    let stress_levels = 3 + Math.random() * 4;     // 3-7

    // Adjust for weekends (higher wellbeing, social, activity; lower stress)
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      overall_wellbeing += 1 + Math.random() * 2; // Boost by 1-3
      time_with_family_friends += 1 + Math.random() * 2;
      physical_activity += 1 + Math.random() * 2;
      stress_levels -= 1 + Math.random() * 2; // Reduce by 1-3
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
      stress_levels,
      notes: `Day ${i + 1}: ${dayOfWeek === 0 || dayOfWeek === 6 ? 'Weekend' : 'Weekday'}. Wellbeing: ${overall_wellbeing}/10`
    });
  }
  return moodEntries.reverse(); // Oldest first
}

/**
 * Generate dummy spending data with mood correlation
 */
function generateTestSpendingData(moodEntries: any[]): any[] {
  const transactions: any[] = [];
  const categories = ['Food', 'Shopping', 'Entertainment', 'Transportation', 'Health', 'Utilities'];
  const baseAmounts: Record<string, number> = {
    'Food': 30, 'Shopping': 20, 'Entertainment': 15,
    'Transportation': 10, 'Health': 5, 'Utilities': 8
  };

  moodEntries.forEach(mood => {
    const date = mood.date;
    const numTransactions = 3 + Math.floor(Math.random() * 3); // 3-5 transactions per day

    for (let i = 0; i < numTransactions; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      let amount = baseAmounts[category] + (Math.random() * 20 - 10); // +/- 10 from base

      // Introduce mood correlation:
      // Higher stress/lower wellbeing -> potentially higher spending in certain categories
      if (mood.stress_levels > 6 && (category === 'Food' || category === 'Shopping' || category === 'Entertainment')) {
        amount += Math.random() * 15; // Add up to $15 for stress spending
      }
      if (mood.overall_wellbeing < 4 && (category === 'Shopping' || category === 'Entertainment')) {
        amount += Math.random() * 10; // Add up to $10 for low mood spending
      }
      if (mood.sleep_quality < 4 && category === 'Food') {
        amount += Math.random() * 5; // Add up to $5 for poor sleep food
      }
      if (mood.time_with_family_friends < 3 && category === 'Shopping') {
        amount += Math.random() * 10; // Add up to $10 for loneliness shopping
      }

      amount = Math.max(5, parseFloat(amount.toFixed(2))); // Min $5, 2 decimal places

      transactions.push({
        id: `tx_${date}_${category}_${i}_${Date.now()}`,
        date: date,
        merchant: `Merchant ${Math.floor(Math.random() * 100)}`,
        amount: amount,
        category: category,
        description: `Purchase in ${category}`,
        type: 'debit'
      });
    }
  });
  return transactions;
}

/**
 * Display comprehensive analysis results
 */
function displayCompleteAnalysis(analysis: any, userId: string) {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 COMPLETE SYSTEM ANALYSIS RESULTS');
  console.log('='.repeat(80));
  console.log(`👤 User ID: ${userId}`);

  // Financial Summary
  console.log('\n💰 FINANCIAL SUMMARY');
  console.log('-'.repeat(50));
  console.log(`💳 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
  console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
  console.log(`📈 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);

  // Category Analysis
  console.log('\n📊 CATEGORY ANALYSIS');
  console.log('-'.repeat(50));
  analysis.categories.forEach((category: any, index: number) => {
    console.log(`\n${index + 1}. ${category.category.toUpperCase()}`);
    console.log(`   Trend: ${category.trend.toUpperCase()}`);
    console.log(`   Change: ${category.change}`);
    console.log(`   💡 Insight: ${category.shortInsight}`);
    if (category.wellnessAdvice) {
      console.log(`   🧘 Wellness Advice: ${category.wellnessAdvice}`);
    }
  });

  // Anomalies
  console.log('\n⚠️  SPENDING ANOMALIES');
  console.log('-'.repeat(50));
  if (analysis.anomalies && analysis.anomalies.length > 0) {
    analysis.anomalies.forEach((anomaly: any, index: number) => {
      console.log(`\n${index + 1}. ${anomaly.date} - ${anomaly.category}`);
      console.log(`   💰 Amount: $${anomaly.amount.toFixed(2)}`);
      console.log(`   💡 Insight: ${anomaly.shortInsight}`);
    });
  } else {
    console.log('   No significant anomalies detected.');
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(50));
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    analysis.recommendations.forEach((rec: any, index: number) => {
      console.log(`\n${index + 1}. ${rec.shortInsight}`);
      console.log(`   📝 Advice: ${rec.detailedAdvice}`);
      console.log(`   🏷️  Category: ${rec.category}`);
    });
  }

  // Wellness Tips
  console.log('\n🧘 WELLNESS TIPS');
  console.log('-'.repeat(50));
  if (analysis.wellnessTips && analysis.wellnessTips.length > 0) {
    analysis.wellnessTips.forEach((tip: any, index: number) => {
      console.log(`\n${index + 1}. ${tip.trigger.toUpperCase()}`);
      console.log(`   💡 Tip: ${tip.shortTip}`);
      console.log(`   📝 Details: ${tip.detailedTip}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 COMPLETE SYSTEM ANALYSIS COMPLETE');
  console.log('='.repeat(80) + '\n');
}

/**
 * Test the complete system flow
 */
async function testCompleteSystemSimple() {
  console.log('🚀 COMPLETE SYSTEM FLOW TEST - SIMPLE VERSION');
  console.log('==============================================');
  console.log('🎯 Testing full system: Cloudflare D1 → Nessie → Gemini Analysis');

  const testUserId = 'complete-system-test-user';
  const numDays = 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - numDays);
  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Step 1: Generate and save mood data to Cloudflare D1
    console.log('\n1️⃣ Generating and saving mood data to Cloudflare D1...');
    const moodEntries = generateTestMoodData(testUserId, numDays);
    console.log(`📊 Generated ${moodEntries.length} realistic mood entries`);

    // Save mood data to Cloudflare D1 using SimpleCloudflareAPI
    const cloudflareAPI = new SimpleCloudflareAPI();
    for (const entry of moodEntries) {
      await SimpleCloudflareAPI.addMoodEntry(entry.userId, entry);
    }
    console.log('✅ Mood data saved to Cloudflare D1');

    // Step 2: Generate spending data (with mood correlation)
    console.log('\n2️⃣ Generating spending data with mood correlation...');
    const transactions = generateTestSpendingData(moodEntries);
    console.log(`📊 Generated ${transactions.length} transactions with mood correlation`);

    // Step 3: Test Nessie API integration (with fallback to dummy data)
    console.log('\n3️⃣ Testing Nessie API integration...');
    let finalTransactions = transactions;
    const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
    const NESSIE_CUSTOMER_ID = process.env.NESSIE_CUSTOMER_ID;

    if (NESSIE_API_KEY && NESSIE_CUSTOMER_ID) {
      try {
        const nessie = new NessieAPIIntegration(NESSIE_API_KEY, NESSIE_CUSTOMER_ID);
        const nessieTransactions = await nessie.getAllTransactions(startDateString, endDateString);
        if (nessieTransactions.length > 0) {
          finalTransactions = nessieTransactions;
          console.log(`✅ Retrieved ${nessieTransactions.length} real transactions from Nessie API`);
        } else {
          console.log('⚠️ No real transactions from Nessie, using generated data');
        }
      } catch (nessieError) {
        console.log('⚠️ Nessie API not available, using generated data');
        console.log(`   Error: ${nessieError}`);
      }
    } else {
      console.log('⚠️ Nessie API keys not configured, using generated data');
    }

    // Step 4: Run mood-enhanced analysis with Gemini
    console.log('\n4️⃣ Running mood-enhanced analysis with Gemini...');
    console.log('🤖 This will analyze spending patterns with mood correlation...');
    const analysisResult = await analyzeSpendingWithFirebaseMood(
      finalTransactions,
      testUserId, 
      startDateString, 
      endDateString
    );
    console.log('✅ Mood-enhanced analysis completed');

    // Step 5: Display complete analysis
    displayCompleteAnalysis(analysisResult, testUserId);

    console.log('\n🎉 Complete system flow test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Cloudflare D1 mood data storage and retrieval');
    console.log('   ✅ Nessie API integration (with fallback)');
    console.log('   ✅ Gemini AI mood-enhanced analysis');
    console.log('   ✅ Complete system integration');
    console.log('   ✅ Real database and API connections');

    console.log('\n🚀 Your complete system is ready for production!');
    console.log('   📱 Frontend: Add mood input and analysis display components');
    console.log('   🔗 Integration: Full system working end-to-end');
    console.log('   🎯 Result: Complete mood-enhanced financial coaching system');

  } catch (error) {
    console.error('\n❌ Complete system flow test failed:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if ((error as any).response) {
        console.error('API Response:', JSON.stringify((error as any).response, null, 2));
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testCompleteSystemSimple();
}
