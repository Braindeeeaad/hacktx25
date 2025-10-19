export interface Transaction {
  date: string;
  category: string;
  amount: number;
  // add where its from not use in gemini correlation analysis but to display in past transcations
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
          const transformedTransactions = this.transformPurchases(accountPurchases);
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

  async getMerchantbyMerchantId(merchant_id: string): Promise<string> {
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
      
      // Return the merchant name, fallback to merchant_id if name is not available
      return merchantData.name || merchantData.merchant_name || merchant_id;
    } catch (error) {
      console.error('Failed to fetch merchant:', error);
      // Return the merchant_id as fallback if API call fails
      return merchant_id;
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
}

export interface accountType {
    _id : string;
    balance : number;
    customer_id : string;
    nickname : string;
    rewards : number;
    type : string;
}

export interface purchaseType {
    _id: string;
    type: string;
    merchant_id: string;
    payer_id: string;
    purchase_date: string;
    amount: number;
    status: string;
    medium: string;
    description: string;
}
