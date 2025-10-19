import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction, ProcessedData, Anomaly, FinanceScore, AnalysisResult, WellbeingData, WellbeingResult } from "./api_types";
import { SPENDING_ANALYSIS_PROMPT } from './spendingAnalysisPrompt';
import { WELLBEING_ANALYSIS_PROMPT } from './wellbeingAnalysisPrompt';

export class GeminiIntegration {
    private apiKey: string;
    private flash_model: GenerativeModel;
    private pro_model: GenerativeModel;

    constructor(apiKey: string = "AIzaSyAvanlVJGoRssaEvt9pisH_JPdbX43lPs8") {
        this.apiKey = apiKey;
        const genAI = new GoogleGenerativeAI(apiKey!);
        this.flash_model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });
        this.pro_model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    }

    async generateFinanceScore(transactions: Transaction[]){
        try {
        const processedData = processSpendingData(transactions);

    // Calculate spending patterns
        const totalSpent = processedData.totalSpent;
        const averageDaily = processedData.averageDaily;
        const categoryTotals = processedData.categoryTotals;
        const anomalies = processedData.anomalies;

    // Calculate spending consistency
        const dailySpending: Record<string, number> = {};
        transactions.forEach(tx => {
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

        const result = await this.flash_model.generateContent(prompt);
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

  async analyzeSpending(data: Transaction[]): Promise<AnalysisResult> {
    try {
    // Validate input data
      


      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(this.apiKey!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Process the spending data
    console.log(`Processing ${data.length} transactions...`);
    const processedData = processSpendingData(data);
    
    // Format data for Gemini
    const formattedData = formatDataForGemini(processedData, data);
    
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
      return createFallbackAnalysis(data);
    } catch (validationError) {
      throw analysisError;
    }
  }
}

    async analyzeWellness(data: WellbeingData[]){
      try {
        // Validate input data
        if (!data || data.length === 0) {
          console.log('No wellbeing data provided for analysis');
          return [];
        }

        console.log('Analyzing wellbeing data:', data);

        // Format the data for better AI understanding
        const formattedData = data.map(entry => ({
          date: entry.date,
          overall_wellbeing: entry.overall_wellbeing,
          sleep_quality: entry.sleep_quality,
          physical_activity: entry.physical_activity,
          time_with_family_friends: entry.time_with_family_friends,
          diet_quality: entry.diet_quality,
          stress_levels: entry.stress_levels
        }));

        // Create the prompt for Gemini
        const prompt = `${WELLBEING_ANALYSIS_PROMPT}

Please analyze the following personal wellness data and provide specific, actionable wellness tips based on the patterns you observe:

WELLNESS DATA:
${JSON.stringify(formattedData, null, 2)}

Based on this data, identify specific wellness patterns and provide personalized tips. Focus on:
- Sleep quality trends and recommendations
- Stress management based on stress level patterns
- Physical activity suggestions
- Social connection recommendations
- Diet quality improvements
- Overall wellbeing optimization

Respond with valid JSON only, following the exact format specified in the prompt.`;

        console.log('Sending request to Gemini 2.5 Pro...');
        
        // Send request to Gemini
        const result = await this.pro_model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('Raw Gemini response:', text);
        console.log('Received response from Gemini');
        
        // Parse and validate the response
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        console.log('Cleaned response:', cleanedText);

        const cleaned_result = JSON.parse(cleanedText) as WellbeingResult;
        
        console.log('Analysis completed successfully');
        console.log('Parsed result:', cleaned_result);
        
        // Return wellness tips or empty array if none provided
        return cleaned_result.wellnessTips || [];

      } catch (error) {
        console.error('Error in analyzeWellness:', error);
        
        // Return fallback recommendations if AI fails
        return [
          {
            trigger: "general_wellness",
            shortTip: "Track your daily wellness metrics",
            detailedTip: "Continue logging your daily wellness data to get more personalized recommendations. Focus on maintaining consistent sleep, managing stress, and staying active.",
            recommendations: [
              "Log your daily wellness metrics consistently",
              "Focus on maintaining consistent sleep patterns",
              "Practice stress management techniques",
              "Stay physically active with regular exercise"
            ]
          }
        ];
      }
    }


}

export function processSpendingData(transactions: Transaction[]): ProcessedData {
  if (transactions.length === 0) {
    throw new Error('No transaction data provided');
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedTransactions[0].date);
  const endDate = new Date(sortedTransactions[sortedTransactions.length - 1].date);
  const spanDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Calculate totals and averages
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageDaily = totalSpent / spanDays;

  // Group by category (filter out "Other" category)
  const categoryTotals: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    // Skip "Other" category as requested
    if (transaction.category.toLowerCase() === 'other') {
      return;
    }
    
    categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
    categoryCounts[transaction.category] = (categoryCounts[transaction.category] || 0) + 1;
  });

  const categoryAverages: Record<string, number> = {};
  Object.keys(categoryTotals).forEach(category => {
    categoryAverages[category] = categoryTotals[category] / categoryCounts[category];
  });

  // Group by week for trend analysis (filter out "Other" category)
  const weeklyData: Record<string, Record<string, number>> = {};
  transactions.forEach(transaction => {
    // Skip "Other" category as requested
    if (transaction.category.toLowerCase() === 'other') {
      return;
    }
    
    const date = new Date(transaction.date);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {};
    }
    weeklyData[weekKey][transaction.category] = 
      (weeklyData[weekKey][transaction.category] || 0) + transaction.amount;
  });

  // Calculate category changes (comparing first half vs second half of period)
  const categoryChanges: Record<string, string> = {};
  const midPoint = Math.floor(transactions.length / 2);
  const firstHalf = transactions.slice(0, midPoint);
  const secondHalf = transactions.slice(midPoint);

  const firstHalfTotals: Record<string, number> = {};
  const secondHalfTotals: Record<string, number> = {};

  firstHalf.forEach(t => {
    firstHalfTotals[t.category] = (firstHalfTotals[t.category] || 0) + t.amount;
  });

  secondHalf.forEach(t => {
    secondHalfTotals[t.category] = (secondHalfTotals[t.category] || 0) + t.amount;
  });

  Object.keys(categoryTotals).forEach(category => {
    const firstHalfTotal = firstHalfTotals[category] || 0;
    const secondHalfTotal = secondHalfTotals[category] || 0;
    
    if (firstHalfTotal > 0) {
      const change = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
      categoryChanges[category] = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    } else {
      categoryChanges[category] = secondHalfTotal > 0 ? '+100%' : '0%';
    }
  });

  // Detect anomalies (transactions that are 2+ standard deviations from category mean)
  const anomalies: Anomaly[] = [];
  Object.keys(categoryTotals).forEach(category => {
    const categoryTransactions = transactions.filter(t => t.category === category);
    const amounts = categoryTransactions.map(t => t.amount);
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    categoryTransactions.forEach(transaction => {
      if (Math.abs(transaction.amount - mean) > 2 * stdDev) {
        anomalies.push({
          id: `anomaly_${transaction.date}_${transaction.category}_${Date.now()}`,
          date: transaction.date,
          category: transaction.category,
          amount: transaction.amount,
          shortInsight: `Unusual ${transaction.category} spending: $${transaction.amount}`,
          detailedReason: `Unusually ${transaction.amount > mean ? 'high' : 'low'} ${transaction.category} spending on ${transaction.date}. This amount is ${Math.abs(transaction.amount - mean).toFixed(2)} ${transaction.amount > mean ? 'above' : 'below'} the average.`
        });
      }
    });
  });

  return {
    totalSpent,
    averageDaily,
    spanDays,
    categoryTotals,
    categoryAverages,
    categoryChanges,
    weeklyData,
    anomalies
  };
}

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
  return variance;
}

