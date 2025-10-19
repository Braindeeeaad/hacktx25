/**
 * Test Runner for AI Spending Analysis Module
 * Run this to test the module with local data and Nessie API integration
 */

import { analyzeSpending } from './analyzeSpending';
import { NessieAPIIntegration } from './nessieIntegration';
import { TestDataGenerator, LocalTestingSuite, runQuickTest } from './localTesting';

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const process: {
  argv: string[];
};

declare const require: {
  main: any;
};

declare const module: {
  exports: any;
};

/**
 * Main test runner
 */
export class TestRunner {
  /**
   * Test with your own custom dataset
   */
  static async testWithCustomData() {
    console.log('🎯 Testing with Custom Dataset');
    console.log('=' .repeat(40));
    
    // Your custom transaction data
    const customTransactions = [
      { "date": "2025-09-29", "category": "Food", "amount": 27.75 },
      { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
      { "date": "2025-09-30", "category": "Food", "amount": 35.50 },
      { "date": "2025-09-30", "category": "Entertainment", "amount": 25.00 },
      { "date": "2025-10-01", "category": "Food", "amount": 28.25 },
      { "date": "2025-10-01", "category": "Transport", "amount": 15.00 },
      { "date": "2025-10-02", "category": "Shopping", "amount": 120.00 },
      { "date": "2025-10-02", "category": "Food", "amount": 42.00 },
      { "date": "2025-10-03", "category": "Shopping", "amount": 500.00 }, // Anomaly
      { "date": "2025-10-03", "category": "Food", "amount": 18.50 },
      { "date": "2025-10-04", "category": "Transport", "amount": 12.00 },
      { "date": "2025-10-04", "category": "Entertainment", "amount": 45.00 },
      { "date": "2025-10-05", "category": "Food", "amount": 38.75 },
      { "date": "2025-10-05", "category": "Utilities", "amount": 85.00 },
      { "date": "2025-10-06", "category": "Food", "amount": 31.25 },
      { "date": "2025-10-06", "category": "Transport", "amount": 8.50 },
      { "date": "2025-10-07", "category": "Entertainment", "amount": 60.00 },
      { "date": "2025-10-07", "category": "Food", "amount": 29.00 },
      { "date": "2025-10-08", "category": "Shopping", "amount": 75.00 },
      { "date": "2025-10-08", "category": "Food", "amount": 33.50 },
      { "date": "2025-10-09", "category": "Transport", "amount": 18.00 },
      { "date": "2025-10-09", "category": "Utilities", "amount": 95.00 },
      { "date": "2025-10-10", "category": "Rent", "amount": 950.00 },
      { "date": "2025-10-10", "category": "Food", "amount": 26.75 },
      { "date": "2025-10-11", "category": "Food", "amount": 44.00 },
      { "date": "2025-10-11", "category": "Entertainment", "amount": 35.00 },
      { "date": "2025-10-12", "category": "Shopping", "amount": 150.00 },
      { "date": "2025-10-12", "category": "Food", "amount": 37.25 },
      { "date": "2025-10-13", "category": "Transport", "amount": 22.00 },
      { "date": "2025-10-13", "category": "Food", "amount": 41.50 },
      { "date": "2025-10-14", "category": "Entertainment", "amount": 80.00 },
      { "date": "2025-10-14", "category": "Food", "amount": 32.00 }
    ];
    
    try {
      console.log(`📊 Analyzing ${customTransactions.length} custom transactions...`);
      
      const analysis = await analyzeSpending(customTransactions);
      
      console.log('\n📈 Analysis Results:');
      console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
      console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
      console.log(`📊 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);
      
      console.log('\n📊 Category Analysis:');
      analysis.categories.forEach(category => {
        console.log(`  ${category.category}: ${category.trend} (${category.change}) - ${category.detailedAnalysis}`);
      });
      
      if (analysis.anomalies.length > 0) {
        console.log('\n⚠️  Anomalies Detected:');
        analysis.anomalies.forEach(anomaly => {
          console.log(`  ${anomaly.date} - ${anomaly.category}: $${anomaly.amount} (${anomaly.detailedReason})`);
        });
      }
      
      console.log('\n💡 Recommendations:');
      analysis.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
      
      return analysis;
    } catch (error) {
      console.error('❌ Custom data analysis failed:', error);
      return null;
    }
  }

  /**
   * Test with generated realistic data
   */
  static async testWithGeneratedData() {
    console.log('\n🎲 Testing with Generated Realistic Data');
    console.log('=' .repeat(40));
    
    const transactions = TestDataGenerator.generateTransactions(
      '2025-09-01', 
      '2025-09-30', 
      100
    );
    
    try {
      const analysis = await analyzeSpending(transactions);
      
      console.log(`📊 Generated ${transactions.length} realistic transactions`);
      console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
      console.log(`📈 Categories: ${analysis.categories.length}`);
      console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Generated data analysis failed:', error);
      return null;
    }
  }

  /**
   * Test Nessie API integration (requires real API key)
   */
  static async testNessieAPI() {
    console.log('\n🏦 Testing Nessie API Integration');
    console.log('=' .repeat(40));
    
    // Using your actual Nessie API credentials
    const nessie = new NessieAPIIntegration(
      '2535e8ec7de75e2bb33a7e0bab0cc897',        // Your actual API key
      '68f4080c9683f20dd519f005',           // Your actual customer ID
      'http://api.nessieisreal.com' // Base URL
    );
    
    try {
      console.log('🔍 Fetching data from Nessie API...');
      
      // Test with last 30 days
      const analysis = await nessie.analyzeRecentDays(30);
      
      console.log('✅ Nessie API analysis completed');
      console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
      console.log(`📊 Transactions: ${analysis.metadata.transactionCount}`);
      console.log(`📈 Categories: ${analysis.categories.length}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Nessie API test failed:', error);
      console.log('💡 Make sure to set your Nessie API credentials in the test');
      return null;
    }
  }

  /**
   * Run comprehensive test suite
   */
  static async runComprehensiveTests() {
    console.log('🚀 Starting Comprehensive Test Suite');
    console.log('=' .repeat(60));
    
    const results = {
      customData: await this.testWithCustomData(),
      generatedData: await this.testWithGeneratedData(),
      nessieAPI: await this.testNessieAPI(),
      localTests: await LocalTestingSuite.runAllTests()
    };
    
    console.log('\n📊 Comprehensive Test Results');
    console.log('=' .repeat(60));
    console.log(`✅ Custom Data Test: ${results.customData ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Generated Data Test: ${results.generatedData ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Nessie API Test: ${results.nessieAPI ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Local Test Suite: ${results.localTests ? 'PASSED' : 'FAILED'}`);
    
    return results;
  }

  /**
   * Quick test for development
   */
  static async runQuickTest() {
    console.log('⚡ Quick Test for Development');
    console.log('=' .repeat(40));
    
    return await runQuickTest();
  }
}

/**
 * Command line interface for testing
 */
export async function runTests() {
  const args = process.argv.slice(2);
  const command = args[0] || 'quick';
  
  switch (command) {
    case 'quick':
      await TestRunner.runQuickTest();
      break;
    case 'custom':
      await TestRunner.testWithCustomData();
      break;
    case 'generated':
      await TestRunner.testWithGeneratedData();
      break;
    case 'nessie':
      await TestRunner.testNessieAPI();
      break;
    case 'comprehensive':
      await TestRunner.runComprehensiveTests();
      break;
    case 'local':
      await LocalTestingSuite.runAllTests();
      break;
    default:
      console.log('Available test commands:');
      console.log('  quick         - Quick test with small dataset');
      console.log('  custom        - Test with custom dataset');
      console.log('  generated     - Test with generated realistic data');
      console.log('  nessie        - Test Nessie API integration');
      console.log('  comprehensive - Run all tests');
      console.log('  local         - Run local test suite');
      console.log('\nUsage: npx ts-node src/ai/gemini/testRunner.ts [command]');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}
