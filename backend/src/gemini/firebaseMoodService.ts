/**
 * Firebase Mood Data Service
 * Handles mood data storage and retrieval using Firebase Firestore
 */

import { MoodEntry, MoodSpendingCorrelation, MoodUtils } from './moodTypes';
import { Transaction } from './types';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

// Firebase Admin SDK setup
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (for backend use)
const firebaseConfig = {
  projectId: "hacktx25",
  // Add your service account key here
  // You can get this from Firebase Console > Project Settings > Service Accounts
};

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    // Try to use service account key from environment
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccount) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccount)),
        projectId: firebaseConfig.projectId
      });
    } else {
      // Fallback to default credentials (for local development)
      initializeApp({
        projectId: firebaseConfig.projectId
      });
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed. Make sure to set up service account key.');
  }
}

const db = getFirestore();

export class FirebaseMoodService {
  private collectionName = 'mood_entries';

  constructor() {
    console.log('Firebase Mood Service initialized');
  }

  /**
   * Add a new mood entry
   */
  async addMoodEntry(userId: string, moodData: Omit<MoodEntry, 'id' | 'userId'>): Promise<MoodEntry> {
    try {
      const moodId = `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const moodEntry: MoodEntry = {
        id: moodId,
        userId,
        ...moodData
      };

      await db.collection(this.collectionName).doc(moodId).set({
        ...moodEntry,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Mood entry added for user ${userId}`);
      return moodEntry;
    } catch (error) {
      console.error('❌ Failed to add mood entry:', error);
      throw error;
    }
  }

  /**
   * Get mood entries for a user within a date range
   */
  async getMoodEntries(userId: string, startDate: string, endDate: string): Promise<MoodEntry[]> {
    try {
      const startTimestamp = new Date(startDate).getTime();
      const endTimestamp = new Date(endDate).getTime();

      const snapshot = await db.collection(this.collectionName)
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'asc')
        .get();

      const moodEntries: MoodEntry[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        moodEntries.push({
          id: doc.id,
          userId: data.userId,
          date: data.date,
          overall_wellbeing: data.overall_wellbeing,
          sleep_quality: data.sleep_quality,
          physical_activity: data.physical_activity,
          time_with_family_friends: data.time_with_family_friends,
          diet_quality: data.diet_quality,
          stress_levels: data.stress_levels,
          notes: data.notes
        });
      });

      console.log(`✅ Retrieved ${moodEntries.length} mood entries for user ${userId}`);
      return moodEntries;
    } catch (error) {
      console.error('❌ Failed to get mood entries:', error);
      throw error;
    }
  }

  /**
   * Get a specific mood entry by ID
   */
  async getMoodEntryById(userId: string, moodId: string): Promise<MoodEntry | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(moodId).get();
      
      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      if (!data || data.userId !== userId) {
        throw new Error('Unauthorized access to mood entry');
      }

      return {
        id: doc.id,
        userId: data.userId,
        date: data.date,
        overall_wellbeing: data.overall_wellbeing,
        sleep_quality: data.sleep_quality,
        physical_activity: data.physical_activity,
        time_with_family_friends: data.time_with_family_friends,
        diet_quality: data.diet_quality,
        stress_levels: data.stress_levels,
        notes: data.notes
      };
    } catch (error) {
      console.error('❌ Failed to get mood entry:', error);
      throw error;
    }
  }

  /**
   * Update a mood entry
   */
  async updateMoodEntry(userId: string, moodId: string, updates: Partial<Omit<MoodEntry, 'id' | 'userId'>>): Promise<MoodEntry | null> {
    try {
      const currentEntry = await this.getMoodEntryById(userId, moodId);
      if (!currentEntry) {
        return null;
      }

      const updatedEntry = { ...currentEntry, ...updates };
      
      await db.collection(this.collectionName).doc(moodId).update({
        ...updates,
        updatedAt: Timestamp.now()
      });

      console.log(`✅ Mood entry ${moodId} updated for user ${userId}`);
      return updatedEntry;
    } catch (error) {
      console.error('❌ Failed to update mood entry:', error);
      throw error;
    }
  }

  /**
   * Delete a mood entry
   */
  async deleteMoodEntry(userId: string, moodId: string): Promise<boolean> {
    try {
      const currentEntry = await this.getMoodEntryById(userId, moodId);
      if (!currentEntry) {
        return false;
      }

      await db.collection(this.collectionName).doc(moodId).delete();
      console.log(`✅ Mood entry ${moodId} deleted for user ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete mood entry:', error);
      throw error;
    }
  }

  /**
   * Calculate mood-spending correlations
   */
  async calculateMoodSpendingCorrelations(
    userId: string, 
    startDate: string, 
    endDate: string,
    transactions: Transaction[]
  ): Promise<MoodSpendingCorrelation[]> {
    try {
      const moodEntries = await this.getMoodEntries(userId, startDate, endDate);
      const correlations: MoodSpendingCorrelation[] = [];

      // Group transactions by date
      const dailySpending: Record<string, { amount: number; category: string }[]> = {};
      transactions.forEach(tx => {
        if (!dailySpending[tx.date]) {
          dailySpending[tx.date] = [];
        }
        dailySpending[tx.date].push({ amount: tx.amount, category: tx.category });
      });

      // Calculate correlations for each day with both mood and spending data
      moodEntries.forEach(mood => {
        const daySpending = dailySpending[mood.date];
        if (daySpending && daySpending.length > 0) {
          const totalSpending = daySpending.reduce((sum, item) => sum + item.amount, 0);
          const avgWellbeing = mood.overall_wellbeing;
          
          // Calculate correlation for each spending category
          daySpending.forEach(spending => {
            const correlation = this.calculateCorrelation(
              [avgWellbeing], 
              [spending.amount]
            );
            
            correlations.push({
              date: mood.date,
              overall_wellbeing: avgWellbeing,
              spending: spending.amount,
              category: spending.category,
              correlation
            });
          });
        }
      });

      return correlations;
    } catch (error) {
      console.error('❌ Failed to calculate mood-spending correlations:', error);
      throw error;
    }
  }

  /**
   * Calculate correlation between two arrays
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let numerator = 0;
    let sumXSq = 0;
    let sumYSq = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - meanX;
      const yDiff = y[i] - meanY;
      numerator += xDiff * yDiff;
      sumXSq += xDiff * xDiff;
      sumYSq += yDiff * yDiff;
    }

    const denominator = Math.sqrt(sumXSq * sumYSq);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get mood statistics for a user
   */
  async getMoodStatistics(userId: string, startDate: string, endDate: string): Promise<{
    totalEntries: number;
    averageWellbeing: number;
    averageSleep: number;
    averageStress: number;
    averageActivity: number;
    averageSocial: number;
    averageDiet: number;
    moodDistribution: Record<string, number>;
    mostCommonTriggers: string[];
  }> {
    try {
      const moodEntries = await this.getMoodEntries(userId, startDate, endDate);
      
      if (moodEntries.length === 0) {
      return {
        totalEntries: 0,
        averageWellbeing: 0,
        averageSleep: 0,
        averageStress: 0,
        averageActivity: 0,
        averageSocial: 0,
        averageDiet: 0,
        moodDistribution: {},
        mostCommonTriggers: []
      };
      }

      const wellbeingValues = moodEntries.map(entry => entry.overall_wellbeing);
      const sleepValues = moodEntries.map(entry => entry.sleep_quality);
      const stressValues = moodEntries.map(entry => entry.stress_levels);
      const activityValues = moodEntries.map(entry => entry.physical_activity);
      const socialValues = moodEntries.map(entry => entry.time_with_family_friends);
      const dietValues = moodEntries.map(entry => entry.diet_quality);

      const moodDistribution: Record<string, number> = {};
      moodEntries.forEach(entry => {
        const wellbeingRange = Math.floor(entry.overall_wellbeing / 2) * 2; // Group by 2s (0-2, 2-4, etc.)
        moodDistribution[`${wellbeingRange}-${wellbeingRange + 2}`] = (moodDistribution[`${wellbeingRange}-${wellbeingRange + 2}`] || 0) + 1;
      });

      return {
        totalEntries: moodEntries.length,
        averageWellbeing: wellbeingValues.reduce((a, b) => a + b, 0) / wellbeingValues.length,
        averageSleep: sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length,
        averageStress: stressValues.reduce((a, b) => a + b, 0) / stressValues.length,
        averageActivity: activityValues.reduce((a, b) => a + b, 0) / activityValues.length,
        averageSocial: socialValues.reduce((a, b) => a + b, 0) / socialValues.length,
        averageDiet: dietValues.reduce((a, b) => a + b, 0) / dietValues.length,
        moodDistribution,
        mostCommonTriggers: [] // Could be enhanced to analyze notes for triggers
      };
    } catch (error) {
      console.error('❌ Failed to get mood statistics:', error);
      throw error;
    }
  }
}
