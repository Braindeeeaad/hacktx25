/**
 * Wellness and Finance Scoring System
 * Uses Gemini AI to generate intelligent scores based on mood and spending data
 * Provides easy-to-display metrics for the frontend
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { MoodEntry } from './moodTypes';
import { processSpendingData } from './utils/dataProcessor';
import { validateTransactionArray, validateApiKey } from './utils/validators';
import { handleError, logError, GeminiAPIError } from './utils/errorHandler';
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
 * Interface for wellness score with detailed breakdown
 */
export interface WellnessScore {
  overall: number; // 0-100 overall wellness score
  breakdown: {
    physical: number; // Physical health (sleep, activity, diet)
    mental: number; // Mental health (wellbeing, stress)
    social: number; // Social connection
  };
  trends: {
    improving: string[]; // Areas that are improving
    declining: string[]; // Areas that need attention
    stable: string[]; // Areas that are consistent
  };
  insights: string[]; // AI-generated insights about wellness patterns
  recommendations: string[]; // Specific recommendations for improvement
}

/**
 * Interface for finance score with detailed breakdown
 */
export interface FinanceScore {
  overall: number; // 0-100 overall finance score
  breakdown: {
    spending: number; // Spending control and patterns
    budgeting: number; // Budget adherence and planning
    stability: number; // Financial stability and consistency
  };
  trends: {
    improving: string[]; // Financial areas that are improving
    declining: string[]; // Financial areas that need attention
    stable: string[]; // Financial areas that are consistent
  };
  insights: string[]; // AI-generated insights about financial patterns
  recommendations: string[]; // Specific recommendations for improvement
}

/**
 * Interface for combined wellness-finance correlation
 */
export interface WellnessFinanceCorrelation {
  correlation: number; // -1 to 1 correlation between wellness and finance
  insights: string[]; // How wellness affects financial decisions
  recommendations: string[]; // How to improve both wellness and finance together
}

/**
 * Interface for the complete scoring system result
 */
export interface ScoringSystemResult {
  wellness: WellnessScore;
  finance: FinanceScore;
  correlation: WellnessFinanceCorrelation;
  summary: {
    overallScore: number; // Combined wellness and finance score
    grade: 'A' | 'B' | 'C' | 'D' | 'F'; // Letter grade
    status: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical';
    keyInsights: string[]; // Top 3 insights
    priorityActions: string[]; // Top 3 actions to take
  };
}

/**
 * Generate wellness score using Gemini AI
 */
export async function generateWellnessScore(
  moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]
): Promise<WellnessScore> {
  try {
    validateApiKey(GEMINI_API_KEY!);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

    // Calculate basic statistics
    const totalEntries = moodEntries.length;
    const avgWellbeing = moodEntries.reduce((sum, entry) => sum + entry.overall_wellbeing, 0) / totalEntries;
    const avgSleep = moodEntries.reduce((sum, entry) => sum + entry.sleep_quality, 0) / totalEntries;
    const avgActivity = moodEntries.reduce((sum, entry) => sum + entry.physical_activity, 0) / totalEntries;
    const avgSocial = moodEntries.reduce((sum, entry) => sum + entry.time_with_family_friends, 0) / totalEntries;
    const avgDiet = moodEntries.reduce((sum, entry) => sum + entry.diet_quality, 0) / totalEntries;
    const avgStress = moodEntries.reduce((sum, entry) => sum + entry.stress_levels, 0) / totalEntries;

    // Calculate trends
    const recentEntries = moodEntries.slice(-7); // Last 7 days
    const olderEntries = moodEntries.slice(0, -7); // Earlier entries
    
    const recentAvgWellbeing = recentEntries.reduce((sum, entry) => sum + entry.overall_wellbeing, 0) / recentEntries.length;
    const olderAvgWellbeing = olderEntries.reduce((sum, entry) => sum + entry.overall_wellbeing, 0) / olderEntries.length;
    
    const recentAvgStress = recentEntries.reduce((sum, entry) => sum + entry.stress_levels, 0) / recentEntries.length;
    const olderAvgStress = olderEntries.reduce((sum, entry) => sum + entry.stress_levels, 0) / olderEntries.length;

    const prompt = `You are a wellness expert analyzing personal wellness data. Generate a comprehensive wellness score (0-100) based on the following data:

WELLNESS DATA:
- Overall Wellbeing: ${avgWellbeing.toFixed(2)}/10 (average)
- Sleep Quality: ${avgSleep.toFixed(2)}/10 (average)
- Physical Activity: ${avgActivity.toFixed(2)}/10 (average)
- Social Connection: ${avgSocial.toFixed(2)}/10 (average)
- Diet Quality: ${avgDiet.toFixed(2)}/10 (average)
- Stress Levels: ${avgStress.toFixed(2)}/10 (average)

TRENDS:
- Recent Wellbeing: ${recentAvgWellbeing.toFixed(2)}/10 vs Earlier: ${olderAvgWellbeing.toFixed(2)}/10
- Recent Stress: ${recentAvgStress.toFixed(2)}/10 vs Earlier: ${olderAvgStress.toFixed(2)}/10

SCORING CRITERIA:
- Physical Health (40%): Sleep quality, physical activity, diet quality
- Mental Health (40%): Overall wellbeing, stress management
- Social Health (20%): Social connection and relationships

Respond with valid JSON only:
{
  "overall": 85,
  "breakdown": {
    "physical": 80,
    "mental": 90,
    "social": 85
  },
  "trends": {
    "improving": ["sleep quality", "stress management"],
    "declining": ["physical activity"],
    "stable": ["social connection"]
  },
  "insights": [
    "Sleep quality has improved significantly over the past week",
    "Stress levels are well-managed with consistent low scores",
    "Physical activity could be increased for better overall health"
  ],
  "recommendations": [
    "Aim for 7-8 hours of sleep consistently",
    "Add 30 minutes of daily physical activity",
    "Maintain current stress management practices"
  ]
}`;

    console.log('Generating wellness score with Gemini...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const wellnessScore = parseWellnessScore(text);
    console.log(`Wellness score generated: ${wellnessScore.overall}/100`);
    
    return wellnessScore;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'generateWellnessScore');
    throw analysisError;
  }
}

