/**
 * Financial-Wellbeing Impact Analyzer
 * Main service that orchestrates correlation analysis, predictive modeling, and Gemini insights
 */

import { Transaction } from '../gemini/index';
import { CorrelationAnalyzer, WeeklyDataPoint, WellbeingData, FinancialMetrics, CorrelationResult } from './correlationAnalyzer';
import { PredictiveModeling, RegressionModel, WhatIfScenario, PredictionResult } from './predictiveModeling';
import { GeminiPrompts, ImpactInsight, FinancialWellbeingReport } from './geminiPrompts';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export interface ImpactAnalysisResult {
  report: FinancialWellbeingReport;
  correlations: CorrelationResult[];
  models: { [wellbeingMetric: string]: RegressionModel };
  weeklyData: WeeklyDataPoint[];
  metadata: {
    analysisDate: string;
    dataPoints: number;
    timeRange: {
      start: string;
      end: string;
    };
  };
}

export interface QuickInsightResult {
  insight: string;
  action: string;
  expectedImpact: string;
  timeframe: string;
  confidence: 'low' | 'medium' | 'high';
}

export class ImpactAnalyzer {
  private geminiApiKey: string;
  private geminiApiUrl: string;

  constructor(geminiApiKey: string, geminiApiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent') {
    this.geminiApiKey = geminiApiKey;
    this.geminiApiUrl = geminiApiUrl;
  }

