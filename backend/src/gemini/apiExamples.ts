/**
 * Real-world API integration examples
 * Shows how to connect with popular financial APIs
 */

import { analyzeSpending, Transaction } from './index';

// Console and fetch declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

// ============================================================================
// EXAMPLE 1: PLAID API INTEGRATION
// ============================================================================

export class PlaidIntegration {
  private clientId: string;
  private secret: string;
  private accessToken: string;

  constructor(clientId: string, secret: string, accessToken: string) {
    this.clientId = clientId;
    this.secret = secret;
    this.accessToken = accessToken;
  }

  async fetchTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    const response = await fetch('https://production.plaid.com/transactions/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        secret: this.secret,
        access_token: this.accessToken,
        start_date: startDate,
        end_date: endDate,
        count: 500, // Max transactions to fetch
      })
    });

    const data = await response.json();
    
    return data.transactions.map((tx: any) => ({
      date: tx.date,
      category: tx.category?.[0] || 'Other', // Use first category
      amount: Math.abs(tx.amount) // Make positive
    }));
  }

  async analyzeSpending(startDate: string, endDate: string) {
    const transactions = await this.fetchTransactions(startDate, endDate);
    return await analyzeSpending(transactions);
  }
}

// ============================================================================
// EXAMPLE 2: YNAB API INTEGRATION
// ============================================================================

export class YNABIntegration {
  private apiKey: string;
  private budgetId: string;

  constructor(apiKey: string, budgetId: string) {
    this.apiKey = apiKey;
    this.budgetId = budgetId;
  }

  async fetchTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    const response = await fetch(
      `https://api.youneedabudget.com/v1/budgets/${this.budgetId}/transactions?since_date=${startDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      }
    );

    const data = await response.json();
    
    return data.data.transactions
      .filter((tx: any) => tx.date <= endDate && tx.amount < 0) // Only expenses
      .map((tx: any) => ({
        date: tx.date,
        category: tx.category_name || 'Uncategorized',
        amount: Math.abs(tx.amount / 1000) // Convert from milliunits
      }));
  }

  async analyzeSpending(startDate: string, endDate: string) {
    const transactions = await this.fetchTransactions(startDate, endDate);
    return await analyzeSpending(transactions);
  }
}

// ============================================================================
// EXAMPLE 3: MINT API INTEGRATION (if available)
// ============================================================================

export class MintIntegration {
  private sessionToken: string;

  constructor(sessionToken: string) {
    this.sessionToken = sessionToken;
  }

  async fetchTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    // Note: Mint doesn't have a public API, this is conceptual
    const response = await fetch('https://mint.intuit.com/api/transactions', {
      headers: {
        'Authorization': `Bearer ${this.sessionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        includePending: false
      })
    });

    const data = await response.json();
    
    return data.transactions.map((tx: any) => ({
      date: tx.date,
      category: tx.category,
      amount: Math.abs(tx.amount)
    }));
  }

  async analyzeSpending(startDate: string, endDate: string) {
    const transactions = await this.fetchTransactions(startDate, endDate);
    return await analyzeSpending(transactions);
  }
}

// ============================================================================
// EXAMPLE 4: CUSTOM BANK API INTEGRATION
// ============================================================================

export class BankAPIIntegration {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async fetchTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      // Add query parameters
      // Note: You might need to use URLSearchParams for GET requests
    });

    const data = await response.json();
    
    return data.transactions
      .filter((tx: any) => tx.date >= startDate && tx.date <= endDate)
      .map((tx: any) => ({
        date: tx.date,
        category: tx.category || 'Other',
        amount: Math.abs(tx.amount)
      }));
  }

  async analyzeSpending(startDate: string, endDate: string) {
    const transactions = await this.fetchTransactions(startDate, endDate);
    return await analyzeSpending(transactions);
  }
}

// ============================================================================
// EXAMPLE 5: CSV FILE INTEGRATION
// ============================================================================

export class CSVIntegration {
  async parseCSV(csvContent: string): Promise<Transaction[]> {
    const lines = csvContent.split('\n');
    const transactions: Transaction[] = [];

    for (let i = 1; i < lines.length; i++) { // Skip header
      const line = lines[i].trim();
      if (!line) continue;

      const [date, category, amount] = line.split(',');
      
      transactions.push({
        date: date.trim(),
        category: category.trim(),
        amount: parseFloat(amount.trim())
      });
    }

    return transactions;
  }

  async analyzeFromCSV(csvContent: string) {
    const transactions = await this.parseCSV(csvContent);
    return await analyzeSpending(transactions);
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

export async function runPlaidExample() {
  const plaid = new PlaidIntegration(
    'your-plaid-client-id',
    'your-plaid-secret',
    'your-access-token'
  );

  try {
    const analysis = await plaid.analyzeSpending('2025-09-01', '2025-10-01');
    console.log('Plaid Analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('Plaid analysis failed:', error);
    return null;
  }
}

export async function runYNABExample() {
  const ynab = new YNABIntegration(
    'your-ynab-api-key',
    'your-budget-id'
  );

  try {
    const analysis = await ynab.analyzeSpending('2025-09-01', '2025-10-01');
    console.log('YNAB Analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('YNAB analysis failed:', error);
    return null;
  }
}

export async function runCSVExample() {
  const csvIntegration = new CSVIntegration();
  
  const csvContent = `date,category,amount
2025-09-29,Food,21.75
2025-09-29,Transport,10.00
2025-09-30,Food,35.50`;

  try {
    const analysis = await csvIntegration.analyzeFromCSV(csvContent);
    console.log('CSV Analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('CSV analysis failed:', error);
    return null;
  }
}

// Export all integration classes
// All classes are already exported above
