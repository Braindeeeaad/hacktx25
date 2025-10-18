/**
 * Nessie API Setup Test Script
 * This helps you test your Nessie API integration step by step
 */

import { NessieAPIIntegration } from './nessieIntegration';

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const process: {
  argv: string[];
};

/**
 * Test Nessie API connection and data fetching
 */
async function testNessieConnection() {
  console.log('🏦 Testing Nessie API Connection');
  console.log('='.repeat(50));
  
  // TODO: Replace with your actual credentials
  const nessie = new NessieAPIIntegration(
    'your-nessie-api-key',        // Replace with your API key
    'your-customer-id',            // Replace with your customer ID
    'http://api.nessieisreal.com'  // Base URL
  );
  
  try {
    console.log('1. Testing API connection...');
    
    // Test fetching accounts
    const accounts = await nessie.getAccounts();
    console.log(`✅ Connection successful! Found ${accounts.length} accounts`);
    
    if (accounts.length > 0) {
      console.log('📊 Account details:');
      accounts.forEach((account: any, index: number) => {
        console.log(`   ${index + 1}. ${account.nickname || 'Unnamed Account'} (${account.type})`);
        console.log(`      Balance: $${account.balance || 0}`);
        console.log(`      ID: ${account._id}`);
      });
    } else {
      console.log('⚠️  No accounts found. You may need to create accounts first.');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check your API key is correct');
    console.log('   2. Verify your customer ID exists');
    console.log('   3. Ensure you have API access');
    console.log('   4. Check the Nessie API documentation');
    return false;
  }
}

/**
 * Test fetching transactions from Nessie
 */
async function testNessieTransactions() {
  console.log('\n📊 Testing Transaction Fetching');
  console.log('='.repeat(50));
  
  const nessie = new NessieAPIIntegration(
    'your-nessie-api-key',        // Replace with your API key
    'your-customer-id',            // Replace with your customer ID
    'http://api.nessieisreal.com'  // Base URL
  );
  
  try {
    console.log('1. Fetching transactions for last 30 days...');
    
    const transactions = await nessie.getAllTransactions();
    console.log(`✅ Found ${transactions.length} transactions`);
    
    if (transactions.length > 0) {
      console.log('\n📈 Sample transactions:');
      transactions.slice(0, 5).forEach((tx: any, index: number) => {
        console.log(`   ${index + 1}. ${tx.date} - ${tx.category}: $${tx.amount}`);
      });
      
      if (transactions.length > 5) {
        console.log(`   ... and ${transactions.length - 5} more transactions`);
      }
    } else {
      console.log('⚠️  No transactions found. You may need to create test transactions.');
      console.log('   See the Nessie API documentation for creating test data.');
    }
    
    return transactions;
    
  } catch (error) {
    console.error('❌ Transaction fetching failed:', error);
    return [];
  }
}

/**
 * Test full AI analysis with Nessie data
 */
async function testNessieAnalysis() {
  console.log('\n🤖 Testing AI Analysis with Nessie Data');
  console.log('='.repeat(50));
  
  const nessie = new NessieAPIIntegration(
    'your-nessie-api-key',        // Replace with your API key
    'your-customer-id',            // Replace with your customer ID
    'http://api.nessieisreal.com'  // Base URL
  );
  
  try {
    console.log('1. Running AI analysis on Nessie data...');
    
    const analysis = await nessie.analyzeRecentDays(30);
    
    console.log('✅ AI Analysis completed successfully!');
    console.log('\n📊 Analysis Results:');
    console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
    console.log(`📈 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);
    console.log(`📊 Categories: ${analysis.categories.length}`);
    console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
    console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
    
    console.log('\n📈 Category Trends:');
    analysis.categories.forEach((cat: any) => {
      console.log(`   ${cat.category}: ${cat.trend} (${cat.change})`);
    });
    
    if (analysis.anomalies.length > 0) {
      console.log('\n⚠️  Anomalies Detected:');
      analysis.anomalies.forEach((anomaly: any) => {
        console.log(`   ${anomaly.date} - ${anomaly.category}: $${anomaly.amount}`);
      });
    }
    
    console.log('\n💡 AI Recommendations:');
    analysis.recommendations.forEach((rec: string, index: number) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    return analysis;
    
  } catch (error) {
    console.error('❌ AI analysis failed:', error);
    return null;
  }
}

/**
 * Create test data in Nessie (if you have API access)
 */
async function createTestData() {
  console.log('\n🔧 Creating Test Data in Nessie');
  console.log('='.repeat(50));
  
  console.log('📝 To create test data in Nessie, you can:');
  console.log('   1. Use the Nessie API documentation');
  console.log('   2. Use the sample customers provided by Nessie');
  console.log('   3. Create your own customers and accounts');
  
  console.log('\n🌐 Useful Nessie API endpoints:');
  console.log('   • GET /customers - List all customers');
  console.log('   • POST /customers - Create a new customer');
  console.log('   • GET /customers/{id}/accounts - List customer accounts');
  console.log('   • POST /customers/{id}/accounts - Create a new account');
  console.log('   • GET /accounts/{id}/transactions - List account transactions');
  console.log('   • POST /accounts/{id}/transactions - Create a new transaction');
  
  console.log('\n📚 Documentation: http://api.nessieisreal.com/documentation');
}

/**
 * Main setup test function
 */
async function runNessieSetupTest() {
  console.log('🚀 Nessie API Setup Test');
  console.log('='.repeat(60));
  console.log('This will test your Nessie API integration step by step\n');
  
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  switch (testType) {
    case 'connection':
      await testNessieConnection();
      break;
    case 'transactions':
      await testNessieTransactions();
      break;
    case 'analysis':
      await testNessieAnalysis();
      break;
    case 'data':
      await createTestData();
      break;
    case 'all':
    default:
      console.log('Running all tests...\n');
      
      const connectionOk = await testNessieConnection();
      if (connectionOk) {
        await testNessieTransactions();
        await testNessieAnalysis();
      } else {
        console.log('\n❌ Skipping further tests due to connection failure');
        console.log('Please fix your API credentials and try again');
      }
      
      await createTestData();
      break;
  }
  
  console.log('\n🎯 Setup Test Complete!');
  console.log('='.repeat(60));
}

// Run the test if this file is executed directly
if (require.main === module) {
  runNessieSetupTest().catch(console.error);
}

export { 
  testNessieConnection, 
  testNessieTransactions, 
  testNessieAnalysis, 
  createTestData 
};

