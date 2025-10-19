/**
 * Mood Data Types for Cloudflare D1 Integration
 * Designed to work seamlessly with existing spending analysis
 */

export interface MoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format (same as spending data)
  mood: MoodLevel;
  sleep: SleepLevel;
  stress: StressLevel;
  notes?: string;
  tags?: string[]; // e.g., ['work', 'social', 'exercise']
  location?: string;
  weather?: string;
}

export type MoodLevel = 
  | 'very_happy' 
  | 'happy' 
  | 'neutral' 
  | 'sad' 
  | 'very_sad';

export type SleepLevel = 
  | 'very_high' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'very_low';

export type StressLevel = 
  | 'very_low' 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'very_high';

export interface MoodSpendingCorrelation {
  date: string;
  mood: number;
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

// Database schema for Cloudflare D1
export const MOOD_DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS mood_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('very_happy', 'happy', 'neutral', 'sad', 'very_sad')),
  sleep TEXT NOT NULL CHECK (sleep IN ('very_high', 'high', 'medium', 'low', 'very_low')),
  stress TEXT NOT NULL CHECK (stress IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  notes TEXT,
  tags TEXT, -- JSON array as string
  location TEXT,
  weather TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mood_user_date ON mood_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mood_timestamp ON mood_entries(timestamp);
`;

// Utility functions for mood data
export class MoodUtils {
  static moodToNumber(mood: MoodLevel): number {
    const moodMap = {
      'very_happy': 2,
      'happy': 1,
      'neutral': 0,
      'sad': -1,
      'very_sad': -2
    };
    return moodMap[mood];
  }

  static sleepToNumber(sleep: SleepLevel): number {
    const sleepMap = {
      'very_high': 2,
      'high': 1,
      'medium': 0,
      'low': -1,
      'very_low': -2
    };
    return sleepMap[sleep];
  }

  static stressToNumber(stress: StressLevel): number {
    const stressMap = {
      'very_low': -2,
      'low': -1,
      'medium': 0,
      'high': 1,
      'very_high': 2
    };
    return stressMap[stress];
  }

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
}
