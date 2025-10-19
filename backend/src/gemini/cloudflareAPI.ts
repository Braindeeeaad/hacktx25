/**
 * Cloudflare API Interface
 * Simple API for frontend to access mood data and analysis
 * Connects Firebase login → Cloudflare mood data → Gemini analysis
 */

import { cloudflareMoodIntegration } from './cloudflareMoodIntegration';
import { WellbeingData } from '../database/types';

/**
 * Simple API for frontend to use
 */
export class CloudflareAPI {
  /**
   * Add mood entry (frontend calls this when user submits mood data)
   */
  static async addMoodEntry(
    firebaseUserId: string,
    moodData: {
      date: string;
      overall_wellbeing: number;
      sleep_quality: number;
      physical_activity: number;
      time_with_family_friends: number;
      diet_quality: number;
      stress_levels: number;
    }
  ): Promise<WellbeingData> {
    return await cloudflareMoodIntegration.addMoodEntry(firebaseUserId, moodData);
  }

  /**
   * Get complete analysis (mood + spending + AI insights + scores)
   */
  static async getCompleteAnalysis(
    firebaseUserId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    moodData: WellbeingData[];
    spendingData: any[];
    analysis: any;
    scores: any;
  }> {
    return await cloudflareMoodIntegration.getCompleteAnalysis(firebaseUserId, startDate, endDate);
  }

  /**
   * Get quick scores for dashboard
   */
  static async getQuickScores(
    firebaseUserId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    overallScore: number;
    wellnessScore: number;
    financeScore: number;
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    overallStatus: 'excellent' | 'good' | 'fair' | 'needs_improvement' | 'critical';
  }> {
    return await cloudflareMoodIntegration.getQuickScores(firebaseUserId, startDate, endDate);
  }

  /**
   * Get mood data only
   */
  static async getMoodData(
    firebaseUserId: string,
    startDate: string,
    endDate: string
  ): Promise<WellbeingData[]> {
    return await cloudflareMoodIntegration.getMoodData(firebaseUserId, startDate, endDate);
  }

  /**
   * Get spending data only
   */
  static async getSpendingData(
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    return await cloudflareMoodIntegration.getSpendingData(startDate, endDate);
  }
}

/**
 * Export the main functions for easy frontend access
 */
export const addMoodEntry = CloudflareAPI.addMoodEntry;
export const getCompleteAnalysis = CloudflareAPI.getCompleteAnalysis;
export const getQuickScores = CloudflareAPI.getQuickScores;
export const getMoodData = CloudflareAPI.getMoodData;
export const getSpendingData = CloudflareAPI.getSpendingData;
