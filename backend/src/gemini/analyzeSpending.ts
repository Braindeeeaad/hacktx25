import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, AnalysisResult } from './types';
import { processSpendingData, formatDataForGemini } from './utils/dataProcessor';
import { SPENDING_ANALYSIS_PROMPT } from './prompts/spendingAnalysisPrompt';
import { validateTransactionArray, validateDateRange, validateApiKey } from './utils/validators';
import { handleError, logError, GeminiAPIError } from './utils/errorHandler';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Console declaration for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

// 🔑 GET GEMINI API KEY FROM ENVIRONMENT
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate API key is present
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required. Please set it in your .env file.');
}

/**
 * Main function to analyze spending patterns using Gemini 2.5 Pro
 * @param data Array of transaction objects
 * @returns Promise<AnalysisResult> Structured analysis results
 */
export async function analyzeSpending(data: any[]): Promise<AnalysisResult> {
  try {
    // Validate input data
    const validatedData = validateTransactionArray(data);
    validateDateRange(validatedData);
    
    // Validate API key
    validateApiKey(GEMINI_API_KEY!);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Process the spending data
    console.log(`Processing ${validatedData.length} transactions...`);
    const processedData = processSpendingData(validatedData);
    
    // Format data for Gemini
    const formattedData = formatDataForGemini(processedData, validatedData);
    
    // Create the prompt for Gemini
    const prompt = `${SPENDING_ANALYSIS_PROMPT}

Please analyze the following spending data and provide insights:

${formattedData}

Respond with valid JSON only, following the exact format specified in the prompt.`;

    console.log('Sending request to Gemini 2.5 Pro...');
    
    // Send request to Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini');

    // Parse and validate the response
    const analysisResult = parseGeminiResponse(text);
    
    console.log('Analysis completed successfully');
    return analysisResult;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'analyzeSpending');
    
    // Return a fallback analysis if Gemini fails
    try {
      const validatedData = validateTransactionArray(data);
      return createFallbackAnalysis(validatedData);
    } catch (validationError) {
      throw analysisError;
    }
  }
}


/**
 * Parses and validates the Gemini response
 */
function parseGeminiResponse(text: string): AnalysisResult {
  try {
    // Clean the response text (remove markdown formatting if present)
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(cleanedText);
    
    // Validate the structure
    if (!result.summary || !result.categories || !result.anomalies || !result.recommendations) {
      throw new GeminiAPIError('Invalid response structure from Gemini');
    }

    return result as AnalysisResult;
  } catch (error) {
    if (error instanceof GeminiAPIError) {
      throw error;
    }
    throw new GeminiAPIError('Invalid JSON response from Gemini AI', undefined, error as Error);
  }
}

/**
 * Creates a fallback analysis when Gemini fails
 */
function createFallbackAnalysis(data: Transaction[]): AnalysisResult {
  const processedData = processSpendingData(data);
  
  const categories = Object.keys(processedData.categoryTotals).map(category => ({
    category,
    trend: processedData.categoryChanges[category].startsWith('+') ? 'up' as const : 
           processedData.categoryChanges[category].startsWith('-') ? 'down' as const : 'stable' as const,
    change: processedData.categoryChanges[category],
    note: `Total spent: $${processedData.categoryTotals[category].toFixed(2)}`
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
      'Consider setting up budget alerts for high-spending categories.',
      'Review your spending patterns weekly to identify trends.',
      'Set specific goals for each spending category.'
    ]
  };
}

// Export types for external use
export { Transaction, AnalysisResult, CategoryAnalysis, Anomaly, Summary } from './types';
