/**
 * Mood Data Types for Firebase Integration
 * Designed to work seamlessly with existing spending analysis
 */

export interface MoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format (same as spending data)
  overall_wellbeing: number; // 0-10 scale
  sleep_quality: number; // 0-10 scale
  physical_activity: number; // 0-10 scale
  time_with_family_friends: number; // 0-10 scale
  diet_quality: number; // 0-10 scale
  stress_levels: number; // 0-10 scale
  notes?: string;
}

export interface MoodSpendingCorrelation {
  date: string;
  overall_wellbeing: number;
  spending: number;
  category: string;
  correlation: number;
}

export interface EmotionalSpendingPattern {
  pattern: string;
  description: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendation: string;
}

// Utility functions for mood data
export class MoodUtils {
  /**
   * Validate mood entry data
   */
  static validateMoodEntry(entry: Partial<MoodEntry>): boolean {
    const requiredFields = ['overall_wellbeing', 'sleep_quality', 'physical_activity', 'time_with_family_friends', 'diet_quality', 'stress_levels'];
    
    for (const field of requiredFields) {
      const value = entry[field as keyof MoodEntry];
      if (typeof value !== 'number' || value < 0 || value > 10) {
        return false;
      }
    }
    return true;
  }

  /**
   * Calculate overall wellness score from mood entry
   */
  static calculateWellnessScore(entry: MoodEntry): number {
    const weights = {
      overall_wellbeing: 0.3,
      sleep_quality: 0.2,
      physical_activity: 0.15,
      time_with_family_friends: 0.15,
      diet_quality: 0.1,
      stress_levels: 0.1 // Lower stress = higher score
    };

    return (
      entry.overall_wellbeing * weights.overall_wellbeing +
      entry.sleep_quality * weights.sleep_quality +
      entry.physical_activity * weights.physical_activity +
      entry.time_with_family_friends * weights.time_with_family_friends +
      entry.diet_quality * weights.diet_quality +
      (10 - entry.stress_levels) * weights.stress_levels // Invert stress (lower stress = higher score)
    );
  }

  /**
   * Get mood insights from entry
   */
  static getMoodInsights(entry: MoodEntry): string[] {
    const insights: string[] = [];

    if (entry.overall_wellbeing >= 8) {
      insights.push('High overall wellbeing');
    } else if (entry.overall_wellbeing <= 3) {
      insights.push('Low overall wellbeing - may need attention');
    }

    if (entry.sleep_quality >= 8) {
      insights.push('Excellent sleep quality');
    } else if (entry.sleep_quality <= 3) {
      insights.push('Poor sleep quality - consider sleep hygiene');
    }

    if (entry.physical_activity >= 8) {
      insights.push('High physical activity level');
    } else if (entry.physical_activity <= 3) {
      insights.push('Low physical activity - consider more movement');
    }

    if (entry.time_with_family_friends >= 8) {
      insights.push('Strong social connections');
    } else if (entry.time_with_family_friends <= 3) {
      insights.push('Limited social time - consider reaching out');
    }

    if (entry.diet_quality >= 8) {
      insights.push('Excellent diet quality');
    } else if (entry.diet_quality <= 3) {
      insights.push('Poor diet quality - consider nutrition improvements');
    }

    if (entry.stress_levels >= 8) {
      insights.push('High stress levels - consider stress management');
    } else if (entry.stress_levels <= 3) {
      insights.push('Low stress levels - good stress management');
    }

    return insights;
  }

  /**
   * Calculate correlation between mood and spending
   */
  static calculateCorrelation(moodData: number[], spendingData: number[]): number {
    if (moodData.length !== spendingData.length || moodData.length === 0) {
      return 0;
    }

    const n = moodData.length;
    const sumMood = moodData.reduce((a, b) => a + b, 0);
    const sumSpending = spendingData.reduce((a, b) => a + b, 0);
    const meanMood = sumMood / n;
    const meanSpending = sumSpending / n;

    let numerator = 0;
    let moodSumSq = 0;
    let spendingSumSq = 0;

    for (let i = 0; i < n; i++) {
      const moodDiff = moodData[i] - meanMood;
      const spendingDiff = spendingData[i] - meanSpending;
      
      numerator += moodDiff * spendingDiff;
      moodSumSq += moodDiff * moodDiff;
      spendingSumSq += spendingDiff * spendingDiff;
    }

    const denominator = Math.sqrt(moodSumSq * spendingSumSq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get spending trigger insights based on mood patterns
   */
  static getSpendingTriggers(entry: MoodEntry): string[] {
    const triggers: string[] = [];

    // High stress + low wellbeing = likely emotional spending
    if (entry.stress_levels >= 7 && entry.overall_wellbeing <= 4) {
      triggers.push('High stress with low wellbeing - high risk of emotional spending');
    }

    // Low social time + low wellbeing = potential loneliness spending
    if (entry.time_with_family_friends <= 3 && entry.overall_wellbeing <= 4) {
      triggers.push('Limited social connection with low wellbeing - may trigger loneliness spending');
    }

    // Poor sleep + high stress = impulse spending risk
    if (entry.sleep_quality <= 3 && entry.stress_levels >= 7) {
      triggers.push('Poor sleep with high stress - increased impulse spending risk');
    }

    // Low physical activity + high stress = comfort spending
    if (entry.physical_activity <= 3 && entry.stress_levels >= 6) {
      triggers.push('Low activity with high stress - may lead to comfort spending');
    }

    return triggers;
  }
}