/**
 * Firebase to Cloudflare D1 Bridge
 * Syncs mood data from Firebase Firestore to Cloudflare D1 for analysis
 */

import { D1Service } from '../database/services/d1Service';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Firebase configuration (you'll need to add your Firebase config)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class FirebaseToCloudflareBridge {
  private d1Service: D1Service;

  constructor() {
    this.d1Service = D1Service.getInstance();
  }

  /**
   * Sync mood data from Firebase to Cloudflare D1
   */
  async syncMoodDataFromFirebase(userId: string, startDate?: string, endDate?: string): Promise<{
    synced: number;
    skipped: number;
    errors: number;
  }> {
    console.log(`🔄 Syncing mood data from Firebase to Cloudflare D1 for user: ${userId}`);
    
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Query Firebase for mood entries
      const moodEntriesRef = collection(db, 'mood_entries');
      let q = query(
        moodEntriesRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      // Add date range filter if provided
      if (startDate && endDate) {
        q = query(
          moodEntriesRef,
          where('userId', '==', userId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      console.log(`📊 Found ${querySnapshot.size} mood entries in Firebase`);

      // Process each mood entry
      for (const doc of querySnapshot.docs) {
        try {
          const firebaseData = doc.data();
          
          // Convert Firebase data to Cloudflare D1 format
          const cloudflareData = this.convertFirebaseToCloudflareFormat(firebaseData);
          
          // Check if entry already exists in Cloudflare D1
          const existingData = await this.d1Service.getWellbeingDataByDateRange(
            userId,
            cloudflareData.date,
            cloudflareData.date
          );

          if (existingData.length > 0) {
            console.log(`⚠️ Entry for ${cloudflareData.date} already exists in Cloudflare D1, skipping...`);
            skipped++;
            continue;
          }

          // Save to Cloudflare D1
          await this.d1Service.createWellbeingData(cloudflareData);
          console.log(`✅ Synced mood entry for ${cloudflareData.date}`);
          synced++;

        } catch (error) {
          console.error(`❌ Error syncing entry ${doc.id}:`, error);
          errors++;
        }
      }

      console.log(`🎉 Sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors`);
      return { synced, skipped, errors };

    } catch (error) {
      console.error('❌ Error syncing mood data from Firebase:', error);
      throw error;
    }
  }

  /**
   * Convert Firebase mood data format to Cloudflare D1 format
   */
  private convertFirebaseToCloudflareFormat(firebaseData: any): any {
    return {
      userId: firebaseData.userId,
      date: firebaseData.date,
      overall_wellbeing: firebaseData.overall_wellbeing || 5,
      sleep_quality: firebaseData.sleep_quality || 5,
      physical_activity: firebaseData.physical_activity || 5,
      time_with_family_friends: firebaseData.time_with_family_friends || 5,
      diet_quality: firebaseData.diet_quality || 5,
      stress_levels: firebaseData.stress_levels || 5,
      notes: firebaseData.notes || null
    };
  }

  /**
   * Get mood data from Firebase and sync to Cloudflare D1
   */
  async getAndSyncMoodData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    firebaseData: any[];
    cloudflareData: any[];
    syncResults: any;
  }> {
    console.log(`🔄 Getting and syncing mood data for user: ${userId}`);
    console.log(`📅 Date range: ${startDate} to ${endDate}`);

    try {
      // Step 1: Get data from Firebase
      console.log('1️⃣ Fetching data from Firebase...');
      const firebaseData = await this.getMoodDataFromFirebase(userId, startDate, endDate);
      console.log(`📊 Found ${firebaseData.length} entries in Firebase`);

      // Step 2: Sync to Cloudflare D1
      console.log('2️⃣ Syncing to Cloudflare D1...');
      const syncResults = await this.syncMoodDataFromFirebase(userId, startDate, endDate);

      // Step 3: Get data from Cloudflare D1
      console.log('3️⃣ Fetching data from Cloudflare D1...');
      const cloudflareData = await this.d1Service.getWellbeingDataByDateRange(userId, startDate, endDate);
      console.log(`📊 Found ${cloudflareData.length} entries in Cloudflare D1`);

      return {
        firebaseData,
        cloudflareData,
        syncResults
      };

    } catch (error) {
      console.error('❌ Error in getAndSyncMoodData:', error);
      throw error;
    }
  }

  /**
   * Get mood data directly from Firebase
   */
  private async getMoodDataFromFirebase(userId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      const moodEntriesRef = collection(db, 'mood_entries');
      const q = query(
        moodEntriesRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const moodData: any[] = [];

      querySnapshot.forEach((doc) => {
        moodData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return moodData;

    } catch (error) {
      console.error('❌ Error getting mood data from Firebase:', error);
      throw error;
    }
  }

  /**
   * Check if user has mood data in Firebase
   */
  async checkFirebaseMoodData(userId: string): Promise<{
    hasData: boolean;
    totalEntries: number;
    latestEntry?: any;
  }> {
    try {
      const moodEntriesRef = collection(db, 'mood_entries');
      const q = query(
        moodEntriesRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      const hasData = !querySnapshot.empty;
      const latestEntry = hasData ? querySnapshot.docs[0].data() : null;

      // Get total count
      const countQuery = query(moodEntriesRef, where('userId', '==', userId));
      const countSnapshot = await getDocs(countQuery);
      const totalEntries = countSnapshot.size;

      return {
        hasData,
        totalEntries,
        latestEntry
      };

    } catch (error) {
      console.error('❌ Error checking Firebase mood data:', error);
      return {
        hasData: false,
        totalEntries: 0
      };
    }
  }
}

// Export for use
export { FirebaseToCloudflareBridge };