  /**
   * Perform comprehensive financial-wellbeing impact analysis
   */
  async analyzeFinancialWellbeingImpact(
    transactions: Transaction[],
    wellbeingData: WellbeingData[]
  ): Promise<ImpactAnalysisResult> {
    try {
      console.log('🧠 Starting Financial-Wellbeing Impact Analysis...');
      
      // Step 1: Aggregate weekly data
      console.log('📊 Aggregating weekly data...');
      const weeklyData = CorrelationAnalyzer.aggregateWeeklyData(transactions, wellbeingData);
      
      if (weeklyData.length < 3) {
        throw new Error('Insufficient data for analysis. Need at least 3 weeks of data.');
      }

      // Step 2: Perform correlation analysis
      console.log('🔍 Analyzing correlations...');
      const correlations = CorrelationAnalyzer.analyzeCorrelations(weeklyData);
      const strongCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 5);

      // Step 3: Train predictive models
      console.log('🤖 Training predictive models...');
      const models: { [wellbeingMetric: string]: RegressionModel } = {};
      const wellbeingMetrics = ['overallWellbeing', 'stressLevel', 'sleepQuality', 'energyLevel', 'mood'];
      
      for (const metric of wellbeingMetrics) {
        const model = PredictiveModeling.trainModel(weeklyData, metric, strongCorrelations);
        if (model) {
          models[metric] = model;
        }
      }

      // Step 4: Generate predictions for current state
      console.log('🔮 Generating predictions...');
      const currentFinancialData = this.getCurrentFinancialData(weeklyData);
      const predictions: { [wellbeingMetric: string]: any } = {};
      
      Object.entries(models).forEach(([metric, model]) => {
        predictions[metric] = PredictiveModeling.makePrediction(model, currentFinancialData);
      });

      // Step 5: Generate What-If scenarios
      console.log('💭 Creating What-If scenarios...');
      const scenarios = this.generateDefaultScenarios(currentFinancialData);
      const whatIfResults = PredictiveModeling.generateWhatIfScenarios(models, currentFinancialData, scenarios);

      // Step 6: Generate Gemini insights or fallback
      console.log('✨ Generating AI insights...');
      let report;
      try {
        report = await this.generateFinancialWellbeingReport(
          correlations,
          predictions,
          whatIfResults,
          weeklyData.length
        );
      } catch (error) {
        console.warn('⚠️ Gemini API unavailable, using fallback report generation');
        report = this.generateFallbackReport(correlations, Object.values(predictions), whatIfResults, weeklyData.length);
      }

      // Step 7: Compile results
      const result: ImpactAnalysisResult = {
        report,
        correlations: strongCorrelations,
        models,
        weeklyData,
        metadata: {
          analysisDate: new Date().toISOString(),
          dataPoints: weeklyData.length,
          timeRange: {
            start: weeklyData[0].week,
            end: weeklyData[weeklyData.length - 1].week
          }
        }
      };

      console.log('✅ Financial-Wellbeing Impact Analysis completed!');
      return result;

    } catch (error) {
      console.error('❌ Impact analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate a quick insight for real-time analysis
   */
  async generateQuickInsight(
    transactions: Transaction[],
    wellbeingData: WellbeingData[]
  ): Promise<QuickInsightResult> {
    try {
      console.log('⚡ Generating quick insight...');
      
      // Get recent data (last 2 weeks)
      const recentTransactions = transactions.slice(-20); // Last 20 transactions
      const recentWellbeing = wellbeingData.slice(-2); // Last 2 weeks
      
      // Check if we have enough data
      if (recentTransactions.length < 3 || recentWellbeing.length < 2) {
        return {
          insight: "Need more data for analysis. Please add more transactions and wellbeing records.",
          action: "Continue logging your spending and mood for better insights.",
          expectedImpact: "More data will enable personalized recommendations.",
          timeframe: "1-2 weeks",
          confidence: 'low'
        };
      }
      
      // Perform quick correlation analysis
      const weeklyData = CorrelationAnalyzer.aggregateWeeklyData(recentTransactions, recentWellbeing);
      
      if (weeklyData.length < 2) {
        return {
          insight: "Insufficient weekly data for correlation analysis.",
          action: "Continue logging data for at least 2-3 weeks.",
          expectedImpact: "Weekly patterns will emerge with more data.",
          timeframe: "2-3 weeks",
          confidence: 'low'
        };
      }
      
      const correlations = CorrelationAnalyzer.analyzeCorrelations(weeklyData);
      const topCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 2);
      
      // Get current financial and wellbeing state
      const currentFinancial = this.getCurrentFinancialData(weeklyData);
      const currentWellbeing = this.getCurrentWellbeingData(recentWellbeing);
      
      // Generate Gemini prompt
      const prompt = GeminiPrompts.generateQuickInsightPrompt(
        currentFinancial,
        currentWellbeing,
        topCorrelations
      );
      
      // Call Gemini API or use fallback
      let insight;
      try {
        const response = await this.callGeminiAPI(prompt);
        insight = JSON.parse(response);
      } catch (error) {
        console.warn('⚠️ Gemini API unavailable, using fallback insight generation');
        insight = this.generateFallbackQuickInsight(currentFinancial, currentWellbeing, topCorrelations);
      }
      
      // Determine confidence based on correlation strength
      const avgCorrelationStrength = topCorrelations.length > 0 ? 
        topCorrelations.reduce((sum, corr) => sum + Math.abs(corr.correlation), 0) / topCorrelations.length : 0;
      
      const confidence = avgCorrelationStrength > 0.6 ? 'high' : 
                        avgCorrelationStrength > 0.3 ? 'medium' : 'low';
      
      return {
        ...insight,
        confidence
      };
      
    } catch (error) {
      console.error('❌ Quick insight generation failed:', error);
      
      // Return fallback insight
      return {
        insight: "Unable to generate insight due to insufficient data or API issues.",
        action: "Continue logging your spending and wellbeing data.",
        expectedImpact: "More data will enable better analysis.",
        timeframe: "1-2 weeks",
        confidence: 'low'
      };
    }
  }

  /**
   * Generate comprehensive financial wellbeing report using Gemini
   */
  private async generateFinancialWellbeingReport(
    correlations: CorrelationResult[],
    predictions: { [wellbeingMetric: string]: any },
    whatIfScenarios: WhatIfScenario[],
    dataPoints: number
  ): Promise<FinancialWellbeingReport> {
    try {
      const prompt = GeminiPrompts.generateImpactAnalysisPrompt(
        correlations,
        predictions,
        dataPoints
      );
      
      const response = await this.callGeminiAPI(prompt);
      const report = JSON.parse(response);
      
      // Add What-If scenarios to the report
      report.whatIfScenarios = whatIfScenarios;
      
      return report;
      
    } catch (error) {
      console.error('❌ Failed to generate Gemini report:', error);
      
      // Fallback to basic report
      return this.generateFallbackReport(correlations, Object.values(predictions), [], 0);
    }
  }

  /**
   * Get current financial data from recent weeks
   */
  private getCurrentFinancialData(weeklyData: WeeklyDataPoint[]): { [key: string]: number } {
    if (weeklyData.length === 0) {
      return {};
    }
    
    const latestWeek = weeklyData[weeklyData.length - 1];
    return {
      totalSpending: latestWeek.financial.totalSpending,
      entertainmentSpending: latestWeek.financial.entertainmentSpending,
      foodSpending: latestWeek.financial.foodSpending,
      shoppingSpending: latestWeek.financial.shoppingSpending,
      transportSpending: latestWeek.financial.transportSpending,
      selfCareSpending: latestWeek.financial.selfCareSpending,
      savingsRate: latestWeek.financial.savingsRate,
      anomalySpending: latestWeek.financial.anomalySpending
    };
  }

  /**
   * Get current wellbeing data
   */
  private getCurrentWellbeingData(wellbeingData: WellbeingData[]): { [key: string]: number } {
    if (wellbeingData.length === 0) {
      return {};
    }
    
    const latest = wellbeingData[wellbeingData.length - 1];
    return {
      overallWellbeing: latest.overallWellbeing,
      stressLevel: latest.stressLevel,
      sleepQuality: latest.sleepQuality,
      energyLevel: latest.energyLevel,
      mood: latest.mood
    };
  }

  /**
   * Generate default What-If scenarios
   */
  private generateDefaultScenarios(currentFinancial: { [key: string]: number }): Array<{ name: string; changes: { [key: string]: number } }> {
    return [
      {
        name: "Reduce Entertainment Spending",
        changes: { entertainmentSpending: -100 }
      },
      {
        name: "Increase Self-Care Budget",
        changes: { selfCareSpending: 50 }
      },
      {
        name: "Cut Back on Dining Out",
        changes: { foodSpending: -75 }
      },
      {
        name: "Boost Savings Rate",
        changes: { savingsRate: 5 }
      }
    ];
  }

  /**
   * Generate fallback report when Gemini API is unavailable
   */
  private generateFallbackReport(
    correlations: CorrelationResult[],
    predictions: PredictionResult[],
    whatIfResults: WhatIfScenario[],
    dataPoints: number
  ): FinancialWellbeingReport {
    const strongCorrelations = correlations.filter(c => c.strength === 'strong');
    const topCorrelation = strongCorrelations[0];
    
    // Generate insights based on correlations
    const keyInsights: ImpactInsight[] = strongCorrelations.slice(0, 3).map((corr, index) => {
      const financialLabel = this.getFinancialMetricLabel(corr.metric);
      const wellbeingLabel = this.getWellbeingMetricLabel(corr.wellbeingMetric);
      const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
      
      return {
        title: `${financialLabel} Affects ${wellbeingLabel}`,
        insight: `${financialLabel} has a ${corr.strength} ${corr.direction} correlation with ${wellbeingLabel} (${corr.correlation.toFixed(3)}). This means changes in your spending directly impact your wellbeing.`,
        actionableAdvice: [
          `Monitor your ${financialLabel} weekly`,
          `Track how it affects your ${wellbeingLabel}`,
          `Consider adjusting your spending if needed`
        ],
        confidence: corr.strength === 'strong' ? 'high' : 'medium',
        priority: corr.strength === 'strong' ? 'high' : 'medium',
        category: 'spending'
      };
    });

    // Generate recommendations
    const recommendations = [
      'Track your spending patterns weekly',
      'Monitor your wellbeing metrics daily',
      'Look for patterns between spending and mood',
      'Set spending limits for categories that negatively impact your wellbeing',
      'Increase spending in categories that positively impact your wellbeing'
    ];

    // Generate next steps
    const nextSteps = [
      'Set up weekly reviews of your financial-wellbeing connection',
      'Focus on the strongest correlations in your data',
      'Experiment with different spending patterns to see their impact',
      'Continue collecting data for better insights over time'
    ];

    // Generate summary
    let summary = `Your financial-wellbeing analysis found ${strongCorrelations.length} strong correlations. `;
    if (topCorrelation) {
      const financialLabel = this.getFinancialMetricLabel(topCorrelation.metric);
      const wellbeingLabel = this.getWellbeingMetricLabel(topCorrelation.wellbeingMetric);
      const direction = topCorrelation.direction === 'positive' ? 'increases' : 'decreases';
      summary += `${financialLabel} ${direction} your ${wellbeingLabel}, which could help you make more informed financial decisions.`;
    } else {
      summary += 'Continue tracking your data to identify patterns between your spending and wellbeing.';
    }

    return {
      summary,
      keyInsights,
      recommendations,
      whatIfScenarios: whatIfResults.slice(0, 3),
      nextSteps
    };
  }

  /**
   * Generate fallback quick insight when Gemini API is unavailable
   */
  private generateFallbackQuickInsight(
    currentFinancial: any,
    currentWellbeing: any,
    topCorrelations: CorrelationResult[]
  ): QuickInsightResult {
    if (topCorrelations.length === 0) {
      return {
        insight: "Your spending and wellbeing data shows some interesting patterns, but no strong correlations were found yet.",
        action: "Continue logging your spending and mood to identify patterns over time.",
        expectedImpact: "More data will enable personalized recommendations.",
        timeframe: "1-2 weeks",
        confidence: 'low'
      };
    }

    const topCorrelation = topCorrelations[0];
    const financialLabel = this.getFinancialMetricLabel(topCorrelation.metric);
    const wellbeingLabel = this.getWellbeingMetricLabel(topCorrelation.wellbeingMetric);
    const direction = topCorrelation.direction === 'positive' ? 'increases' : 'decreases';
    
    const insight = `Your ${financialLabel} has a ${topCorrelation.strength} ${topCorrelation.direction} correlation with ${wellbeingLabel} (${topCorrelation.correlation.toFixed(3)}). This means changes in your spending directly impact your wellbeing.`;
    
    const action = `Monitor your ${financialLabel} and track how it affects your ${wellbeingLabel}. Consider adjusting your spending if needed.`;
    
    const expectedImpact = `Understanding this connection can help you make more informed financial decisions that support your wellbeing.`;
    
    return {
      insight,
      action,
      expectedImpact,
      timeframe: "1-2 weeks",
      confidence: 'medium'
    };
  }

  /**
   * Helper methods for fallback report generation
   */
  private getFinancialMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      totalSpending: 'Total Spending',
      entertainmentSpending: 'Entertainment Spending',
      foodSpending: 'Food & Dining Spending',
      shoppingSpending: 'Shopping Spending',
      transportSpending: 'Transportation Spending',
      selfCareSpending: 'Self-Care Spending',
      savingsRate: 'Savings Rate',
      anomalySpending: 'Unusual Spending'
    };
    return labels[metric] || metric;
  }

  private getWellbeingMetricLabel(metric: string): string {
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
   * Call Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    try {
      // Check if we have a valid API key
      if (!this.geminiApiKey || this.geminiApiKey === 'demo-key' || this.geminiApiKey === 'test-key') {
        throw new Error('Invalid or missing Gemini API key. Please set GEMINI_API_KEY environment variable.');
      }

      const response = await fetch(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Details:', errorText);
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json() as any;
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Gemini API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Unexpected response structure from Gemini API');
      }
      
      return data.candidates[0].content.parts[0].text;
      
    } catch (error) {
      console.error('❌ Gemini API call failed:', error);
      throw error;
    }
  }
}