function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
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


export class AnalysisError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export class ValidationError extends AnalysisError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class GeminiAPIError extends AnalysisError {
  constructor(message: string, public statusCode?: number, originalError?: Error) {
    super(message, 'GEMINI_API_ERROR', originalError);
    this.name = 'GeminiAPIError';
  }
}

export function handleError(error: unknown): AnalysisError {
  if (error instanceof AnalysisError) {
    return error;
  }

  if (error instanceof Error) {
    return new AnalysisError(
      error.message,
      'UNKNOWN_ERROR',
      error
    );
  }

  return new AnalysisError(
    'An unknown error occurred',
    'UNKNOWN_ERROR'
  );
}

export function logError(error: AnalysisError, context?: string): void {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${context}]` : '';
  
  console.error(`[${timestamp}]${contextStr} ${error.name}: ${error.message}`);
  
  if (error.originalError) {
    console.error('Original error:', error.originalError);
  }
  
  if (error.code) {
    console.error('Error code:', error.code);
  }
}

function formatDataForGemini(processedData: ProcessedData, transactions: Transaction[]): string {
  const data = {
    summary: {
      totalSpent: processedData.totalSpent,
      averageDaily: processedData.averageDaily,
      spanDays: processedData.spanDays,
      categoryCount: Object.keys(processedData.categoryTotals).length
    },
    categories: Object.keys(processedData.categoryTotals).map(category => ({
      category,
      total: processedData.categoryTotals[category],
      average: processedData.categoryAverages[category],
      change: processedData.categoryChanges[category]
    })),
    weeklyBreakdown: processedData.weeklyData,
    anomalies: processedData.anomalies,
    rawTransactions: transactions.slice(0, 50) // Limit to first 50 for context
  };

  return JSON.stringify(data, null, 2);
}

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

function createFallbackAnalysis(data: Transaction[]): AnalysisResult {
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
      },
      {
        shortInsight: 'Set category goals',
        detailedAdvice: 'Set specific goals for each spending category to align with your financial objectives.',
        linkedInsights: ['Category-specific spending analysis available'],
        linkedAnomalies: [],
        category: 'financial' as const
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