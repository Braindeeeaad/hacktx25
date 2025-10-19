/**
 * Frontend Export Utilities
 * Formats analysis results for frontend display
 */

import { AnalysisResult, CategoryAnalysis, Anomaly, Recommendation, WellnessTip } from './types';

export interface FrontendDisplayData {
  // Summary card data
  summary: {
    totalSpent: number;
    averageDaily: number;
    spanDays: number;
    mainInsight: string; // Short attention-grabbing insight
  };
  
  // Category cards data
  categories: CategoryCard[];
  
  // Anomaly alerts data
  anomalies: AnomalyCard[];
  
  // Recommendation cards data
  recommendations: RecommendationCard[];
  
  // Wellness tips data
  wellnessTips: WellnessCard[];
}

export interface CategoryCard {
  category: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  shortInsight: string;
  detailedAnalysis: string;
  wellnessAdvice?: string;
  color: 'red' | 'green' | 'yellow'; // For UI styling
}

export interface AnomalyCard {
  date: string;
  category: string;
  amount: number;
  shortInsight: string;
  detailedReason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface RecommendationCard {
  shortInsight: string;
  detailedAdvice: string;
  category: 'financial' | 'wellness' | 'behavioral';
}

export interface WellnessCard {
  trigger: string;
  shortTip: string;
  detailedTip: string;
  icon: string; // For UI display
}

export class FrontendExporter {
  /**
   * Convert analysis result to frontend display format
   */
  static exportForFrontend(analysis: AnalysisResult): FrontendDisplayData {
    return {
      summary: {
        totalSpent: analysis.summary.totalSpent,
        averageDaily: analysis.summary.averageDaily,
        spanDays: analysis.summary.spanDays,
        mainInsight: this.generateMainInsight(analysis)
      },
      categories: this.formatCategories(analysis.categories),
      anomalies: this.formatAnomalies(analysis.anomalies),
      recommendations: this.formatRecommendations(analysis.recommendations),
      wellnessTips: this.formatWellnessTips(analysis.wellnessTips)
    };
  }

  /**
   * Generate main attention-grabbing insight
   */
  private static generateMainInsight(analysis: AnalysisResult): string {
    const totalSpent = analysis.summary.totalSpent;
    const avgDaily = analysis.summary.averageDaily;
    
    // Find the most significant trend
    const significantCategory = analysis.categories.find(cat => 
      Math.abs(parseFloat(cat.change.replace('%', ''))) > 20
    );
    
    if (significantCategory) {
      const trend = significantCategory.trend === 'up' ? 'increased' : 'decreased';
      return `${significantCategory.category} spending ${trend} by ${significantCategory.change}`;
    }
    
    if (avgDaily > 200) {
      return `High daily spending: $${avgDaily.toFixed(2)}/day`;
    }
    
    return `Total spent: $${totalSpent.toFixed(2)} over ${analysis.summary.spanDays} days`;
  }

  /**
   * Format categories for frontend display
   */
  private static formatCategories(categories: CategoryAnalysis[]): CategoryCard[] {
    return categories.map(category => ({
      category: category.category,
      trend: category.trend,
      change: category.change,
      shortInsight: category.shortInsight,
      detailedAnalysis: category.detailedAnalysis,
      wellnessAdvice: category.wellnessAdvice,
      color: this.getCategoryColor(category.trend, category.change)
    }));
  }

  /**
   * Format anomalies for frontend display
   */
  private static formatAnomalies(anomalies: Anomaly[]): AnomalyCard[] {
    return anomalies.map(anomaly => ({
      date: anomaly.date,
      category: anomaly.category,
      amount: anomaly.amount,
      shortInsight: anomaly.shortInsight,
      detailedReason: anomaly.detailedReason,
      severity: this.getAnomalySeverity(anomaly.amount)
    }));
  }