/**
 * Generate finance score using Gemini AI
 */
export async function generateFinanceScore(
  transactions: any[]
): Promise<FinanceScore> {
  try {
    validateApiKey(GEMINI_API_KEY!);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

    const validatedTransactions = validateTransactionArray(transactions);
    const processedData = processSpendingData(validatedTransactions);

    // Calculate spending patterns
    const totalSpent = processedData.totalSpent;
    const averageDaily = processedData.averageDaily;
    const categoryTotals = processedData.categoryTotals;
    const anomalies = processedData.anomalies;

    // Calculate spending consistency
    const dailySpending: Record<string, number> = {};
    validatedTransactions.forEach(tx => {
      dailySpending[tx.date] = (dailySpending[tx.date] || 0) + tx.amount;
    });
    
    const dailyAmounts = Object.values(dailySpending);
    const spendingVariance = calculateVariance(dailyAmounts);
    const spendingConsistency = Math.max(0, 100 - (spendingVariance / averageDaily) * 10);

    const prompt = `You are a financial expert analyzing personal spending data. Generate a comprehensive finance score (0-100) based on the following data:

FINANCIAL DATA:
- Total Spent: $${totalSpent.toFixed(2)} over ${processedData.spanDays} days
- Average Daily: $${averageDaily.toFixed(2)}
- Spending Consistency: ${spendingConsistency.toFixed(1)}/100
- Number of Anomalies: ${anomalies.length}

CATEGORY BREAKDOWN:
${Object.entries(categoryTotals).map(([category, amount]) => 
  `- ${category}: $${amount.toFixed(2)} (${((amount/totalSpent)*100).toFixed(1)}%)`
).join('\n')}

ANOMALIES DETECTED:
${anomalies.slice(0, 5).map(anomaly => 
  `- ${anomaly.date}: $${anomaly.amount} in ${anomaly.category}`
).join('\n')}

SCORING CRITERIA:
- Spending Control (40%): Consistency, avoiding overspending, category balance
- Budgeting (30%): Planning, category distribution, avoiding impulse purchases
- Stability (30%): Consistent patterns, low variance, manageable spending

Respond with valid JSON only:
{
  "overall": 75,
  "breakdown": {
    "spending": 80,
    "budgeting": 70,
    "stability": 75
  },
  "trends": {
    "improving": ["spending consistency", "category balance"],
    "declining": ["impulse purchases"],
    "stable": ["overall spending patterns"]
  },
  "insights": [
    "Spending is generally consistent with good category distribution",
    "Some impulse purchases detected in shopping category",
    "Overall financial habits are stable and manageable"
  ],
  "recommendations": [
    "Set up budget alerts for high-spending categories",
    "Implement a 24-hour rule for non-essential purchases",
    "Review spending patterns weekly to maintain consistency"
  ]
}`;

    console.log('Generating finance score with Gemini...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const financeScore = parseFinanceScore(text);
    console.log(`Finance score generated: ${financeScore.overall}/100`);
    
    return financeScore;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'generateFinanceScore');
    throw analysisError;
  }
}

/**
 * Generate wellness-finance correlation analysis
 */
