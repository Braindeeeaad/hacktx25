import { NessieAPIIntegration } from '@/api_hooks/nessie_api';
import { GeminiIntegration } from '@/api_hooks/gemini_api';
import { fetchUserWellbeingData } from '@/api_hooks/wellbeing_db_api';
import { 
  purchaseType, 
  accountType, 
  WellbeingData, 
  FinanceScore, 
  AnalysisResult, 
  wellnessTip,
  Transaction 
} from '@/api_hooks/api_types';

export class DataService {
  private nessie: NessieAPIIntegration;
  private gemini: GeminiIntegration;

  constructor() {
    this.nessie = new NessieAPIIntegration(
      '2535e8ec7de75e2bb33a7e0bab0cc897',
      '68f4a25a9683f20dd51a206a',
      'http://api.nessieisreal.com'
    );
    this.gemini = new GeminiIntegration();
  }

  // Fetch financial data (accounts, purchases, merchant names)
  async fetchFinancialData(): Promise<{
    purchases: purchaseType[];
    merchantNames: {[key: string]: string};
    account: accountType | null;
  }> {
    try {
      console.log("Fetching financial data...");
      
      // Get accounts
      const accounts: accountType[] = await this.nessie.getAccounts();
      console.log("Accounts fetched:", accounts.length);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const firstAccount = accounts[0];
      console.log("Using account:", firstAccount._id);

      // Get purchases for the account
      const purchases = await this.nessie.getAccountPurchases(firstAccount._id);
      console.log("Purchases fetched:", purchases.length);

      // Fetch merchant names
      const merchantNames = await this.fetchMerchantNames(purchases);
      console.log("Merchant names fetched:", Object.keys(merchantNames).length);

      return {
        purchases,
        merchantNames,
        account: firstAccount
      };
    } catch (error) {
      console.error("Error fetching financial data:", error);
      throw error;
    }
  }

  // Fetch merchant names for purchases
  private async fetchMerchantNames(purchases: purchaseType[]): Promise<{[key: string]: string}> {
    const merchantNamesMap: {[key: string]: string} = {};
    
    // Get unique merchant IDs
    const uniqueMerchantIds = [...new Set(purchases.map(p => p.merchant_id))];
    
    // Fetch merchant names for each unique merchant ID
    for (const merchantId of uniqueMerchantIds) {
      try {
        const merchant = await this.nessie.getMerchantbyMerchantId(merchantId);
        const merchantName = merchant?.name || merchantId;
        merchantNamesMap[merchantId] = merchantName;
      } catch (error) {
        console.error(`Failed to fetch merchant name for ${merchantId}:`, error);
        merchantNamesMap[merchantId] = merchantId; // Fallback to merchant ID
      }
    }
    
    return merchantNamesMap;
  }

  // Fetch wellbeing data
  async fetchWellbeingData(email: string): Promise<WellbeingData[]> {
    try {
      console.log("Fetching wellbeing data for:", email);
      const data = await fetchUserWellbeingData(email);
      console.log("Wellbeing data fetched:", data.length);
      return data;
    } catch (error) {
      console.error("Error fetching wellbeing data:", error);
      throw error;
    }
  }

  // Transform purchase data to Transaction format for Gemini
  private transformPurchasesToTransactions(purchases: purchaseType[]): Transaction[] {
    return purchases.map((purchase) => ({
      date: purchase.purchase_date,
      category: this.mapPurchaseCategory(purchase.description),
      amount: Math.abs(purchase.amount), // Make positive for spending analysis
      product: purchase.description || 'Unknown Product'
    }));
  }

  // Map purchase descriptions to categories
  private mapPurchaseCategory(description: string): string {
    if (!description || typeof description !== 'string') {
      return 'Other';
    }
    
    const desc = description.toLowerCase().trim();
    
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

  // Generate finance score using Gemini
  async generateFinanceScore(purchases: purchaseType[]): Promise<FinanceScore> {
    try {
      console.log('Generating finance score with Gemini API...');
      
      const transactions = this.transformPurchasesToTransactions(purchases);
      console.log(`Transformed ${transactions.length} purchases to transactions`);
      
      const financeScore = await this.gemini.generateFinanceScore(transactions);
      console.log('Finance score generated:', financeScore);
      
      return financeScore;
    } catch (error) {
      console.error('Error generating finance score:', error);
      throw error;
    }
  }

  // Analyze spending using Gemini
  async analyzeSpending(purchases: purchaseType[]): Promise<AnalysisResult> {
    try {
      console.log('Generating spending analysis with Gemini API...');
      
      const transactions = this.transformPurchasesToTransactions(purchases);
      console.log(`Transformed ${transactions.length} purchases to transactions for analysis`);
      
      const analysis = await this.gemini.analyzeSpending(transactions);
      console.log('Spending analysis generated');
      
      return analysis;
    } catch (error) {
      console.error('Error generating spending analysis:', error);
      throw error;
    }
  }

  // Analyze wellness using Gemini
  async analyzeWellness(wellbeingData: WellbeingData[]): Promise<wellnessTip[]> {
    try {
      console.log('Generating wellness analysis with Gemini API...');
      
      const wellnessAnalysis = await this.gemini.analyzeWellness(wellbeingData);
      console.log('Wellness analysis generated:', wellnessAnalysis.length);
      
      return wellnessAnalysis;
    } catch (error) {
      console.error('Error generating wellness analysis:', error);
      throw error;
    }
  }

  // Get total purchases sum (for home page display)
  async getTotalPurchases(): Promise<number> {
    try {
      return await this.nessie.getsum();
    } catch (error) {
      console.error('Error getting total purchases:', error);
      throw error;
    }
  }
}