  /**
   * Format recommendations for frontend display
   */
  private static formatRecommendations(recommendations: Recommendation[]): RecommendationCard[] {
    return recommendations.map(rec => ({
      shortInsight: rec.shortInsight,
      detailedAdvice: rec.detailedAdvice,
      category: this.getRecommendationCategory(rec.detailedAdvice)
    }));
  }

  /**
   * Format wellness tips for frontend display
   */
  private static formatWellnessTips(wellnessTips: WellnessTip[]): WellnessCard[] {
    return wellnessTips.map(tip => ({
      trigger: tip.trigger,
      shortTip: tip.shortTip,
      detailedTip: tip.detailedTip,
      icon: this.getWellnessIcon(tip.trigger)
    }));
  }

  /**
   * Get color for category based on trend
   */
  private static getCategoryColor(trend: string, change: string): 'red' | 'green' | 'yellow' {
    const changeValue = parseFloat(change.replace('%', ''));
    
    if (trend === 'up' && changeValue > 20) return 'red';
    if (trend === 'down' && changeValue > 20) return 'green';
    return 'yellow';
  }

  /**
   * Get anomaly severity based on amount
   */
  private static getAnomalySeverity(amount: number): 'low' | 'medium' | 'high' {
    if (amount > 500) return 'high';
    if (amount > 200) return 'medium';
    return 'low';
  }

  /**
   * Get recommendation category based on content
   */
  private static getRecommendationCategory(advice: string): 'financial' | 'wellness' | 'behavioral' {
    const lowerAdvice = advice.toLowerCase();
    
    if (lowerAdvice.includes('breathing') || lowerAdvice.includes('yoga') || lowerAdvice.includes('meditation')) {
      return 'wellness';
    }
    
    if (lowerAdvice.includes('budget') || lowerAdvice.includes('spending') || lowerAdvice.includes('money')) {
      return 'financial';
    }
    
    return 'behavioral';
  }

  /**
   * Get wellness icon based on trigger
   */
  private static getWellnessIcon(trigger: string): string {
    const iconMap: { [key: string]: string } = {
      'stress': '🧘',
      'low_mood': '📞',
      'anxiety': '🫁',
      'boredom': '🎯',
      'loneliness': '👥',
      'fatigue': '😴'
    };
    
    return iconMap[trigger] || '💡';
  }

  /**
   * Export for specific frontend components
   */
  static exportForComponents(analysis: AnalysisResult) {
    return {
      // For summary dashboard
      summaryCard: {
        totalSpent: analysis.summary.totalSpent,
        averageDaily: analysis.summary.averageDaily,
        spanDays: analysis.summary.spanDays,
        mainInsight: this.generateMainInsight(analysis)
      },
      
      // For category breakdown
      categoryCards: analysis.categories.map(cat => ({
        title: cat.category,
        trend: cat.trend,
        change: cat.change,
        shortText: cat.shortInsight,
        longText: cat.detailedAnalysis,
        wellnessTip: cat.wellnessAdvice,
        color: this.getCategoryColor(cat.trend, cat.change)
      })),
      
      // For anomaly alerts
      anomalyAlerts: analysis.anomalies.map(anomaly => ({
        date: anomaly.date,
        category: anomaly.category,
        amount: anomaly.amount,
        shortText: anomaly.shortInsight,
        longText: anomaly.detailedReason,
        severity: this.getAnomalySeverity(anomaly.amount)
      })),
      
      // For recommendation cards
      recommendationCards: analysis.recommendations.map(rec => ({
        shortText: rec.shortInsight,
        longText: rec.detailedAdvice,
        category: this.getRecommendationCategory(rec.detailedAdvice)
      })),
      
      // For wellness tips
      wellnessCards: analysis.wellnessTips.map(tip => ({
        trigger: tip.trigger,
        shortText: tip.shortTip,
        longText: tip.detailedTip,
        icon: this.getWellnessIcon(tip.trigger)
      }))
    };
  }
}
