/**
 * Local Testing Setup for AI Spending Analysis
 * This allows you to test the module with your own dataset without needing real API calls
 */

import { analyzeSpending, Transaction } from './index';

// Console declaration for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};
import { NessieAPIIntegration } from './nessieIntegration';

/**
 * Generate realistic test data for different scenarios
 */
export class TestDataGenerator {
  /**
   * Generate sample transactions for a specific time period
   */
  static generateTransactions(
    startDate: string, 
    endDate: string, 
    transactionCount: number = 50
  ): Transaction[] {
    const transactions: Transaction[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const categories = [
      'Food', 'Transport', 'Entertainment', 'Shopping', 
      'Utilities', 'Healthcare', 'Travel', 'Education'
    ];

    const categoryPatterns = {
      'Food': { min: 5, max: 50, frequency: 0.3 },
      'Transport': { min: 2, max: 25, frequency: 0.2 },
      'Entertainment': { min: 10, max: 100, frequency: 0.15 },
      'Shopping': { min: 20, max: 200, frequency: 0.1 },
      'Utilities': { min: 50, max: 150, frequency: 0.05 },
      'Healthcare': { min: 15, max: 300, frequency: 0.05 },
      'Travel': { min: 100, max: 500, frequency: 0.02 },
      'Education': { min: 30, max: 200, frequency: 0.03 }
    };

    for (let i = 0; i < transactionCount; i++) {
      const randomDay = Math.floor(Math.random() * daysDiff);
      const transactionDate = new Date(start);
      transactionDate.setDate(transactionDate.getDate() + randomDay);

      // Select category based on frequency
      const category = this.selectCategoryByFrequency(categories, categoryPatterns);
      const pattern = categoryPatterns[category as keyof typeof categoryPatterns];
      
      const amount = this.generateAmount(pattern.min, pattern.max);
      
      transactions.push({
        date: transactionDate.toISOString().split('T')[0],
        category,
        amount
      });
    }

    // Sort by date
    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Generate transactions with specific patterns for testing
   */
  static generatePatternedTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    const baseDate = new Date('2025-09-01');

    // Pattern 1: Increasing food spending over time
    for (let i = 0; i < 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      transactions.push({
        date: date.toISOString().split('T')[0],
        category: 'Food',
        amount: 20 + (i * 0.5) + Math.random() * 10 // Gradually increasing
      });
    }

    // Pattern 2: Sporadic large shopping purchases
    const shoppingDates = [5, 12, 18, 25];
    shoppingDates.forEach(dayOffset => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);
      
      transactions.push({
        date: date.toISOString().split('T')[0],
        category: 'Shopping',
        amount: 150 + Math.random() * 200 // Large purchases
      });
    });

    // Pattern 3: Regular transport expenses
    for (let i = 0; i < 30; i += 2) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      transactions.push({
        date: date.toISOString().split('T')[0],
        category: 'Transport',
        amount: 8 + Math.random() * 15
      });
    }

    // Pattern 4: Monthly utilities
    transactions.push({
      date: '2025-09-01',
      category: 'Utilities',
      amount: 120
    });

    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Generate transactions with anomalies for testing
   */
  static generateAnomalyTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    const baseDate = new Date('2025-09-01');

    // Normal transactions
    for (let i = 0; i < 25; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      transactions.push({
        date: date.toISOString().split('T')[0],
        category: 'Food',
        amount: 25 + Math.random() * 15 // Normal range
      });
    }

    // Anomaly 1: Extremely large purchase
    transactions.push({
      date: '2025-09-15',
      category: 'Shopping',
      amount: 1500 // This should be detected as an anomaly
    });

    // Anomaly 2: Unusually high food spending
    transactions.push({
      date: '2025-09-20',
      category: 'Food',
      amount: 200 // Much higher than normal
    });

    return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private static selectCategoryByFrequency(
    categories: string[], 
    patterns: Record<string, { frequency: number }>
  ): string {
    const random = Math.random();
    let cumulative = 0;
    
    for (const category of categories) {
      cumulative += patterns[category]?.frequency || 0;
      if (random <= cumulative) {
        return category;
      }
    }
    
    return categories[0]; // Fallback
  }

  private static generateAmount(min: number, max: number): number {
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
  }
}

/**
 * Local testing scenarios
 */
