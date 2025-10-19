/**
 * Predictive Modeling Service for Financial-Wellbeing Impact Analysis
 * Implements linear regression and predictive modeling to forecast wellbeing impact
 */

import { WeeklyDataPoint, CorrelationResult } from './correlationAnalyzer';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export interface RegressionCoefficients {
  [key: string]: number;
}

export interface RegressionModel {
  target: string; // wellbeing metric being predicted
  coefficients: RegressionCoefficients;
  intercept: number;
  rSquared: number;
  pValue: number; // approximation
}

export interface PredictionResult {
  predictedValue: number;
  confidence: 'low' | 'medium' | 'high';
  factors: Array<{
    metric: string;
    impact: number;
    contribution: number; // percentage contribution to prediction
  }>;
}

export interface WhatIfScenario {
  scenario: string;
  changes: { [financialMetric: string]: number };
  predictedImpact: {
    [wellbeingMetric: string]: PredictionResult;
  };
  recommendation: string;
}

export class PredictiveModeling {
  /**
   * Train a linear regression model for predicting wellbeing from financial metrics
   */
  static trainModel(
    weeklyData: WeeklyDataPoint[],
    targetWellbeingMetric: string,
    significantCorrelations: CorrelationResult[]
  ): RegressionModel | null {
    if (weeklyData.length < 3) {
      console.warn(`Insufficient data for regression modeling (need at least 3 data points, got ${weeklyData.length})`);
      return null;
    }

    // Get significant financial metrics for this wellbeing metric
    const relevantMetrics = significantCorrelations
      .filter(corr => corr.wellbeingMetric === targetWellbeingMetric)
      .map(corr => corr.metric);

    if (relevantMetrics.length === 0) {
      console.warn(`No significant correlations found for ${targetWellbeingMetric}`);
      return null;
    }

    // Limit to 2 metrics to avoid matrix issues
    const limitedMetrics = relevantMetrics.slice(0, 2);

    // Prepare data matrices
    const X: number[][] = []; // Independent variables (financial metrics)
    const y: number[] = []; // Dependent variable (wellbeing metric)

    weeklyData.forEach(point => {
      const financialValues = limitedMetrics.map(metric => {
        let value = point.financial[metric as keyof typeof point.financial] as number;
        
        // Normalize values to prevent scale issues
        if (metric === 'savingsRate') {
          value = value / 100; // Convert percentage to decimal
        } else {
          value = value / 1000; // Scale down large spending amounts
        }
        
        return value;
      });

      let wellbeingValue = point.wellbeing[targetWellbeingMetric as keyof typeof point.wellbeing] as number;
      
      // Invert stress level for positive correlation
      if (targetWellbeingMetric === 'stressLevel') {
        wellbeingValue = 11 - wellbeingValue;
      }

      X.push(financialValues);
      y.push(wellbeingValue);
    });

    // Perform linear regression using least squares
    try {
      const model = this.performLinearRegression(X, y, limitedMetrics);
      
      if (model) {
        model.target = targetWellbeingMetric;
      }

      return model;
    } catch (error) {
      console.warn(`Failed to train model for ${targetWellbeingMetric}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Perform linear regression using least squares method
   */
  private static performLinearRegression(
    X: number[][],
    y: number[],
    featureNames: string[]
  ): RegressionModel | null {
    const n = X.length;
    const p = X[0].length;

    if (n < p + 1) {
      console.warn('Not enough data points for regression');
      return null;
    }

    // Add intercept term (column of ones)
    const XWithIntercept = X.map(row => [1, ...row]);
    
    // Calculate (X'X)^-1 X'y using normal equation
    try {
      const XtX = this.matrixMultiply(this.transpose(XWithIntercept), XWithIntercept);
      const XtXInv = this.matrixInverse(XtX);
      const Xty = this.matrixVectorMultiply(this.transpose(XWithIntercept), y);
      const coefficients = this.matrixVectorMultiply(XtXInv, Xty);

      // Extract intercept and feature coefficients
      const intercept = coefficients[0];
      const featureCoefficients: RegressionCoefficients = {};
      
      featureNames.forEach((name, index) => {
        featureCoefficients[name] = coefficients[index + 1];
      });

      // Calculate R-squared
      const predictions = X.map(row => {
        let pred = intercept;
        featureNames.forEach((name, index) => {
          pred += featureCoefficients[name] * row[index];
        });
        return pred;
      });

      const rSquared = this.calculateRSquared(y, predictions);
      
      // Simple p-value approximation (not statistically rigorous)
      const pValue = Math.max(0, 1 - rSquared);

      return {
        target: '',
        coefficients: featureCoefficients,
        intercept,
        rSquared: Math.round(rSquared * 1000) / 1000,
        pValue: Math.round(pValue * 1000) / 1000
      };
    } catch (error) {
      console.error('Error in linear regression calculation:', error);
      return null;
    }
  }

  /**
   * Make a prediction using the trained model
   */
  static makePrediction(
    model: RegressionModel,
    financialData: { [key: string]: number }
  ): PredictionResult {
    let prediction = model.intercept;
    const factors: Array<{ metric: string; impact: number; contribution: number }> = [];
    
    let totalImpact = 0;
    
    Object.entries(model.coefficients).forEach(([metric, coefficient]) => {
      let value = financialData[metric] || 0;
      
      // Apply same normalization as in training
      if (metric === 'savingsRate') {
        value = value / 100;
      } else {
        value = value / 1000;
      }
      
      const impact = coefficient * value;
      prediction += impact;
      totalImpact += Math.abs(impact);
      
      factors.push({
        metric,
        impact: Math.round(impact * 1000) / 1000,
        contribution: 0 // Will calculate after loop
      });
    });

    // Calculate contribution percentages
    factors.forEach(factor => {
      factor.contribution = totalImpact > 0 ? 
        Math.round((Math.abs(factor.impact) / totalImpact) * 100) : 0;
    });

    // Determine confidence based on R-squared
    const confidence = model.rSquared > 0.7 ? 'high' : 
                     model.rSquared > 0.4 ? 'medium' : 'low';

    return {
      predictedValue: Math.round(prediction * 1000) / 1000,
      confidence,
      factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    };
  }

  /**
   * Generate "What-If" scenarios for financial decisions
   */
  static generateWhatIfScenarios(
    models: { [wellbeingMetric: string]: RegressionModel },
    currentFinancialData: { [key: string]: number },
    scenarios: Array<{ name: string; changes: { [key: string]: number } }>
  ): WhatIfScenario[] {
    return scenarios.map(scenario => {
      const newFinancialData = { ...currentFinancialData };
      
      // Apply changes
      Object.entries(scenario.changes).forEach(([metric, change]) => {
        newFinancialData[metric] = (newFinancialData[metric] || 0) + change;
      });

      // Make predictions for each wellbeing metric
      const predictedImpact: { [wellbeingMetric: string]: PredictionResult } = {};
      
      Object.entries(models).forEach(([wellbeingMetric, model]) => {
        const prediction = this.makePrediction(model, newFinancialData);
        predictedImpact[wellbeingMetric] = prediction;
      });

      // Generate recommendation based on predictions
      const recommendation = this.generateScenarioRecommendation(
        scenario.name,
        scenario.changes,
        predictedImpact
      );

      return {
        scenario: scenario.name,
        changes: scenario.changes,
        predictedImpact,
        recommendation
      };
    });
  }

  /**
   * Generate recommendation for a scenario
   */
  private static generateScenarioRecommendation(
    scenarioName: string,
    changes: { [key: string]: number },
    predictions: { [wellbeingMetric: string]: PredictionResult }
  ): string {
    const positiveImpacts: string[] = [];
    const negativeImpacts: string[] = [];

    Object.entries(predictions).forEach(([metric, prediction]) => {
      const metricLabel = this.getWellbeingMetricLabel(metric);
      const change = prediction.predictedValue;
      
      if (change > 0.5) {
        positiveImpacts.push(`${metricLabel} (+${change.toFixed(1)})`);
      } else if (change < -0.5) {
        negativeImpacts.push(`${metricLabel} (${change.toFixed(1)})`);
      }
    });

    let recommendation = `Scenario: ${scenarioName}\n`;
    
    if (positiveImpacts.length > 0) {
      recommendation += `✅ Positive impacts: ${positiveImpacts.join(', ')}\n`;
    }
    
    if (negativeImpacts.length > 0) {
      recommendation += `⚠️ Negative impacts: ${negativeImpacts.join(', ')}\n`;
    }

    if (positiveImpacts.length > negativeImpacts.length) {
      recommendation += "💡 This scenario is likely to improve your overall wellbeing!";
    } else if (negativeImpacts.length > positiveImpacts.length) {
      recommendation += "⚠️ This scenario may negatively impact your wellbeing. Consider alternatives.";
    } else {
      recommendation += "⚖️ This scenario has mixed impacts. Monitor your wellbeing closely.";
    }

    return recommendation;
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
   * Calculate R-squared value
   */
  private static calculateRSquared(actual: number[], predicted: number[]): number {
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    
    const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    
    return ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
  }

  /**
   * Matrix multiplication helper
   */
  private static matrixMultiply(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        result[i][j] = 0;
        for (let k = 0; k < B.length; k++) {
          result[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return result;
  }

  /**
   * Matrix transpose helper
   */
  private static transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  /**
   * Matrix-vector multiplication helper
   */
  private static matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  /**
   * Matrix inverse helper using Gaussian elimination
   */
  private static matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length;
    
    // Check if matrix is square
    if (n === 0 || matrix[0].length !== n) {
      throw new Error('Matrix must be square for inversion');
    }
    
    // Create augmented matrix [A|I]
    const augmented: number[][] = [];
    for (let i = 0; i < n; i++) {
      augmented[i] = [...matrix[i]];
      for (let j = 0; j < n; j++) {
        augmented[i].push(i === j ? 1 : 0);
      }
    }
    
    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Check for singular matrix
      if (Math.abs(augmented[i][i]) < 1e-10) {
        throw new Error('Matrix is singular');
      }
      
      // Make diagonal element 1
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      
      // Eliminate column
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    // Extract inverse matrix
    const inverse: number[][] = [];
    for (let i = 0; i < n; i++) {
      inverse[i] = augmented[i].slice(n);
    }
    
    return inverse;
  }
}
