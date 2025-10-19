/**
 * Specialized Gemini Prompts for Financial-Wellbeing Impact Analysis
 * Generates personalized, actionable insights based on correlation and regression data
 */

import { CorrelationResult } from './correlationAnalyzer';
import { WhatIfScenario } from './predictiveModeling';
import { PredictionResult } from './predictiveModeling';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export interface ImpactInsight {
  title: string;
  insight: string;
  actionableAdvice: string[];
  confidence: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  category: 'spending' | 'savings' | 'lifestyle' | 'wellbeing';
}

export interface FinancialWellbeingReport {
  summary: string;
  keyInsights: ImpactInsight[];
  recommendations: string[];
  whatIfScenarios: WhatIfScenario[];
  nextSteps: string[];
}

export class GeminiPrompts {
  /**
   * Generate the main impact analysis prompt for Gemini
   */
  static generateImpactAnalysisPrompt(
    correlations: CorrelationResult[],
    predictions: { [wellbeingMetric: string]: PredictionResult },
    weeklyDataCount: number
  ): string {
    const correlationSummary = this.formatCorrelationsForGemini(correlations);
    const predictionSummary = this.formatPredictionsForGemini(predictions);
    
    return `You are a financial wellness expert and behavioral psychologist. Analyze the following data to provide personalized, actionable insights about how spending habits affect emotional wellbeing.

CORRELATION DATA:
${correlationSummary}

PREDICTION DATA:
${predictionSummary}

DATA CONTEXT:
- Analysis based on ${weeklyDataCount} weeks of data
- Financial metrics are in dollars
- Wellbeing metrics are on a 1-10 scale
- Stress levels are inverted (lower stress = higher wellbeing)

TASK:
Generate a comprehensive Financial-Wellbeing Impact Report that includes:

1. A compelling 2-3 sentence summary that highlights the most important finding
2. 3-5 key insights with specific, actionable advice
3. Personalized recommendations based on the data patterns
4. Next steps for the user to improve their financial-wellbeing connection

REQUIREMENTS:
- Be specific and data-driven (mention actual correlation values and spending amounts)
- Provide concrete, actionable advice (not generic tips)
- Use an encouraging, supportive tone
- Focus on the most impactful changes the user can make
- Consider both positive and negative correlations
- Make recommendations realistic and achievable

FORMAT YOUR RESPONSE AS JSON:
{
  "summary": "Your compelling summary here",
  "keyInsights": [
    {
      "title": "Insight title",
      "insight": "Detailed insight description",
      "actionableAdvice": ["Specific action 1", "Specific action 2"],
      "confidence": "high|medium|low",
      "priority": "high|medium|low",
      "category": "spending|savings|lifestyle|wellbeing"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;
  }

  /**
   * Generate prompt for What-If scenario analysis
   */
  static generateWhatIfAnalysisPrompt(
    scenarios: WhatIfScenario[],
    currentFinancialData: { [key: string]: number }
  ): string {
    const currentDataSummary = this.formatCurrentFinancialData(currentFinancialData);
    const scenariosSummary = this.formatScenariosForGemini(scenarios);
    
    return `You are a financial wellness expert. Analyze these "What-If" scenarios to help the user understand how different spending decisions might affect their wellbeing.

CURRENT FINANCIAL SITUATION:
${currentDataSummary}

WHAT-IF SCENARIOS:
${scenariosSummary}

TASK:
For each scenario, provide:
1. A clear assessment of the potential wellbeing impact
2. Specific advice on whether to proceed with the scenario
3. Alternative approaches if the scenario has negative impacts
4. Tips to maximize positive impacts

REQUIREMENTS:
- Be specific about the predicted changes in wellbeing metrics
- Consider both short-term and long-term impacts
- Provide practical alternatives when scenarios are risky
- Use data from the predictions to support your advice
- Be encouraging but realistic about potential outcomes

FORMAT YOUR RESPONSE AS JSON:
{
  "scenarioAnalysis": [
    {
      "scenarioName": "Scenario name",
      "assessment": "Your assessment of this scenario",
      "recommendation": "Should they proceed? Why or why not?",
      "alternatives": ["Alternative 1", "Alternative 2"],
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "overallAdvice": "General advice about making financial decisions with wellbeing in mind"
}`;
  }

  /**
   * Generate prompt for weekly impact summary
   */
  static generateWeeklyImpactPrompt(
    weeklyData: any[],
    correlations: CorrelationResult[]
  ): string {
    const recentData = weeklyData.slice(-4); // Last 4 weeks
    const dataSummary = this.formatWeeklyDataForGemini(recentData);
    const correlationSummary = this.formatCorrelationsForGemini(correlations.slice(0, 3));
    
    return `You are a financial wellness coach. Provide a weekly impact summary based on recent spending and wellbeing data.

RECENT WEEKLY DATA (Last 4 weeks):
${dataSummary}

KEY CORRELATIONS:
${correlationSummary}

TASK:
Create a brief, encouraging weekly summary that:
1. Highlights positive trends in spending and wellbeing
2. Identifies areas for improvement
3. Provides 2-3 specific actions for the upcoming week
4. Celebrates any progress made

REQUIREMENTS:
- Keep it concise and encouraging
- Focus on actionable items for the next week
- Use specific data points to support your observations
- Maintain a positive, supportive tone
- Avoid overwhelming the user with too much information

FORMAT YOUR RESPONSE AS JSON:
{
  "weeklySummary": "Brief summary of the week's financial-wellbeing connection",
  "positiveTrends": ["Trend 1", "Trend 2"],
  "areasForImprovement": ["Area 1", "Area 2"],
  "thisWeeksActions": ["Action 1", "Action 2", "Action 3"],
  "celebration": "Something positive to celebrate from this week"
}`;
  }

  /**
   * Format correlations for Gemini prompt
   */
  private static formatCorrelationsForGemini(correlations: CorrelationResult[]): string {
    if (correlations.length === 0) {
      return "No significant correlations found.";
    }

    return correlations.map(corr => {
      const financialLabel = this.getFinancialMetricLabel(corr.metric);
      const wellbeingLabel = this.getWellbeingMetricLabel(corr.wellbeingMetric);
      const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
      
      return `• ${financialLabel} ${direction} ${wellbeingLabel} (correlation: ${corr.correlation}, strength: ${corr.strength})`;
    }).join('\n');
  }

  /**
   * Format predictions for Gemini prompt
   */
  private static formatPredictionsForGemini(predictions: { [wellbeingMetric: string]: PredictionResult }): string {
    return Object.entries(predictions).map(([metric, prediction]) => {
      const metricLabel = this.getWellbeingMetricLabel(metric);
      const confidence = prediction.confidence;
      
      return `• ${metricLabel}: Predicted value ${prediction.predictedValue} (confidence: ${confidence})`;
    }).join('\n');
  }

  /**
   * Format current financial data for Gemini prompt
   */
  private static formatCurrentFinancialData(data: { [key: string]: number }): string {
    return Object.entries(data).map(([metric, value]) => {
      const label = this.getFinancialMetricLabel(metric);
      return `• ${label}: $${value.toFixed(2)}`;
    }).join('\n');
  }

  /**
   * Format scenarios for Gemini prompt
   */
  private static formatScenariosForGemini(scenarios: WhatIfScenario[]): string {
    return scenarios.map(scenario => {
      const changes = Object.entries(scenario.changes).map(([metric, change]) => {
        const label = this.getFinancialMetricLabel(metric);
        const changeValue = change as number;
        return `${label}: ${changeValue > 0 ? '+' : ''}$${changeValue.toFixed(2)}`;
      }).join(', ');
      
      return `• ${scenario.scenario}: ${changes}`;
    }).join('\n');
  }

  /**
   * Format weekly data for Gemini prompt
   */
  private static formatWeeklyDataForGemini(weeklyData: any[]): string {
    return weeklyData.map((week, index) => {
      const weekNum = weeklyData.length - index;
      return `Week ${weekNum}:
  - Total Spending: $${week.financial.totalSpending.toFixed(2)}
  - Overall Wellbeing: ${week.wellbeing.overallWellbeing}/10
  - Stress Level: ${week.wellbeing.stressLevel}/10
  - Sleep Quality: ${week.wellbeing.sleepQuality}/10`;
    }).join('\n\n');
  }

  /**
   * Get human-readable financial metric labels
   */
  private static getFinancialMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      totalSpending: 'Total Spending',
      entertainmentSpending: 'Entertainment',
      foodSpending: 'Food & Dining',
      shoppingSpending: 'Shopping',
      transportSpending: 'Transportation',
      selfCareSpending: 'Self-Care',
      savingsRate: 'Savings Rate',
      anomalySpending: 'Unusual Spending'
    };
    return labels[metric] || metric;
  }

  /**
   * Get human-readable wellbeing metric labels
   */
  private static getWellbeingMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      overallWellbeing: 'Overall Wellbeing',
      stressLevel: 'Stress Levels',
      sleepQuality: 'Sleep Quality',
      energyLevel: 'Energy Levels',
      mood: 'Mood'
    };
    return labels[metric] || metric;
  }

  /**
   * Generate a quick insight prompt for real-time analysis
   */
  static generateQuickInsightPrompt(
    currentSpending: { [key: string]: number },
    currentWellbeing: { [key: string]: number },
    topCorrelations: CorrelationResult[]
  ): string {
    const spendingSummary = this.formatCurrentFinancialData(currentSpending);
    const wellbeingSummary = Object.entries(currentWellbeing).map(([metric, value]) => {
      const label = this.getWellbeingMetricLabel(metric);
      return `• ${label}: ${value}/10`;
    }).join('\n');
    
    const correlationSummary = this.formatCorrelationsForGemini(topCorrelations.slice(0, 2));
    
    return `You are a financial wellness expert. Provide a quick, actionable insight based on current spending and wellbeing data.

CURRENT SPENDING:
${spendingSummary}

CURRENT WELLBEING:
${wellbeingSummary}

KEY CORRELATIONS:
${correlationSummary}

TASK:
Provide a single, specific, actionable insight that the user can implement today to improve their financial-wellbeing connection.

REQUIREMENTS:
- Be specific and actionable
- Reference actual data points
- Keep it under 100 words
- Focus on the most impactful change they can make right now

FORMAT YOUR RESPONSE AS JSON:
{
  "insight": "Your specific, actionable insight here",
  "action": "The specific action they should take",
  "expectedImpact": "What positive change this should bring",
  "timeframe": "When they should see results"
}`;
  }
}
