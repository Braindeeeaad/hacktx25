import { Transaction, purchaseType } from "./api_types";

interface Merchant {
  _id: string;
  name: string;
  category: string;
  address: {
    street_number: string;
    street_name: string;
    city: string;
    state: string;
    zip: string;
  };
  geocode: {
    lat: number;
    lng: number;
  };
  creation_date: string;
}


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
      const accounts = await this.getAccounts();
      
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
          const transformedTransactions = await this.transformPurchases(accountPurchases);
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

  async getMerchantbyMerchantId(merchant_id: string): Promise<Merchant | null> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants/${merchant_id}?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      const merchantData = await response.json();
      return merchantData;
    } catch (error) {
      console.error('Failed to fetch merchant:', error);
      return null;
    }
  }

  /**
   * Transform Nessie API purchase format to our standard format
   */
  private async transformPurchases(nessiePurchases: any[]): Promise<Transaction[]> {
    const transformedPurchases = await Promise.all(
      nessiePurchases.map(async (purchase: any) => ({
        date: purchase.purchase_date, // Nessie uses YYYY-MM-DD format
        category: await this.mapPurchaseCategory(purchase.merchant_id),
        amount: Math.abs(purchase.amount), // Make positive for spending analysis
        product: purchase.description || 'Unknown Product'
      }))
    );
    
    return transformedPurchases;
  }

  /**
   * Map merchant ID to category by querying merchant API
   */
  private async mapPurchaseCategory(merchant_id: string): Promise<string> {
    try {
      const merchant = await this.getMerchantbyMerchantId(merchant_id);
      
      if (merchant && merchant.category) {
        return merchant.category;
      }
      
      // Fallback to 'Other' if merchant data is not available
      return 'Other';
    } catch (error) {
      console.error('Failed to map purchase category:', error);
      return 'Other';
    }
  }

  /**
   * Analyze spending for a specific date range
   */
  /* async analyzeSpending(startDate: string, endDate: string) {
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
  } */

  /**
   * Analyze spending for the last N days
   */
  /* async analyzeRecentDays(days: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.analyzeSpending(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  } */

  /**
   * Analyze spending for the current month
   */
  /* async analyzeCurrentMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.analyzeSpending(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
  } */

  /**
   * Fetch all purchases from all accounts and calculate the total sum
   */
  async getsum(startDate?: string, endDate?: string): Promise<number> {
    try {
      // First, get all accounts
      const accounts = await this.getAccounts();
      
      if (!accounts || accounts.length === 0) {
        console.warn('No accounts found for customer');
        return 0;
      }

      let totalSum = 0;
      
      // Fetch purchases from all accounts and sum them up
      for (const account of accounts) {
        try {
          const accountPurchases = await this.getAccountPurchases(
            account._id, 
            startDate, 
            endDate
          );
          
          // Sum up the amounts from this account's purchases
          const accountSum = accountPurchases.reduce((sum: number, purchase: purchaseType) => {
            return sum + (purchase.amount || 0);
          }, 0);
          
          totalSum += accountSum;
        } catch (error) {
          console.warn(`Failed to fetch purchases for account ${account._id}:`, error);
          // Continue with other accounts
        }
      }

      return totalSum;
    } catch (error) {
      console.error('Failed to calculate total sum of purchases:', error);
      throw error;
    }
  }
}


