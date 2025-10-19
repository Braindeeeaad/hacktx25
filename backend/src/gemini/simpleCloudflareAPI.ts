/**
 * Simple Cloudflare API Interface
 * Easy-to-use API for frontend integration
 */

import { simpleCloudflareIntegration } from './simpleCloudflareIntegration';
import { WellbeingData } from '../database/types';

/**
 * Simple API for frontend to use
 */
export class SimpleCloudflareAPI {
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
    return await simpleCloudflareIntegration.addMoodEntry(firebaseUserId, moodData);
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
    return await simpleCloudflareIntegration.getCompleteAnalysis(firebaseUserId, startDate, endDate);
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
    return await simpleCloudflareIntegration.getQuickScores(firebaseUserId, startDate, endDate);
  }
}

/**
 * Export the main functions for easy frontend access
 */
export const addMoodEntry = SimpleCloudflareAPI.addMoodEntry;
export const getCompleteAnalysis = SimpleCloudflareAPI.getCompleteAnalysis;
export const getQuickScores = SimpleCloudflareAPI.getQuickScores;
