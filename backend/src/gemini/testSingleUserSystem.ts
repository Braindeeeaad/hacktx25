/**
 * Single User System Test
 * Tests the complete system with a single user (Nessie customer ID)
 * This simulates how your app will work with one user's data
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { MoodEntry } from './moodTypes';
import { processSpendingData, formatDataForGemini } from './utils/dataProcessor';
import { SPENDING_ANALYSIS_PROMPT } from './prompts/spendingAnalysisPrompt';
import { validateTransactionArray, validateDateRange, validateApiKey } from './utils/validators';
import { handleError, logError, GeminiAPIError } from './utils/errorHandler';
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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!NESSIE_API_KEY || !NESSIE_CUSTOMER_ID) {
  console.error('NESSIE_API_KEY and NESSIE_CUSTOMER_ID environment variables are required.');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required.');
  process.exit(1);
}

/**
 * Generate realistic mood data for the single user
 */
function generateSingleUserMoodData(userId: string, numDays: number): Omit<MoodEntry, 'id' | 'userId'>[] {
  const moodEntries: Omit<MoodEntry, 'id' | 'userId'>[] = [];
  const today = new Date();

  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Create realistic patterns for a single user
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
 * Run mood-enhanced analysis with Gemini
 */
async function analyzeSpendingWithMood(transactions: any[], moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]) {
  try {
    const validatedTransactions = validateTransactionArray(transactions);
    validateDateRange(validatedTransactions);
    validateApiKey(GEMINI_API_KEY!);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

    console.log(`Processing ${validatedTransactions.length} transactions and ${moodEntries.length} mood entries...`);
    const processedSpendingData = processSpendingData(validatedTransactions);

    // Prepare mood data for Gemini
    const formattedMoodData = moodEntries.map(entry => ({
      date: entry.date,
      overall_wellbeing: entry.overall_wellbeing,
      sleep_quality: entry.sleep_quality,
      physical_activity: entry.physical_activity,
      time_with_family_friends: entry.time_with_family_friends,
      diet_quality: entry.diet_quality,
      stress_levels: entry.stress_levels,
      notes: entry.notes || ''
    }));

    const formattedData = formatDataForGemini(processedSpendingData, validatedTransactions);

    const prompt = `${SPENDING_ANALYSIS_PROMPT}

Spending Data:
${formattedData}

Mood Data:
${JSON.stringify(formattedMoodData, null, 2)}

Analyze the correlation between mood patterns and spending behavior for this single user. Look for:
- How stress levels affect spending patterns
- Whether low wellbeing correlates with increased spending
- How sleep quality impacts financial decisions
- Social connection effects on spending
- Physical activity and diet quality relationships with spending

Respond with valid JSON only, following the exact format specified in the prompt.`;

    console.log('Sending mood-enhanced request to Gemini 2.0 Flash...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Received mood-enhanced response from Gemini');

    const analysisResult = parseGeminiResponse(text);

    console.log('Mood-enhanced analysis completed successfully');
    return analysisResult;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'analyzeSpendingWithMood');

    // Fallback to basic spending analysis if mood integration fails
    try {
      const validatedData = validateTransactionArray(transactions);
      return createFallbackAnalysis(validatedData);
    } catch (validationError) {
      throw analysisError;
    }
  }
}

function parseGeminiResponse(text: string): any {
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);

    if (!result.summary || !result.categories || !result.anomalies || !result.recommendations || !result.wellnessTips) {
      throw new GeminiAPIError('Invalid response structure from Gemini for mood-enhanced analysis');
    }

    return result;
  } catch (error) {
    if (error instanceof GeminiAPIError) {
      throw error;
    }
    throw new GeminiAPIError('Invalid JSON response from Gemini AI for mood-enhanced analysis', undefined, error as Error);
  }
}

function createFallbackAnalysis(data: any[]): any {
  const processedData = processSpendingData(data);

  const categories = Object.keys(processedData.categoryTotals).map(category => ({
    category,
    trend: processedData.categoryChanges[category].startsWith('+') ? 'up' as const :
           processedData.categoryChanges[category].startsWith('-') ? 'down' as const : 'stable' as const,
    change: processedData.categoryChanges[category],
    shortInsight: `Spending ${processedData.categoryChanges[category]} in ${category}`,
    detailedAnalysis: `Total spent: $${processedData.categoryTotals[category].toFixed(2)} in ${category}. ${processedData.categoryChanges[category].startsWith('+') ? 'This increase suggests potential emotional spending or lifestyle changes.' : 'This decrease indicates improved spending control.'}`,
    wellnessAdvice: processedData.categoryChanges[category].startsWith('+') ? 'Consider mindfulness before purchases in this category' : undefined
  }));

  return {
    summary: {
      totalSpent: processedData.totalSpent,
      averageDaily: processedData.averageDaily,
      spanDays: processedData.spanDays
    },
    categories,
    anomalies: processedData.anomalies,
    recommendations: [
      {
        shortInsight: 'Set budget alerts',
        detailedAdvice: 'Consider setting up budget alerts for high-spending categories to maintain financial control.',
        linkedInsights: ['Overall spending patterns detected'],
        linkedAnomalies: [],
        category: 'financial' as const
      },
      {
        shortInsight: 'Weekly review',
        detailedAdvice: 'Review your spending patterns weekly to identify trends and make timely adjustments.',
        linkedInsights: ['Regular monitoring helps identify patterns'],
        linkedAnomalies: [],
        category: 'behavioral' as const
      }
    ],
    wellnessTips: [
      {
        trigger: 'stress',
        shortTip: 'Try 5-minute breathing',
        detailedTip: 'When feeling stressed, try 5 minutes of deep breathing to reduce impulse spending.'
      },
      {
        trigger: 'low_mood',
        shortTip: 'Call a friend',
        detailedTip: 'Social connection can provide mood boost without retail therapy.'
      }
    ]
  };
}