export async function generateWellnessFinanceCorrelation(
  moodEntries: Omit<MoodEntry, 'id' | 'userId'>[],
  transactions: any[]
): Promise<WellnessFinanceCorrelation> {
  try {
    validateApiKey(GEMINI_API_KEY!);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

    // Calculate basic correlations
    const dailySpending: Record<string, number> = {};
    transactions.forEach(tx => {
      dailySpending[tx.date] = (dailySpending[tx.date] || 0) + tx.amount;
    });

    const dailyMood: Record<string, number> = {};
    moodEntries.forEach(entry => {
      dailyMood[entry.date] = entry.overall_wellbeing;
    });

    // Find days with both mood and spending data
    const correlationData: Array<{mood: number, spending: number}> = [];
    for (const date in dailySpending) {
      if (dailyMood[date]) {
        correlationData.push({
          mood: dailyMood[date],
          spending: dailySpending[date]
        });
      }
    }

    const correlation = calculateCorrelation(
      correlationData.map(d => d.mood),
      correlationData.map(d => d.spending)
    );

    const prompt = `You are a wellness-finance expert analyzing the correlation between personal wellness and financial behavior. Generate insights based on the following data:

CORRELATION DATA:
- Correlation Coefficient: ${correlation.toFixed(3)} (${correlation > 0.3 ? 'positive' : correlation < -0.3 ? 'negative' : 'weak'} correlation)
- Days Analyzed: ${correlationData.length}
- Average Mood: ${correlationData.reduce((sum, d) => sum + d.mood, 0) / correlationData.length}/10
- Average Spending: $${correlationData.reduce((sum, d) => sum + d.spending, 0) / correlationData.length}

WELLNESS-FINANCE PATTERNS:
${correlationData.slice(0, 10).map(d => 
  `- Mood: ${d.mood}/10, Spending: $${d.spending.toFixed(2)}`
).join('\n')}

Analyze how wellness affects financial decisions and provide actionable insights.

Respond with valid JSON only:
{
  "correlation": ${correlation},
  "insights": [
    "High stress days correlate with increased spending on comfort items",
    "Better mood days show more intentional and planned purchases",
    "Social connection levels impact spending patterns significantly"
  ],
  "recommendations": [
    "Practice stress management to reduce emotional spending",
    "Plan purchases during high-mood days for better decisions",
    "Maintain social connections to reduce loneliness-driven spending"
  ]
}`;

    console.log('Generating wellness-finance correlation with Gemini...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const correlationResult = parseWellnessFinanceCorrelation(text);
    console.log(`Wellness-finance correlation: ${correlationResult.correlation.toFixed(3)}`);
    
    return correlationResult;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'generateWellnessFinanceCorrelation');
    throw analysisError;
  }
}

/**
 * Generate complete scoring system
 */
export async function generateCompleteScoringSystem(
  moodEntries: Omit<MoodEntry, 'id' | 'userId'>[],
  transactions: any[]
): Promise<ScoringSystemResult> {
  try {
    console.log('🚀 Generating complete scoring system...');
    
    // Generate all scores in parallel for efficiency
    const [wellness, finance, correlation] = await Promise.all([
      generateWellnessScore(moodEntries),
      generateFinanceScore(transactions),
      generateWellnessFinanceCorrelation(moodEntries, transactions)
    ]);

    // Calculate overall score (weighted average)
    const overallScore = Math.round((wellness.overall * 0.6) + (finance.overall * 0.4));
    
    // Determine grade and status
    const grade = getGrade(overallScore);
    const status = getStatus(overallScore);
    
    // Generate key insights
    const keyInsights = [
      ...wellness.insights.slice(0, 2),
      ...finance.insights.slice(0, 1)
    ];
    
    // Generate priority actions
    const priorityActions = [
      ...wellness.recommendations.slice(0, 2),
      ...finance.recommendations.slice(0, 1)
    ];

    const result: ScoringSystemResult = {
      wellness,
      finance,
      correlation,
      summary: {
        overallScore,
        grade,
        status,
        keyInsights,
        priorityActions
      }
    };

    console.log(`✅ Complete scoring system generated: ${overallScore}/100 (${grade})`);
    return result;

  } catch (error) {
    const analysisError = handleError(error);
    logError(analysisError, 'generateCompleteScoringSystem');
    throw analysisError;
  }
}

// Helper functions
function parseWellnessScore(text: string): WellnessScore {
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);
    return result as WellnessScore;
  } catch (error) {
    throw new GeminiAPIError('Invalid JSON response from Gemini for wellness score', undefined, error as Error);
  }
}

function parseFinanceScore(text: string): FinanceScore {
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);
    return result as FinanceScore;
  } catch (error) {
    throw new GeminiAPIError('Invalid JSON response from Gemini for finance score', undefined, error as Error);
  }
}

function parseWellnessFinanceCorrelation(text: string): WellnessFinanceCorrelation {
  try {
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);
    return result as WellnessFinanceCorrelation;
  } catch (error) {
    throw new GeminiAPIError('Invalid JSON response from Gemini for wellness-finance correlation', undefined, error as Error);
  }
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  return variance;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  let numerator = 0;
  let sumXSq = 0;
  let sumYSq = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - meanX;
    const yDiff = y[i] - meanY;
    numerator += xDiff * yDiff;
    sumXSq += xDiff * xDiff;
    sumYSq += yDiff * yDiff;
  }
  
  const denominator = Math.sqrt(sumXSq * sumYSq);
  return denominator === 0 ? 0 : numerator / denominator;
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getStatus(score: number): 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 40) return 'needs_improvement';
  return 'critical';
}
