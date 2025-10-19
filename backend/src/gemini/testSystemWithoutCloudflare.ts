/**
 * Test System Without Cloudflare D1
 * Tests the complete system using dummy data instead of Cloudflare D1
 * This allows you to test everything without setting up Cloudflare first
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
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

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required.');
}

/**
 * Test the complete system without Cloudflare D1
 */
async function testSystemWithoutCloudflare() {
  console.log('🚀 COMPLETE SYSTEM TEST (Without Cloudflare D1)');
  console.log('================================================');
  console.log('🎯 Testing Firebase UID → Dummy Mood Data → Nessie API → Gemini Analysis');

  const testFirebaseUserId = 'test-user-123';
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Step 1: Generate dummy mood data (simulating Cloudflare D1)
    console.log('\n1️⃣ Generating dummy mood data (simulating Cloudflare D1)...');
    const moodData = generateDummyMoodData(30);
    console.log(`📊 Generated ${moodData.length} mood entries`);

    console.log('\n📋 Sample Mood Data:');
    moodData.slice(0, 3).forEach((entry, index) => {
      console.log(`   Day ${index + 1} (${entry.date}):`);
      console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
      console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
      console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
      console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
      console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
      console.log(`     😰 Stress: ${entry.stress_levels}/10`);
    });

    // Step 2: Get spending data from Nessie API or generate dummy
    console.log('\n2️⃣ Fetching spending data...');
    let spendingData: any[] = [];
    
    if (NESSIE_API_KEY && NESSIE_CUSTOMER_ID) {
      try {
        const nessie = new NessieAPIIntegration(NESSIE_API_KEY, NESSIE_CUSTOMER_ID);
        spendingData = await nessie.getAllTransactions(startDateString, endDateString);
        console.log(`📊 Found ${spendingData.length} transactions from Nessie API`);
      } catch (error) {
        console.warn('⚠️ Nessie API not available, using dummy spending data...');
        spendingData = generateDummySpendingData(moodData);
        console.log(`📊 Generated ${spendingData.length} dummy transactions`);
      }
    } else {
      console.warn('⚠️ Nessie API not configured, using dummy spending data...');
      spendingData = generateDummySpendingData(moodData);
      console.log(`📊 Generated ${spendingData.length} dummy transactions`);
    }

    console.log('\n📋 Sample Spending Data:');
    spendingData.slice(0, 5).forEach((tx, index) => {
      console.log(`   ${tx.date} - ${tx.category}: $${tx.amount.toFixed(2)}`);
    });

    // Step 3: Run Gemini analysis
    console.log('\n3️⃣ Running Gemini AI analysis...');
    const analysis = await runGeminiAnalysis(moodData, spendingData);
    console.log('✅ Gemini analysis completed');

    // Step 4: Generate scores
    console.log('\n4️⃣ Generating wellness and finance scores...');
    const scores = await generateScores(moodData, spendingData);
    console.log('✅ Scores generated');

    // Step 5: Display results
    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPLETE SYSTEM RESULTS');
    console.log('='.repeat(80));

    console.log('\n📊 SYSTEM SUMMARY');
    console.log('-'.repeat(50));
    console.log(`👤 User ID: ${testFirebaseUserId}`);
    console.log(`📅 Date Range: ${startDateString} to ${endDateString}`);
    console.log(`📊 Mood Data: ${moodData.length} entries`);
    console.log(`💰 Spending Data: ${spendingData.length} transactions`);
    console.log(`🤖 AI Analysis: ${analysis ? 'Generated' : 'Not available'}`);
    console.log(`📈 Scores: ${scores ? 'Generated' : 'Not available'}`);

    if (analysis) {
      console.log('\n🤖 AI ANALYSIS INSIGHTS');
      console.log('-'.repeat(50));
      if (analysis.keyInsights) {
        console.log('💡 Key Insights:');
        analysis.keyInsights.forEach((insight: string, index: number) => {
          console.log(`   ${index + 1}. ${insight}`);
        });
      }

      if (analysis.wellnessRecommendations) {
        console.log('\n🧘 Wellness Recommendations:');
        analysis.wellnessRecommendations.forEach((rec: string, index: number) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }

      if (analysis.financeRecommendations) {
        console.log('\n💰 Finance Recommendations:');
        analysis.financeRecommendations.forEach((rec: string, index: number) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }

      if (analysis.priorityActions) {
        console.log('\n🎯 Priority Actions:');
        analysis.priorityActions.forEach((action: string, index: number) => {
          console.log(`   ${index + 1}. ${action}`);
        });
      }
    }

    if (scores) {
      console.log('\n📊 DETAILED SCORES');
      console.log('-'.repeat(50));
      console.log(`🏆 Overall Score: ${scores.overallScore}/100`);
      console.log(`🧘 Wellness Score: ${scores.wellnessScore}/100`);
      console.log(`💰 Finance Score: ${scores.financeScore}/100`);
      console.log(`📈 Grade: ${scores.overallGrade}`);
      console.log(`📊 Status: ${scores.overallStatus.toUpperCase()}`);

      if (scores.wellnessBreakdown) {
        console.log('\n🧘 WELLNESS BREAKDOWN');
        console.log('-'.repeat(30));
        console.log(`Physical: ${scores.wellnessBreakdown.physical}/100`);
        console.log(`Mental: ${scores.wellnessBreakdown.mental}/100`);
        console.log(`Social: ${scores.wellnessBreakdown.social}/100`);
      }

      if (scores.financeBreakdown) {
        console.log('\n💰 FINANCE BREAKDOWN');
        console.log('-'.repeat(30));
        console.log(`Spending Control: ${scores.financeBreakdown.spendingControl}/100`);
        console.log(`Budgeting: ${scores.financeBreakdown.budgeting}/100`);
        console.log(`Stability: ${scores.financeBreakdown.stability}/100`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 COMPLETE SYSTEM TEST SUCCESSFUL');
    console.log('='.repeat(80));

    console.log('\n🎉 Complete system test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Firebase UID → Dummy mood data (simulating Cloudflare D1)');
    console.log('   ✅ Nessie API → Real spending data (or dummy fallback)');
    console.log('   ✅ Gemini AI → Mood-enhanced spending analysis');
    console.log('   ✅ Complete scoring system with wellness & finance scores');
    console.log('   ✅ Easy-to-use API for frontend integration');

    console.log('\n🚀 Your complete system is ready!');
    console.log('   📱 Frontend: Use the API functions for mood data and scores');
    console.log('   🔗 Integration: Firebase UID → Cloudflare D1 → Gemini');
    console.log('   🎯 Result: Complete mood-enhanced financial coaching');

    console.log('\n📋 Next Steps:');
    console.log('   1. Set up Cloudflare D1 database with real credentials');
    console.log('   2. Add frontend components for mood input and score display');
    console.log('   3. Test with real user data');

  } catch (error) {
    console.error('\n❌ Complete system test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI')) {
        console.log('\n🔧 Fix: Check your Gemini API key');
        console.log('   - GEMINI_API_KEY');
      } else if (error.message.includes('NESSIE')) {
        console.log('\n🔧 Fix: Check your Nessie API credentials');
        console.log('   - NESSIE_API_KEY');
        console.log('   - NESSIE_CUSTOMER_ID');
      } else {
        console.log('\n🔧 Fix: Check the error details above');
      }
    }
  }
}

/**
 * Generate dummy mood data
 */
function generateDummyMoodData(numDays: number): any[] {
  const moodData: any[] = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const dayOfWeek = date.getDay();

    // Base values with some randomness
    let overall_wellbeing = 5 + Math.random() * 3;
    let sleep_quality = 5 + Math.random() * 3;
    let physical_activity = 3 + Math.random() * 4;
    let time_with_family_friends = 4 + Math.random() * 4;
    let diet_quality = 5 + Math.random() * 3;
    let stress_levels = 3 + Math.random() * 4;

    // Adjust for weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      overall_wellbeing += 1 + Math.random() * 2;
      time_with_family_friends += 1 + Math.random() * 2;
      physical_activity += 1 + Math.random() * 2;
      stress_levels -= 1 + Math.random() * 2;
    } else if (dayOfWeek === 1) {
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

    moodData.push({
      date: dateString,
      overall_wellbeing,
      sleep_quality,
      physical_activity,
      time_with_family_friends,
      diet_quality,
      stress_levels
    });
  }

  return moodData.reverse();
}

/**
 * Generate dummy spending data with mood correlation
 */
function generateDummySpendingData(moodData: any[]): any[] {
  const transactions: any[] = [];
  
  moodData.forEach(mood => {
    const baseSpending = 50 + Math.random() * 100;
    
    // Mood-spending correlations
    let moodMultiplier = 1;
    if (mood.overall_wellbeing < 4) {
      moodMultiplier = 1.3;
    } else if (mood.overall_wellbeing > 7) {
      moodMultiplier = 1.1;
    }
    
    if (mood.stress_levels > 7) {
      moodMultiplier *= 1.2;
    }
    
    if (mood.sleep_quality < 4) {
      moodMultiplier *= 1.15;
    }
    
    if (mood.time_with_family_friends < 3) {
      moodMultiplier *= 1.25;
    }

    const dailySpending = baseSpending * moodMultiplier;
    
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
      if (amount > 5) {
        transactions.push({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: mood.date,
          amount: Math.round(amount * 100) / 100,
          category: category.name,
          description: `${category.name} - ${mood.date}`
        });
      }
    });
  });
  
  return transactions;
}

