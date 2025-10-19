/**
 * Firebase Mood-Enhanced Analysis
 * Integrates mood data from Firebase with spending analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, AnalysisResult } from './types';
import { MoodEntry } from './moodTypes';
import { processSpendingData, formatDataForGemini } from './utils/dataProcessor';
import { SPENDING_ANALYSIS_PROMPT } from './prompts/spendingAnalysisPrompt';
import { validateTransactionArray, validateDateRange, validateApiKey } from './utils/validators';
import { handleError, logError, GeminiAPIError } from './utils/errorHandler';
import { FirebaseMoodService } from './firebaseMoodService';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}

/**
 * Analyze spending with mood data from Firebase
 */
export async function analyzeSpendingWithFirebaseMood(
  transactions: Transaction[],
  userId: string,
  startDate: string,
  endDate: string
): Promise<AnalysisResult> {
  try {
    console.log(`🔍 Analyzing spending with Firebase mood data for user ${userId}`);
    
    const validatedTransactions = validateTransactionArray(transactions);
    validateDateRange(validatedTransactions);
    validateApiKey(GEMINI_API_KEY!);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

    // Get mood data from Firebase
    const moodService = new FirebaseMoodService();
    const moodEntries = await moodService.getMoodEntries(userId, startDate, endDate);
    
    console.log(`📊 Found ${moodEntries.length} mood entries and ${validatedTransactions.length} transactions`);

    if (moodEntries.length === 0) {
      console.log('⚠️ No mood data found, falling back to basic analysis');
      return await analyzeSpending(validatedTransactions);
    }

    // Calculate mood-spending correlations
    const moodSpendingCorrelations = await moodService.calculateMoodSpendingCorrelations(
      userId, 
      startDate, 
      endDate, 
      validatedTransactions
    );

    // Get mood statistics
    const moodStats = await moodService.getMoodStatistics(userId, startDate, endDate);

    console.log('🤖 Processing mood-enhanced analysis with Gemini...');
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

    // Enhanced prompt with mood data
    const moodEnhancedPrompt = `${SPENDING_ANALYSIS_PROMPT}

MOOD DATA ANALYSIS:
The user has logged ${moodStats.totalEntries} mood entries over the analysis period.

MOOD STATISTICS:
- Average Wellbeing: ${moodStats.averageWellbeing.toFixed(2)} (scale: 0 to 10)
- Average Sleep Quality: ${moodStats.averageSleep.toFixed(2)} (scale: 0 to 10)  
- Average Stress Level: ${moodStats.averageStress.toFixed(2)} (scale: 0 to 10)

MOOD DISTRIBUTION:
${Object.entries(moodStats.moodDistribution).map(([mood, count]) => 
  `- ${mood}: ${count} days (${((count/moodStats.totalEntries)*100).toFixed(1)}%)`
).join('\n')}

DAILY MOOD DATA:
${JSON.stringify(formattedMoodData, null, 2)}

MOOD-SPENDING CORRELATIONS:
${JSON.stringify(moodSpendingCorrelations.slice(0, 10), null, 2)} // Show first 10 correlations

ENHANCED ANALYSIS INSTRUCTIONS:
1. Analyze the correlation between mood patterns and spending behavior
2. Identify specific emotional triggers for spending (stress, low mood, etc.)
3. Provide mood-aware recommendations that address emotional spending patterns
4. Include wellness tips that are triggered by specific mood states
5. Connect spending anomalies to mood patterns when possible

Focus on the psychological connection between emotional state and financial decisions.`;

    const prompt = `${moodEnhancedPrompt}

SPENDING DATA:
${formattedData}

Respond with valid JSON following the exact format specified in the prompt.`;

    console.log('📤 Sending mood-enhanced request to Gemini 2.5 Pro...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📥 Received mood-enhanced response from Gemini');
    const analysisResult = parseGeminiResponse(text);

    console.log('✅ Mood-enhanced analysis completed successfully');
    return analysisResult;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'analyzeSpendingWithFirebaseMood');

    // Fallback to basic spending analysis if mood integration fails
    try {
      console.log('🔄 Falling back to basic spending analysis...');
      const validatedData = validateTransactionArray(transactions);
      return await analyzeSpending(validatedData);
    } catch (validationError) {
      throw analysisError;
    }
  }
}

/**
 * Basic spending analysis (fallback)
 */
async function analyzeSpending(transactions: Transaction[]): Promise<AnalysisResult> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

  const processedData = processSpendingData(transactions);
  const formattedData = formatDataForGemini(processedData, transactions);

  const result = await model.generateContent(`${SPENDING_ANALYSIS_PROMPT}\n\n${formattedData}`);
  const response = await result.response;
  const text = response.text();

  return parseGeminiResponse(text);
}

/**
 * Parse Gemini response into AnalysisResult
 */
function parseGeminiResponse(text: string): AnalysisResult {
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);

    if (!result.summary || !result.categories || !result.anomalies || !result.recommendations || !result.wellnessTips) {
      throw new GeminiAPIError('Invalid response structure from Gemini for mood-enhanced analysis');
    }

    return result as AnalysisResult;
  } catch (error) {
    if (error instanceof GeminiAPIError) {
      throw error;
    }
    throw new GeminiAPIError('Invalid JSON response from Gemini AI for mood-enhanced analysis', undefined, error as Error);
  }
}
