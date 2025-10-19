/**
 * Financial-Wellbeing Correlation Analysis Service
 * Performs statistical analysis to find correlations between financial data and wellbeing metrics
 */

import { Transaction } from '../gemini/index';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export interface WellbeingData {
  date: string;
  overallWellbeing: number; // 1-10 scale
  stressLevel: number; // 1-10 scale (inverted for positive correlation)
  sleepQuality: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  mood: number; // 1-10 scale
}

export interface FinancialMetrics {
  date: string;
  totalSpending: number;
  entertainmentSpending: number;
  foodSpending: number;
  shoppingSpending: number;
  transportSpending: number;
  selfCareSpending: number;
  savingsRate: number; // percentage of income saved
  anomalySpending: number; // unusual spending events
}

export interface CorrelationResult {
  metric: string;
  wellbeingMetric: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
  significance: number; // p-value approximation
}

export interface WeeklyDataPoint {
  week: string; // YYYY-WW format
  financial: FinancialMetrics;
  wellbeing: WellbeingData;
}

export class CorrelationAnalyzer {
  /**
   * Aggregate financial and wellbeing data by week
   */
  static aggregateWeeklyData(
    transactions: Transaction[],
    wellbeingData: WellbeingData[]
  ): WeeklyDataPoint[] {
    const weeklyData: Map<string, { financial: Partial<FinancialMetrics>, wellbeing: Partial<WellbeingData> }> = new Map();

    // Process transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const weekKey = this.getWeekKey(date);
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          financial: {
            date: weekKey,
            totalSpending: 0,
            entertainmentSpending: 0,
            foodSpending: 0,
            shoppingSpending: 0,
            transportSpending: 0,
            selfCareSpending: 0,
            savingsRate: 0,
            anomalySpending: 0
          },
          wellbeing: {
            date: weekKey,
            overallWellbeing: 0,
            stressLevel: 0,
            sleepQuality: 0,
            energyLevel: 0,
            mood: 0
          }
        });
      }

      const weekData = weeklyData.get(weekKey)!;
      const amount = transaction.amount;
      
      // Categorize spending
      weekData.financial.totalSpending! += amount;
      
      switch (transaction.category) {
        case 'Entertainment':
          weekData.financial.entertainmentSpending! += amount;
          break;
        case 'Food':
          weekData.financial.foodSpending! += amount;
          break;
        case 'Shopping':
          weekData.financial.shoppingSpending! += amount;
          break;
        case 'Transport':
          weekData.financial.transportSpending! += amount;
          break;
        case 'Self-Care':
          weekData.financial.selfCareSpending! += amount;
          break;
        default:
          // Handle any other categories
          break;
      }
    });

    // Process wellbeing data
    wellbeingData.forEach(wellbeing => {
      const date = new Date(wellbeing.date);
      const weekKey = this.getWeekKey(date);
      
      if (weeklyData.has(weekKey)) {
        const weekData = weeklyData.get(weekKey)!;
        weekData.wellbeing = {
          ...weekData.wellbeing,
          ...wellbeing
        };
      }
    });

    // Convert to array and calculate derived metrics
    return Array.from(weeklyData.entries()).map(([week, data]) => {
      const financial = data.financial as FinancialMetrics;
      const wellbeing = data.wellbeing as WellbeingData;
      
      // Calculate savings rate (simplified - assuming income is totalSpending * 1.2)
      const estimatedIncome = financial.totalSpending * 1.2;
      financial.savingsRate = estimatedIncome > 0 ? ((estimatedIncome - financial.totalSpending) / estimatedIncome) * 100 : 0;
      
      // Calculate anomaly spending (spending > 2 standard deviations from mean)
      // For now, we'll use a simple heuristic: spending > 150% of average
      const avgSpending = financial.totalSpending; // This would be calculated from historical data
      financial.anomalySpending = financial.totalSpending > avgSpending * 1.5 ? financial.totalSpending - avgSpending : 0;

      return {
        week,
        financial,
        wellbeing
      };
    }).filter(point => 
      point.wellbeing.overallWellbeing > 0 && 
      point.financial.totalSpending > 0
    );
  }

  /**
   * Calculate Spearman's rank correlation coefficient
   */
  static calculateSpearmanCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) {
      return 0;
    }

    // Rank the data
    const rankedX = this.rankData(x);
    const rankedY = this.rankData(y);

    // Calculate Pearson correlation on ranks
    return this.calculatePearsonCorrelation(rankedX, rankedY);
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  static calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) {
      return 0;
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Rank data for Spearman correlation
   */
  private static rankData(data: number[]): number[] {
    const sorted = data.map((value, index) => ({ value, index }))
      .sort((a, b) => a.value - b.value);
    
    const ranks = new Array(data.length);
    let currentRank = 1;
    
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i].value !== sorted[i - 1].value) {
        currentRank = i + 1;
      }
      ranks[sorted[i].index] = currentRank;
    }
    
    return ranks;
  }

  /**
   * Get week key in YYYY-WW format
   */
  private static getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }

  /**
   * Get week number of the year
   */
  private static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Analyze correlations between financial metrics and wellbeing metrics
   */
  static analyzeCorrelations(weeklyData: WeeklyDataPoint[]): CorrelationResult[] {
    if (weeklyData.length < 3) {
      console.warn('Insufficient data for correlation analysis (need at least 3 data points)');
      return [];
    }

    const correlations: CorrelationResult[] = [];
    
    // Financial metrics to analyze
    const financialMetrics = [
      'totalSpending',
      'entertainmentSpending',
      'foodSpending',
      'shoppingSpending',
      'transportSpending',
      'selfCareSpending',
      'savingsRate',
      'anomalySpending'
    ];

    // Wellbeing metrics to analyze
    const wellbeingMetrics = [
      'overallWellbeing',
      'stressLevel', // Will be inverted for positive correlation
      'sleepQuality',
      'energyLevel',
      'mood'
    ];

    // Calculate correlations
    financialMetrics.forEach(financialMetric => {
      wellbeingMetrics.forEach(wellbeingMetric => {
        const financialValues = weeklyData.map(d => d.financial[financialMetric as keyof FinancialMetrics] as number);
        let wellbeingValues = weeklyData.map(d => d.wellbeing[wellbeingMetric as keyof WellbeingData] as number);
        
        // Invert stress level for positive correlation (lower stress = higher wellbeing)
        if (wellbeingMetric === 'stressLevel') {
          wellbeingValues = wellbeingValues.map(v => 11 - v); // Invert 1-10 scale
        }

        const correlation = this.calculateSpearmanCorrelation(financialValues, wellbeingValues);
        
        if (!isNaN(correlation) && Math.abs(correlation) > 0.1) { // Only include meaningful correlations
          const strength = Math.abs(correlation) > 0.7 ? 'strong' : 
                          Math.abs(correlation) > 0.4 ? 'moderate' : 'weak';
          
          const direction = correlation > 0 ? 'positive' : 'negative';
          
          // Simple significance approximation (not statistically rigorous)
          const significance = Math.max(0, 1 - Math.abs(correlation));

          correlations.push({
            metric: financialMetric,
            wellbeingMetric: wellbeingMetric,
            correlation: Math.round(correlation * 1000) / 1000, // Round to 3 decimal places
            strength,
            direction,
            significance: Math.round(significance * 1000) / 1000
          });
        }
      });
    });

    // Sort by absolute correlation strength
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  /**
   * Get the strongest correlations for insights
   */
  static getStrongestCorrelations(correlations: CorrelationResult[], limit: number = 5): CorrelationResult[] {
    return correlations
      .filter(c => c.strength === 'strong' || c.strength === 'moderate')
      .slice(0, limit);
  }

  /**
   * Generate correlation summary for Gemini analysis
   */
  static generateCorrelationSummary(correlations: CorrelationResult[]): string {
    const strongCorrelations = this.getStrongestCorrelations(correlations, 3);
    
    if (strongCorrelations.length === 0) {
      return "No significant correlations found between financial and wellbeing metrics.";
    }

    let summary = "Key Financial-Wellbeing Correlations Found:\n\n";
    
    strongCorrelations.forEach((corr, index) => {
      const financialLabel = this.getFinancialMetricLabel(corr.metric);
      const wellbeingLabel = this.getWellbeingMetricLabel(corr.wellbeingMetric);
      const directionText = corr.direction === 'positive' ? 'increases' : 'decreases';
      
      summary += `${index + 1}. ${financialLabel} ${directionText} ${wellbeingLabel} `;
      summary += `(correlation: ${corr.correlation}, strength: ${corr.strength})\n`;
    });

    return summary;
  }

  /**
   * Get human-readable financial metric labels
   */
  private static getFinancialMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      totalSpending: 'Total Spending',
      entertainmentSpending: 'Entertainment Spending',
      foodSpending: 'Food & Dining Spending',
      shoppingSpending: 'Shopping Spending',
      transportSpending: 'Transportation Spending',
      selfCareSpending: 'Self-Care Spending',
      savingsRate: 'Savings Rate',
      anomalySpending: 'Unusual Spending Events'
    };
    return labels[metric] || metric;
  }

  /**
   * Get human-readable wellbeing metric labels
   */
  private static getWellbeingMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      overallWellbeing: 'Overall Wellbeing',
      stressLevel: 'Stress Levels (inverted)',
      sleepQuality: 'Sleep Quality',
      energyLevel: 'Energy Levels',
      mood: 'Mood'
    };
    return labels[metric] || metric;
  }
}
