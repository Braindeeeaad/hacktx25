/**
 * Capital One Nessie API Integration
 * Documentation: http://api.nessieisreal.com/documentation
 */

import { analyzeSpending, Transaction } from './index';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Console and fetch declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

export class NessieAPIIntegration {
  private apiKey: string;
  private baseUrl: string;
  private customerId: string;

  constructor(apiKey: string, customerId: string, baseUrl: string = 'http://api.nessieisreal.com') {
    this.apiKey = apiKey;
    this.customerId = customerId;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all accounts for the customer
   */
  async getAccounts() {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${this.customerId}/accounts?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  }

  /**
   * Fetch purchases for a specific account
   */
  async getAccountPurchases(accountId: string, startDate?: string, endDate?: string) {
    try {
      let url = `${this.baseUrl}/accounts/${accountId}/purchases`;
      
      // Add date filters if provided
      if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}&key=${this.apiKey}`;
      } else {
        url += `?key=${this.apiKey}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      throw error;
    }
  }

  /**
   * Fetch all transactions for the customer across all accounts
   */
  async getAllTransactions(startDate?: string, endDate?: string): Promise<Transaction[]> {
    try {
      // First, get all accounts
      const accountsResponse = await this.getAccounts();
      const accounts = Array.isArray(accountsResponse) ? accountsResponse : [];
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found for customer');
      }

      // Fetch transactions from all accounts
      const allTransactions: Transaction[] = [];
      
      for (const account of accounts) {
        try {
          const accountPurchases = await this.getAccountPurchases(
            account._id, 
            startDate, 
            endDate
          );
          
          // Transform Nessie purchase format to our format
          const purchases = Array.isArray(accountPurchases) ? accountPurchases : [];
          const transformedTransactions = this.transformPurchases(purchases);
          allTransactions.push(...transformedTransactions);
        } catch (error) {
          console.warn(`Failed to fetch transactions for account ${account._id}:`, error);
          // Continue with other accounts
        }
      }

      return allTransactions;
    } catch (error) {
      console.error('Failed to fetch all transactions:', error);
      throw error;
    }
  }

  /**
   * Transform Nessie API purchase format to our standard format
   */
  private transformPurchases(nessiePurchases: any[]): Transaction[] {
    return nessiePurchases.map((purchase: any) => ({
      date: purchase.purchase_date, // Nessie uses YYYY-MM-DD format
      category: this.mapPurchaseCategory(purchase.description),
      amount: Math.abs(purchase.amount) // Make positive for spending analysis
    }));
  }

  /**
   * Map purchase descriptions to our standard categories
   */
  private mapPurchaseCategory(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('takeout') || desc.includes('restaurant') || desc.includes('food')) {
      return 'Food';
    } else if (desc.includes('grocery') || desc.includes('grocery')) {
      return 'Food';
    } else if (desc.includes('gas') || desc.includes('fuel')) {
      return 'Transport';
    } else if (desc.includes('shopping') || desc.includes('store')) {
      return 'Shopping';
    } else if (desc.includes('coffee') || desc.includes('cafe')) {
      return 'Food';
    } else if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game')) {
      return 'Entertainment';
    } else {
      return 'Other';
    }
  }

  /**
   * Analyze spending for a specific date range
   */
  async analyzeSpending(startDate: string, endDate: string) {
    try {
      console.log(`🔍 Fetching transactions from Nessie API (${startDate} to ${endDate})...`);
      
      const transactions = await this.getAllTransactions(startDate, endDate);
      
      if (transactions.length === 0) {
        throw new Error('No transactions found for the specified date range');
      }

      console.log(`📊 Found ${transactions.length} transactions from Nessie API`);

      // Run AI analysis
      const analysis = await analyzeSpending(transactions);
      
      // Add Nessie-specific metadata
      return {
        ...analysis,
        metadata: {
          source: 'Nessie API',
          dateRange: { startDate, endDate },
          transactionCount: transactions.length,
          analyzedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Nessie analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze spending for the last N days
   */
  async analyzeRecentDays(days: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.analyzeSpending(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }

  /**
   * Analyze spending for the current month
   */
  async analyzeCurrentMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.analyzeSpending(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }
}

/**
 * Usage example with Nessie API
 */
export async function runNessieExample() {
  // Initialize Nessie integration
  const nessie = new NessieAPIIntegration(
    '2535e8ec7de75e2bb33a7e0bab0cc897',        // Your actual API key
    '68f4080c9683f20dd519f005',           // Your actual customer ID
    'http://api.nessieisreal.com' // Base URL
  );

  try {
    console.log('🚀 Starting Nessie API analysis...');
    
    // Analyze last 30 days
    const analysis = await nessie.analyzeRecentDays(30);
    
    console.log('📈 Nessie Analysis Results:');
    console.log(`Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`Categories: ${analysis.categories.length}`);
    console.log(`Anomalies: ${analysis.anomalies.length}`);
    console.log(`Recommendations: ${analysis.recommendations.length}`);
    
    return analysis;
  } catch (error) {
    console.error('Nessie analysis failed:', error);
    return null;
  }
}

// Export for use in other modules
// NessieAPIIntegration is already exported above