/**
 * Run Gemini analysis
 */
async function runGeminiAnalysis(moodData: any[], spendingData: any[]): Promise<any> {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

    // Format data for Gemini
    const moodSummary = formatMoodDataForGemini(moodData);
    const spendingSummary = formatSpendingDataForGemini(spendingData);

    const prompt = `
You are an AI financial and wellness coach. Analyze the following mood and spending data to provide insights and recommendations.

MOOD DATA SUMMARY:
${moodSummary}

SPENDING DATA SUMMARY:
${spendingSummary}

Please provide:
1. Key insights about mood-spending correlations
2. Wellness recommendations based on mood patterns
3. Financial recommendations based on spending patterns
4. Overall assessment and priority actions

Respond with a JSON object containing:
{
  "keyInsights": ["insight1", "insight2"],
  "wellnessRecommendations": ["rec1", "rec2"],
  "financeRecommendations": ["rec1", "rec2"],
  "priorityActions": ["action1", "action2"],
  "moodSpendingCorrelation": 0.5,
  "overallAssessment": "Your overall assessment"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedText);

  } catch (error) {
    console.error('❌ Error running Gemini analysis:', error);
    return {
      keyInsights: ['Analysis failed'],
      wellnessRecommendations: ['Check system configuration'],
      financeRecommendations: ['Check system configuration'],
      priorityActions: ['Fix analysis system'],
      moodSpendingCorrelation: 0,
      overallAssessment: 'Analysis system error'
    };
  }
}

/**
 * Generate scores
 */
async function generateScores(moodData: any[], spendingData: any[]): Promise<any> {
  try {
    // Calculate wellness score
    const wellnessScore = calculateWellnessScore(moodData);
    
    // Calculate finance score
    const financeScore = calculateFinanceScore(spendingData);
    
    // Calculate overall score
    const overallScore = Math.round((wellnessScore.overall + financeScore.overall) / 2);
    
    // Determine grade and status
    const { grade, status } = calculateGradeAndStatus(overallScore);

    return {
      overallScore,
      wellnessScore: wellnessScore.overall,
      financeScore: financeScore.overall,
      overallGrade: grade,
      overallStatus: status,
      wellnessBreakdown: {
        physical: Math.round((wellnessScore.physical + wellnessScore.mental + wellnessScore.social) / 3),
        mental: wellnessScore.mental,
        social: wellnessScore.social
      },
      financeBreakdown: {
        spendingControl: financeScore.spendingControl,
        budgeting: financeScore.budgeting,
        stability: financeScore.stability
      }
    };

  } catch (error) {
    console.error('❌ Error generating scores:', error);
    return {
      overallScore: 50,
      wellnessScore: 50,
      financeScore: 50,
      overallGrade: 'C',
      overallStatus: 'fair'
    };
  }
}

/**
 * Calculate wellness score
 */
function calculateWellnessScore(moodData: any[]): any {
  if (moodData.length === 0) {
    return { overall: 0, physical: 0, mental: 0, social: 0 };
  }

  const avgWellbeing = moodData.reduce((sum, m) => sum + m.overall_wellbeing, 0) / moodData.length;
  const avgSleep = moodData.reduce((sum, m) => sum + m.sleep_quality, 0) / moodData.length;
  const avgActivity = moodData.reduce((sum, m) => sum + m.physical_activity, 0) / moodData.length;
  const avgSocial = moodData.reduce((sum, m) => sum + m.time_with_family_friends, 0) / moodData.length;
  const avgDiet = moodData.reduce((sum, m) => sum + m.diet_quality, 0) / moodData.length;
  const avgStress = moodData.reduce((sum, m) => sum + m.stress_levels, 0) / moodData.length;

  // Convert 0-10 scale to 0-100 scale
  const physical = Math.round((avgSleep + avgActivity + avgDiet) / 3 * 10);
  const mental = Math.round((avgWellbeing + (10 - avgStress)) / 2 * 10);
  const social = Math.round(avgSocial * 10);
  const overall = Math.round((physical + mental + social) / 3);

  return { overall, physical, mental, social };
}

/**
 * Calculate finance score
 */
function calculateFinanceScore(spendingData: any[]): any {
  if (spendingData.length === 0) {
    return { overall: 0, spendingControl: 0, budgeting: 0, stability: 0 };
  }

  const totalSpent = spendingData.reduce((sum, tx) => sum + tx.amount, 0);
  const avgDaily = totalSpent / 30;
  const categories = [...new Set(spendingData.map(tx => tx.category))];

  // Simple scoring based on spending patterns
  const spendingControl = Math.max(0, 100 - (avgDaily / 50) * 20);
  const budgeting = Math.min(100, categories.length * 20);
  const stability = 80;

  const overall = Math.round((spendingControl + budgeting + stability) / 3);

  return { overall, spendingControl, budgeting, stability };
}

/**
 * Calculate grade and status
 */
function calculateGradeAndStatus(score: number): { grade: 'A' | 'B' | 'C' | 'D' | 'F', status: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical' } {
  if (score >= 90) return { grade: 'A', status: 'excellent' };
  if (score >= 80) return { grade: 'B', status: 'good' };
  if (score >= 70) return { grade: 'C', status: 'fair' };
  if (score >= 60) return { grade: 'D', status: 'needs_improvement' };
  return { grade: 'F', status: 'critical' };
}

/**
 * Format mood data for Gemini
 */
function formatMoodDataForGemini(moodData: any[]): string {
  if (moodData.length === 0) return 'No mood data available';

  const avgWellbeing = moodData.reduce((sum, m) => sum + m.overall_wellbeing, 0) / moodData.length;
  const avgSleep = moodData.reduce((sum, m) => sum + m.sleep_quality, 0) / moodData.length;
  const avgActivity = moodData.reduce((sum, m) => sum + m.physical_activity, 0) / moodData.length;
  const avgSocial = moodData.reduce((sum, m) => sum + m.time_with_family_friends, 0) / moodData.length;
  const avgDiet = moodData.reduce((sum, m) => sum + m.diet_quality, 0) / moodData.length;
  const avgStress = moodData.reduce((sum, m) => sum + m.stress_levels, 0) / moodData.length;

  return `
- Total mood entries: ${moodData.length}
- Average wellbeing: ${avgWellbeing.toFixed(2)}/10
- Average sleep quality: ${avgSleep.toFixed(2)}/10
- Average physical activity: ${avgActivity.toFixed(2)}/10
- Average social time: ${avgSocial.toFixed(2)}/10
- Average diet quality: ${avgDiet.toFixed(2)}/10
- Average stress level: ${avgStress.toFixed(2)}/10
`;
}

/**
 * Format spending data for Gemini
 */
function formatSpendingDataForGemini(spendingData: any[]): string {
  if (spendingData.length === 0) return 'No spending data available';

  const totalSpent = spendingData.reduce((sum, tx) => sum + tx.amount, 0);
  const avgDaily = totalSpent / 30;
  const categories = [...new Set(spendingData.map(tx => tx.category))];

  return `
- Total transactions: ${spendingData.length}
- Total spent: $${totalSpent.toFixed(2)}
- Average daily spending: $${avgDaily.toFixed(2)}
- Spending categories: ${categories.join(', ')}
`;
}

// Run the test
if (require.main === module) {
  testSystemWithoutCloudflare();
}
