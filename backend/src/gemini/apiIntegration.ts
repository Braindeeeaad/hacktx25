/**
 * API Integration Example for AI Spending Analysis
 * This shows how to connect the analysis module with real API data
 */

import { analyzeSpending, Transaction } from './index';

// Console and fetch declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

// Example API service for fetching transaction data
class TransactionAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Fetch transactions from your API
   * Replace this with your actual API endpoint
   */
  async fetchTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions?start=${startDate}&end=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      // Transform API data to our format
      return data.transactions.map((tx: any) => ({
        date: tx.date, // Ensure it's in YYYY-MM-DD format
        category: tx.category,
        amount: parseFloat(tx.amount) // Ensure it's a number
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }

  /**
   * Fetch transactions for the last N days
   */
  async fetchRecentTransactions(days: number): Promise<Transaction[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.fetchTransactions(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }
}

/**
 * Complete analysis workflow with API integration
 */
export class SpendingAnalysisService {
  private api: TransactionAPI;

  constructor(apiBaseUrl: string, apiKey: string) {
    this.api = new TransactionAPI(apiBaseUrl, apiKey);
  }

  /**
   * Analyze spending for a specific date range
   */
  async analyzeDateRange(startDate: string, endDate: string) {
    console.log(`📊 Fetching transactions from ${startDate} to ${endDate}...`);
    
    try {
      // 1. Fetch data from API
      const transactions = await this.api.fetchTransactions(startDate, endDate);
      
      if (transactions.length === 0) {
        throw new Error('No transactions found for the specified date range');
      }

      console.log(`📈 Found ${transactions.length} transactions`);

      // 2. Run AI analysis
      const analysis = await analyzeSpending(transactions);
      
      // 3. Return enriched results
      return {
        ...analysis,
        metadata: {
          dateRange: { startDate, endDate },
          transactionCount: transactions.length,
          analyzedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Analysis failed:', error);
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

    return this.analyzeDateRange(
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

    return this.analyzeDateRange(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  }
}

/**
 * Example usage with different API providers
 */

// Example 1: Custom API
export function createCustomAPIService() {
  return new SpendingAnalysisService(
    'https://your-api.com/api/v1',
    'your-api-key'
  );
}

// Example 2: Plaid API (if you're using Plaid)
export function createPlaidService() {
  return new SpendingAnalysisService(
    'https://production.plaid.com',
    'your-plaid-access-token'
  );
}

// Example 3: Mock API for testing
export function createMockService() {
  return new SpendingAnalysisService(
    'https://mock-api.com',
    'mock-key'
  );
}

/**
 * Usage examples
 */
export async function runAnalysisExamples() {
  // Example 1: Analyze last 30 days
  const service = createCustomAPIService();
  
  try {
    console.log('🔍 Analyzing last 30 days...');
    const analysis = await service.analyzeRecentDays(30);
    
    console.log('📊 Results:');
    console.log(`Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`Categories: ${analysis.categories.length}`);
    console.log(`Anomalies: ${analysis.anomalies.length}`);
    console.log(`Recommendations: ${analysis.recommendations.length}`);
    
    return analysis;
  } catch (error) {
    console.error('Analysis failed:', error);
    return null;
  }
}

// Export for use in other modules
// All classes are already exported above
