/**
 * Cloudflare D1 Mood API
 * Direct API endpoints for frontend mood data submission
 */

import { D1Service } from '../database/services/d1Service';
import { WellbeingData } from '../database/types';

export class CloudflareMoodAPI {
  private d1Service: D1Service;

  constructor() {
    this.d1Service = D1Service.getInstance();
  }

  /**
   * Submit mood data from frontend
   */
  async submitMoodData(
    userId: string,
    moodData: {
      overall_wellbeing: number;
      sleep_quality: number;
      physical_activity: number;
      time_with_family_friends: number;
      diet_quality: number;
      stress_levels: number;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log(`📱 Submitting mood data for user: ${userId}`);

      // Validate input data
      const validation = this.validateMoodData(moodData);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Create wellbeing data entry
      const wellbeingData: Omit<WellbeingData, 'id'> = {
        userId,
        date: new Date().toISOString().split('T')[0], // Today's date
        overall_wellbeing: moodData.overall_wellbeing,
        sleep_quality: moodData.sleep_quality,
        physical_activity: moodData.physical_activity,
        time_with_family_friends: moodData.time_with_family_friends,
        diet_quality: moodData.diet_quality,
        stress_levels: moodData.stress_levels,
        notes: moodData.notes || null
      };

      // Check if entry already exists for today
      const existingData = await this.d1Service.getWellbeingDataByDateRange(
        userId,
        wellbeingData.date,
        wellbeingData.date
      );

      if (existingData.length > 0) {
        return {
          success: false,
          message: 'Mood entry already exists for today. Use update endpoint to modify.',
          data: existingData[0]
        };
      }

      // Save to Cloudflare D1
      const savedData = await this.d1Service.createWellbeingData(wellbeingData);
      
      console.log(`✅ Mood data saved for user ${userId} on ${wellbeingData.date}`);

      return {
        success: true,
        message: 'Mood data saved successfully',
        data: savedData
      };

    } catch (error) {
      console.error('❌ Error submitting mood data:', error);
      return {
        success: false,
        message: 'Failed to save mood data'
      };
    }
  }

  /**
   * Update existing mood data
   */
  async updateMoodData(
    userId: string,
    date: string,
    moodData: {
      overall_wellbeing?: number;
      sleep_quality?: number;
      physical_activity?: number;
      time_with_family_friends?: number;
      diet_quality?: number;
      stress_levels?: number;
      notes?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log(`📱 Updating mood data for user: ${userId} on ${date}`);

      // Get existing data
      const existingData = await this.d1Service.getWellbeingDataByDateRange(
        userId,
        date,
        date
      );

      if (existingData.length === 0) {
        return {
          success: false,
          message: 'No mood entry found for the specified date'
        };
      }

      // Update with new data
      const updatedData = {
        ...existingData[0],
        ...moodData,
        notes: moodData.notes !== undefined ? moodData.notes : existingData[0].notes
      };

      // Validate updated data
      const validation = this.validateMoodData(updatedData);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message
        };
      }

      // Save updated data
      const savedData = await this.d1Service.createWellbeingData(updatedData);
      
      console.log(`✅ Mood data updated for user ${userId} on ${date}`);

      return {
        success: true,
        message: 'Mood data updated successfully',
        data: savedData
      };

    } catch (error) {
      console.error('❌ Error updating mood data:', error);
      return {
        success: false,
        message: 'Failed to update mood data'
      };
    }
  }

  /**
   * Get mood data for a user
   */
  async getMoodData(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: WellbeingData[];
  }> {
    try {
      console.log(`📱 Getting mood data for user: ${userId}`);

      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago
      const end = endDate || new Date().toISOString().split('T')[0]; // Today

      const moodData = await this.d1Service.getWellbeingDataByDateRange(userId, start, end);
      
      console.log(`📊 Retrieved ${moodData.length} mood entries for user ${userId}`);

      return {
        success: true,
        message: 'Mood data retrieved successfully',
        data: moodData
      };

    } catch (error) {
      console.error('❌ Error getting mood data:', error);
      return {
        success: false,
        message: 'Failed to retrieve mood data'
      };
    }
  }

  /**
   * Validate mood data
   */
  private validateMoodData(moodData: any): { valid: boolean; message: string } {
    const requiredFields = [
      'overall_wellbeing',
      'sleep_quality',
      'physical_activity',
      'time_with_family_friends',
      'diet_quality',
      'stress_levels'
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (moodData[field] === undefined || moodData[field] === null) {
        return {
          valid: false,
          message: `Missing required field: ${field}`
        };
      }
    }

    // Check value ranges (0-10)
    for (const field of requiredFields) {
      const value = moodData[field];
      if (typeof value !== 'number' || value < 0 || value > 10) {
        return {
          valid: false,
          message: `${field} must be a number between 0 and 10`
        };
      }
    }

    return {
      valid: true,
      message: 'Data is valid'
    };
  }
}

// Export for use
export { CloudflareMoodAPI };
