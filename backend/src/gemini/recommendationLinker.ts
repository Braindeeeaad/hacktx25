/**
 * Recommendation Linker Utility
 * Helps create linked recommendations with their supporting insights and anomalies
 */

import { AnalysisResult, Recommendation, Anomaly, CategoryAnalysis } from './types';

export interface LinkedRecommendation extends Recommendation {
  supportingInsights: CategoryAnalysis[];
  supportingAnomalies: Anomaly[];
}

export class RecommendationLinker {
  /**
   * Create linked recommendations with their supporting data
   */
  static createLinkedRecommendations(analysis: AnalysisResult): LinkedRecommendation[] {
    return analysis.recommendations.map(rec => ({
      ...rec,
      supportingInsights: this.findSupportingInsights(rec, analysis.categories),
      supportingAnomalies: this.findSupportingAnomalies(rec, analysis.anomalies)
    }));
  }

  /**
   * Find category insights that support a recommendation
   */
  private static findSupportingInsights(
    recommendation: Recommendation, 
    categories: CategoryAnalysis[]
  ): CategoryAnalysis[] {
    return categories.filter(category => {
      const insightText = category.detailedAnalysis.toLowerCase();
      const recText = recommendation.detailedAdvice.toLowerCase();
      
      // Check for keyword matches
      const keywords = this.extractKeywords(recommendation);
      return keywords.some(keyword => insightText.includes(keyword));
    });
  }

  /**
   * Find anomalies that support a recommendation
   */
  private static findSupportingAnomalies(
    recommendation: Recommendation,
    anomalies: Anomaly[]
  ): Anomaly[] {
    return anomalies.filter(anomaly => {
      // Check if anomaly ID is in linked anomalies
      if (recommendation.linkedAnomalies.includes(anomaly.id)) {
        return true;
      }
      
      // Check for category matches
      const recText = recommendation.detailedAdvice.toLowerCase();
      const anomalyText = anomaly.detailedReason.toLowerCase();
      
      return this.hasCategoryMatch(recText, anomalyText) || 
             this.hasSpendingPatternMatch(recText, anomalyText);
    });
  }

  /**
   * Extract keywords from recommendation text
   */
  private static extractKeywords(recommendation: Recommendation): string[] {
    const text = recommendation.detailedAdvice.toLowerCase();
    const keywords: string[] = [];
    
    // Common spending categories
    if (text.includes('food') || text.includes('eating')) keywords.push('food', 'eating');
    if (text.includes('shopping') || text.includes('retail')) keywords.push('shopping', 'retail');
    if (text.includes('entertainment') || text.includes('experience')) keywords.push('entertainment', 'experience');
    if (text.includes('transport') || text.includes('travel')) keywords.push('transport', 'travel');
    
    // Emotional triggers
    if (text.includes('stress') || text.includes('anxiety')) keywords.push('stress', 'anxiety');
    if (text.includes('mood') || text.includes('emotional')) keywords.push('mood', 'emotional');
    if (text.includes('impulse') || text.includes('spontaneous')) keywords.push('impulse', 'spontaneous');
    
    return keywords;
  }

  /**
   * Check if recommendation and anomaly have category matches
   */
  private static hasCategoryMatch(recText: string, anomalyText: string): boolean {
    const categories = ['food', 'shopping', 'entertainment', 'transport', 'utilities'];
    return categories.some(category => 
      recText.includes(category) && anomalyText.includes(category)
    );
  }

  /**
   * Check if recommendation and anomaly have spending pattern matches
   */
  private static hasSpendingPatternMatch(recText: string, anomalyText: string): boolean {
    const patterns = ['stress', 'emotional', 'impulse', 'unusual', 'high', 'low'];
    return patterns.some(pattern => 
      recText.includes(pattern) && anomalyText.includes(pattern)
    );
  }

  /**
   * Generate frontend-friendly recommendation cards
   */
  static generateRecommendationCards(analysis: AnalysisResult) {
    const linkedRecommendations = this.createLinkedRecommendations(analysis);
    
    return linkedRecommendations.map(rec => ({
      // Card header (what user sees initially)
      cardHeader: {
        title: rec.shortInsight,
        category: rec.category,
        icon: this.getCategoryIcon(rec.category),
        color: this.getCategoryColor(rec.category)
      },
      
      // Detailed view (what user sees when they click)
      detailedView: {
        recommendation: rec.detailedAdvice,
        supportingInsights: rec.supportingInsights.map(insight => ({
          category: insight.category,
          insight: insight.detailedAnalysis,
          trend: insight.trend,
          change: insight.change
        })),
        supportingAnomalies: rec.supportingAnomalies.map(anomaly => ({
          date: anomaly.date,
          category: anomaly.category,
          amount: anomaly.amount,
          reason: anomaly.detailedReason
        }))
      }
    }));
  }

  /**
   * Get icon for recommendation category
   */
  private static getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'financial': '💰',
      'wellness': '🧘',
      'behavioral': '🎯'
    };
    return iconMap[category] || '💡';
  }

  /**
   * Get color for recommendation category
   */
  private static getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      'financial': 'blue',
      'wellness': 'green',
      'behavioral': 'purple'
    };
    return colorMap[category] || 'gray';
  }
}
