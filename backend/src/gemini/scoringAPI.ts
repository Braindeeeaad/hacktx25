/**
 * Scoring API Interface
 * Simple API for frontend to access wellness and finance scores
 * Provides easy-to-use functions for displaying scores in the UI
 */

import { generateCompleteScoringSystem } from './wellnessFinanceScoring';
import { MoodEntry } from './moodTypes';

/**
 * Simplified scoring result for frontend display
 */
export interface FrontendScoringResult {
  // Overall scores (0-100)
  overallScore: number;
  wellnessScore: number;
  financeScore: number;
  
  // Grades and status
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  overallStatus: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical';
  
  // Wellness breakdown
  wellnessBreakdown: {
    physical: number;
    mental: number;
    social: number;
  };
  
  // Finance breakdown
  financeBreakdown: {
    spending: number;
    budgeting: number;
    stability: number;
  };
  
  // Key metrics for display
  keyMetrics: {
    correlation: number; // Wellness-finance correlation (-1 to 1)
    spendingConsistency: number; // 0-100
    stressLevel: number; // 0-10
    socialConnection: number; // 0-10
  };
  
  // Top insights and actions
  topInsights: string[];
  topActions: string[];
  
  // Trends
  trends: {
    wellness: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
    finance: {
      improving: string[];
      declining: string[];
      stable: string[];
    };
  };
}

/**
 * Get complete scoring system for frontend display
 */
export async function getScoringSystem(
  moodEntries: Omit<MoodEntry, 'id' | 'userId'>[],
  transactions: any[]
): Promise<FrontendScoringResult> {
  try {
    const scoringResult = await generateCompleteScoringSystem(moodEntries, transactions);
    
    // Transform to frontend-friendly format
    const frontendResult: FrontendScoringResult = {
      overallScore: scoringResult.summary.overallScore,
      wellnessScore: scoringResult.wellness.overall,
      financeScore: scoringResult.finance.overall,
      
      overallGrade: scoringResult.summary.grade,
      overallStatus: scoringResult.summary.status,
      
      wellnessBreakdown: {
        physical: scoringResult.wellness.breakdown.physical,
        mental: scoringResult.wellness.breakdown.mental,
        social: scoringResult.wellness.breakdown.social,
      },
      
      financeBreakdown: {
        spending: scoringResult.finance.breakdown.spending,
        budgeting: scoringResult.finance.breakdown.budgeting,
        stability: scoringResult.finance.breakdown.stability,
      },
      
      keyMetrics: {
        correlation: scoringResult.correlation.correlation,
        spendingConsistency: calculateSpendingConsistency(transactions),
        stressLevel: calculateAverageStress(moodEntries),
        socialConnection: calculateAverageSocial(moodEntries),
      },
      
      topInsights: scoringResult.summary.keyInsights,
      topActions: scoringResult.summary.priorityActions,
      
      trends: {
        wellness: {
          improving: scoringResult.wellness.trends.improving,
          declining: scoringResult.wellness.trends.declining,
          stable: scoringResult.wellness.trends.stable,
        },
        finance: {
          improving: scoringResult.finance.trends.improving,
          declining: scoringResult.finance.trends.declining,
          stable: scoringResult.finance.trends.stable,
        },
      },
    };
    
    return frontendResult;
    
  } catch (error) {
    console.error('Error generating scoring system:', error);
    throw error;
  }
}

/**
 * Get just the overall scores for quick display
 */
export async function getQuickScores(
  moodEntries: Omit<MoodEntry, 'id' | 'userId'>[],
  transactions: any[]
): Promise<{
  overallScore: number;
  wellnessScore: number;
  financeScore: number;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  overallStatus: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical';
}> {
  const scoringResult = await generateCompleteScoringSystem(moodEntries, transactions);
  
  return {
    overallScore: scoringResult.summary.overallScore,
    wellnessScore: scoringResult.wellness.overall,
    financeScore: scoringResult.finance.overall,
    overallGrade: scoringResult.summary.grade,
    overallStatus: scoringResult.summary.status,
  };
}

/**
 * Get wellness score only
 */
export async function getWellnessScore(
  moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]
): Promise<{
  overall: number;
  breakdown: {
    physical: number;
    mental: number;
    social: number;
  };
  insights: string[];
  recommendations: string[];
}> {
  const { generateWellnessScore } = await import('./wellnessFinanceScoring');
  const wellnessScore = await generateWellnessScore(moodEntries);
  
  return {
    overall: wellnessScore.overall,
    breakdown: wellnessScore.breakdown,
    insights: wellnessScore.insights,
    recommendations: wellnessScore.recommendations,
  };
}

/**
 * Get finance score only
 */
export async function getFinanceScore(
  transactions: any[]
): Promise<{
  overall: number;
  breakdown: {
    spending: number;
    budgeting: number;
    stability: number;
  };
  insights: string[];
  recommendations: string[];
}> {
  const { generateFinanceScore } = await import('./wellnessFinanceScoring');
  const financeScore = await generateFinanceScore(transactions);
  
  return {
    overall: financeScore.overall,
    breakdown: financeScore.breakdown,
    insights: financeScore.insights,
    recommendations: financeScore.recommendations,
  };
}

// Helper functions
function calculateSpendingConsistency(transactions: any[]): number {
  const dailySpending: Record<string, number> = {};
  transactions.forEach(tx => {
    dailySpending[tx.date] = (dailySpending[tx.date] || 0) + tx.amount;
  });
  
  const dailyAmounts = Object.values(dailySpending);
  if (dailyAmounts.length === 0) return 0;
  
  const mean = dailyAmounts.reduce((sum, amount) => sum + amount, 0) / dailyAmounts.length;
  const variance = dailyAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / dailyAmounts.length;
  const coefficient = Math.sqrt(variance) / mean;
  
  // Convert to 0-100 scale (lower coefficient = higher consistency)
  return Math.max(0, Math.min(100, 100 - (coefficient * 50)));
}

function calculateAverageStress(moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]): number {
  if (moodEntries.length === 0) return 0;
  return moodEntries.reduce((sum, entry) => sum + entry.stress_levels, 0) / moodEntries.length;
}

function calculateAverageSocial(moodEntries: Omit<MoodEntry, 'id' | 'userId'>[]): number {
  if (moodEntries.length === 0) return 0;
  return moodEntries.reduce((sum, entry) => sum + entry.time_with_family_friends, 0) / moodEntries.length;
}