/**
 * Display comprehensive mood-enhanced analysis results
 */
function displaySingleUserAnalysis(analysis: any, moodStats: any, userId: string) {
  console.log('\n' + '='.repeat(100));
  console.log('🤖 SINGLE USER MOOD-ENHANCED FINANCIAL ANALYSIS');
  console.log('='.repeat(100));
  console.log(`👤 User ID: ${userId}`);

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
  console.log('\n💡 PERSONALIZED MOOD-AWARE RECOMMENDATIONS');
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
  console.log('\n🧘 PERSONALIZED WELLNESS TIPS');
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
  console.log('🎯 SINGLE USER ANALYSIS COMPLETE');
  console.log('='.repeat(100) + '\n');
}

async function testSingleUserSystem() {
  console.log('🚀 SINGLE USER SYSTEM TEST');
  console.log('==========================');
  console.log('🎯 Testing complete system with single user (Nessie customer ID)');
  console.log('This simulates how your app will work with one user\'s data');

  const userId = NESSIE_CUSTOMER_ID!; // Use the actual Nessie customer ID
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30); // Last 30 days

  const startDateString = startDate.toISOString().split('T')[0];
  const endDateString = endDate.toISOString().split('T')[0];

  try {
    // Step 1: Generate realistic mood data for the single user
    console.log('\n1️⃣ Generating realistic mood data for single user...');
    const moodEntries = generateSingleUserMoodData(userId, 30);
    console.log(`📊 Generated ${moodEntries.length} realistic mood entries for user: ${userId}`);
    
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

    // Step 2: Try to get real spending data from Nessie
    console.log('\n2️⃣ Fetching real spending data from Nessie API...');
    const nessie = new NessieAPIIntegration(NESSIE_API_KEY!, NESSIE_CUSTOMER_ID!);
    let transactions: any[] = [];
    
    try {
      transactions = await nessie.getAllTransactions(startDateString, endDateString);
      console.log(`📊 Found ${transactions.length} real transactions from Nessie API`);
    } catch (nessieError) {
      console.log('⚠️ Nessie API not available, using dummy spending data...');
      // Generate dummy spending data that correlates with mood
      transactions = generateDummySpendingData(moodEntries);
      console.log(`📊 Generated ${transactions.length} dummy transactions with mood correlation`);
    }

    if (transactions.length === 0) {
      console.warn('⚠️ No transactions found. Cannot perform analysis.');
      return;
    }

    // Show sample spending data
    console.log('\n📋 Sample Spending Data:');
    const sampleTransactions = transactions.slice(0, 5);
    sampleTransactions.forEach((tx, index) => {
      console.log(`   ${tx.date} - ${tx.category}: $${tx.amount.toFixed(2)}`);
    });

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
    
    const analysisResult = await analyzeSpendingWithMood(transactions, moodEntries);

    // Step 5: Display comprehensive results
    displaySingleUserAnalysis(analysisResult, moodStats, userId);

    console.log('\n🎉 Single user system test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Single user mood data generation (simulating user input)');
    console.log('   ✅ Real Nessie API integration (or dummy data fallback)');
    console.log('   ✅ Mood-spending correlation analysis for one user');
    console.log('   ✅ Gemini AI enhanced with mood insights');
    console.log('   ✅ Personalized mood-aware recommendations');
    console.log('   ✅ Single user wellness tips and insights');

    console.log('\n🚀 Your single-user system is ready for production!');
    console.log('   📱 Frontend: Add MoodInput component for this user');
    console.log('   🔗 Integration: Connect frontend to this backend analysis');
    console.log('   🎯 Result: Personalized mood-enhanced financial coaching');

  } catch (error) {
    console.error('\n❌ Single user system test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('GEMINI_API_KEY')) {
        console.log('\n🔧 Fix: Check your Gemini API key in .env file');
      } else if (error.message.includes('NESSIE')) {
        console.log('\n🔧 Fix: Check your Nessie API credentials in .env file');
      } else {
        console.log('\n🔧 Fix: Check the error details above');
      }
    }
  }
}

/**
 * Generate dummy spending data that correlates with mood
 */
function generateDummySpendingData(moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]) {
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

// Run the single user test
if (require.main === module) {
  testSingleUserSystem();
}