export class LocalTestingSuite {
  /**
   * Test 1: Basic functionality with generated data
   */
  static async testBasicAnalysis() {
    console.log('🧪 Test 1: Basic Analysis with Generated Data');
    console.log('=' .repeat(50));
    
    const transactions = TestDataGenerator.generateTransactions(
      '2025-09-01', 
      '2025-09-30', 
      100
    );
    
    try {
      const analysis = await analyzeSpending(transactions);
      
      console.log('✅ Basic analysis completed successfully');
      console.log(`📊 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
      console.log(`📈 Categories: ${analysis.categories.length}`);
      console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
      console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Basic analysis failed:', error);
      return null;
    }
  }

  /**
   * Test 2: Pattern detection with structured data
   */
  static async testPatternDetection() {
    console.log('\n🧪 Test 2: Pattern Detection');
    console.log('=' .repeat(50));
    
    const transactions = TestDataGenerator.generatePatternedTransactions();
    
    try {
      const analysis = await analyzeSpending(transactions);
      
      console.log('✅ Pattern detection completed');
      console.log('📊 Category Trends:');
      analysis.categories.forEach(cat => {
        console.log(`  ${cat.category}: ${cat.trend} (${cat.change}) - ${cat.note}`);
      });
      
      return analysis;
    } catch (error) {
      console.error('❌ Pattern detection failed:', error);
      return null;
    }
  }

  /**
   * Test 3: Anomaly detection
   */
  static async testAnomalyDetection() {
    console.log('\n🧪 Test 3: Anomaly Detection');
    console.log('=' .repeat(50));
    
    const transactions = TestDataGenerator.generateAnomalyTransactions();
    
    try {
      const analysis = await analyzeSpending(transactions);
      
      console.log('✅ Anomaly detection completed');
      console.log(`⚠️  Anomalies Found: ${analysis.anomalies.length}`);
      analysis.anomalies.forEach(anomaly => {
        console.log(`  ${anomaly.date} - ${anomaly.category}: $${anomaly.amount} (${anomaly.reason})`);
      });
      
      return analysis;
    } catch (error) {
      console.error('❌ Anomaly detection failed:', error);
      return null;
    }
  }

  /**
   * Test 4: Nessie API integration (mock)
   */
  static async testNessieIntegration() {
    console.log('\n🧪 Test 4: Nessie API Integration (Mock)');
    console.log('=' .repeat(50));
    
    // Mock Nessie integration with local data
    const mockNessie = {
      getAllTransactions: async () => {
        return TestDataGenerator.generateTransactions('2025-09-01', '2025-09-30', 75);
      }
    };
    
    try {
      const transactions = await mockNessie.getAllTransactions();
      const analysis = await analyzeSpending(transactions);
      
      console.log('✅ Nessie integration test completed');
      console.log(`📊 Transactions: ${transactions.length}`);
      console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Nessie integration test failed:', error);
      return null;
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Local Testing Suite');
    console.log('=' .repeat(60));
    
    const results = {
      basic: await this.testBasicAnalysis(),
      patterns: await this.testPatternDetection(),
      anomalies: await this.testAnomalyDetection(),
      nessie: await this.testNessieIntegration()
    };
    
    console.log('\n📊 Test Results Summary');
    console.log('=' .repeat(60));
    console.log(`✅ Basic Analysis: ${results.basic ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Pattern Detection: ${results.patterns ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Anomaly Detection: ${results.anomalies ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Nessie Integration: ${results.nessie ? 'PASSED' : 'FAILED'}`);
    
    return results;
  }
}

/**
 * Quick test runner
 */
export async function runQuickTest() {
  console.log('🔬 Quick Local Test');
  console.log('=' .repeat(30));
  
  // Generate a small dataset
  const transactions = TestDataGenerator.generateTransactions(
    '2025-09-01', 
    '2025-09-15', 
    25
  );
  
  console.log(`📊 Generated ${transactions.length} test transactions`);
  console.log('Sample transactions:');
  transactions.slice(0, 5).forEach(tx => {
    console.log(`  ${tx.date} - ${tx.category}: $${tx.amount}`);
  });
  
  try {
    const analysis = await analyzeSpending(transactions);
    console.log('\n✅ Analysis completed successfully!');
    console.log(`💰 Total: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`📈 Categories: ${analysis.categories.length}`);
    console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
    
    return analysis;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
}

// Export for use in other modules
// All classes are already exported above
