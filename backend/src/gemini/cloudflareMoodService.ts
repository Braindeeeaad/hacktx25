/**
 * Cloudflare D1 Mood Data Service
 * Handles mood data storage and retrieval from Cloudflare D1 database
 */

import { MoodEntry, MoodSpendingCorrelation, MoodUtils, MOOD_DB_SCHEMA } from './moodTypes';
import { Transaction } from './types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

export class CloudflareMoodService {
  private accountId: string;
  private apiToken: string;
  private databaseId: string;
  private baseUrl: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
    this.databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}`;

    if (!this.accountId || !this.apiToken || !this.databaseId) {
      throw new Error('Cloudflare credentials not found. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and CLOUDFLARE_D1_DATABASE_ID in your .env file.');
    }
  }

  /**
   * Initialize the database schema
   */
  async initializeDatabase(): Promise<void> {
    try {
      await this.executeQuery(MOOD_DB_SCHEMA);
      console.log('✅ Mood database schema initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize mood database:', error);
      throw error;
    }
  }

  /**
   * Add a new mood entry
   */
  async addMoodEntry(moodEntry: Omit<MoodEntry, 'id'>): Promise<MoodEntry> {
    const id = `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entry: MoodEntry = {
      ...moodEntry,
      id,
      timestamp: new Date().toISOString()
    };

    const query = `
      INSERT INTO mood_entries (
        id, user_id, date, timestamp, mood, energy, stress, 
        notes, tags, location, weather
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const tagsJson = moodEntry.tags ? JSON.stringify(moodEntry.tags) : null;

    await this.executeQuery(query, [
      entry.id,
      entry.userId,
      entry.date,
      entry.timestamp,
      entry.mood,
      entry.energy,
      entry.stress,
      entry.notes || null,
      tagsJson,
      entry.location || null,
      entry.weather || null
    ]);

    console.log(`✅ Mood entry added for ${entry.date}`);
    return entry;
  }

  /**
   * Get mood entries for a date range
   */
  async getMoodEntries(userId: string, startDate: string, endDate: string): Promise<MoodEntry[]> {
    const query = `
      SELECT * FROM mood_entries 
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY timestamp ASC
    `;

    const result = await this.executeQuery(query, [userId, startDate, endDate]);
    return this.parseMoodEntries(result);
  }

  /**
   * Analyze mood correlation with spending
   */
  async analyzeMoodSpendingCorrelation(
    userId: string, 
    startDate: string, 
    endDate: string,
    transactions: Transaction[]
  ): Promise<MoodSpendingCorrelation[]> {
    const moodEntries = await this.getMoodEntries(userId, startDate, endDate);
    const correlations: MoodSpendingCorrelation[] = [];

    // Group transactions by date
    const transactionsByDate = new Map<string, Transaction[]>();
    transactions.forEach(tx => {
      const date = tx.date;
      if (!transactionsByDate.has(date)) {
        transactionsByDate.set(date, []);
      }
      transactionsByDate.get(date)!.push(tx);
    });

    // Calculate daily correlations
    for (const moodEntry of moodEntries) {
      const dayTransactions = transactionsByDate.get(moodEntry.date) || [];
      const dailySpending = dayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      // Calculate correlation for this day
      const moodValue = MoodUtils.moodToNumber(moodEntry.mood);
      const correlation = this.calculateDailyCorrelation(moodValue, dailySpending);

      correlations.push({
        date: moodEntry.date,
        mood: moodValue,
        spending: dailySpending,
        category: this.getPrimaryCategory(dayTransactions),
        correlation
      });
    }

    return correlations;
  }

  /**
   * Execute a SQL query against Cloudflare D1
   */
  private async executeQuery(query: string, params: any[] = []): Promise<any> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: query,
        params: params
      })
    });

    if (!response.ok) {
      throw new Error(`Cloudflare D1 API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.result || [];
  }

  /**
   * Parse mood entries from database result
   */
  private parseMoodEntries(result: any[]): MoodEntry[] {
    return result.map(row => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      timestamp: row.timestamp,
      mood: row.mood as any,
      energy: row.energy as any,
      stress: row.stress as any,
      notes: row.notes,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      location: row.location,
      weather: row.weather
    }));
  }

  /**
   * Calculate daily correlation between mood and spending
   */
  private calculateDailyCorrelation(mood: number, spending: number): number {
    // Simple correlation: positive mood might lead to more spending
    if (spending === 0) return 0;
    
    // Normalize the correlation
    const normalizedMood = mood / 2; // Scale from -1 to 1
    const normalizedSpending = Math.min(spending / 100, 1); // Scale spending
    
    return normalizedMood * normalizedSpending;
  }

  /**
   * Get primary spending category for a day
   */
  private getPrimaryCategory(transactions: Transaction[]): string {
    if (transactions.length === 0) return 'None';
    
    const categoryTotals = new Map<string, number>();
    transactions.forEach(tx => {
      categoryTotals.set(tx.category, (categoryTotals.get(tx.category) || 0) + tx.amount);
    });

    let maxCategory = 'Other';
    let maxAmount = 0;
    
    for (const [category, amount] of categoryTotals) {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxCategory = category;
      }
    }

    return maxCategory;
  }
}
