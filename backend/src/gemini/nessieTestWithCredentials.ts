/**
 * Nessie API Test with Real Credentials
 * This file shows you how to test with your actual Nessie API credentials
 */

import { NessieAPIIntegration } from './nessieIntegration';

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test Nessie API with your actual credentials
 * 
 * INSTRUCTIONS:
 * 1. Get your API key from http://api.nessieisreal.com/documentation
 * 2. Create a customer in Nessie API
 * 3. Replace the credentials below with your actual values
 * 4. Run: npx ts-node src/ai/gemini/nessieTestWithCredentials.ts
 */
async function testNessieWithCredentials() {
  console.log('🏦 Testing Nessie API with Your Credentials');
  console.log('='.repeat(60));
  
  // 🔑 YOUR ACTUAL NESSIE API CREDENTIALS
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';        // Your actual API key
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';      // Your actual customer ID
  const BASE_URL = 'http://api.nessieisreal.com';
  
  // Check if credentials are set (this check is now obsolete since we have real credentials)
  if (false) { // Disabled since we have real credentials
    console.log('❌ CREDENTIALS NOT SET');
    console.log('='.repeat(60));
    console.log('Please follow these steps:');
    console.log('');
    console.log('1. Get your Nessie API key:');
    console.log('   - Visit: http://api.nessieisreal.com/documentation');
    console.log('   - Sign up for an account');
    console.log('   - Request API access');
    console.log('   - Get your API key from the dashboard');
    console.log('');
    console.log('2. Create a customer:');
    console.log('   curl -X POST http://api.nessieisreal.com/customers \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -H "Authorization: Bearer YOUR_API_KEY" \\');
    console.log('     -d \'{"first_name": "John", "last_name": "Doe", "address": {"street_number": "123", "street_name": "Main St", "city": "Anytown", "state": "NY", "zip": "12345"}}\'');
    console.log('');
    console.log('3. Update this file with your credentials');
    console.log('4. Run this test again');
    return;
  }
  
  console.log('✅ Credentials configured');
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`👤 Customer ID: ${CUSTOMER_ID}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('');
  
  try {
    // Initialize Nessie integration
    const nessie = new NessieAPIIntegration(API_KEY, CUSTOMER_ID, BASE_URL);
    
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
      console.log('');
      console.log('Create an account:');
      console.log(`curl -X POST ${BASE_URL}/customers/${CUSTOMER_ID}/accounts \\`);
      console.log('  -H "Content-Type: application/json" \\');
      console.log(`  -H "Authorization: Bearer ${API_KEY}" \\`);
      console.log('  -d \'{"type": "Checking", "nickname": "My Checking Account", "rewards": 0, "balance": 1000}\'');
      return;
    }
    
    console.log('');
    console.log('2. Testing transaction fetching...');
    
    // Test fetching transactions
    const transactions = await nessie.getAllTransactions();
    console.log(`✅ Found ${transactions.length} transactions`);
    
    if (transactions.length > 0) {
      console.log('📈 Sample transactions:');
      transactions.slice(0, 5).forEach((tx: any, index: number) => {
        console.log(`   ${index + 1}. ${tx.date} - ${tx.category}: $${tx.amount}`);
      });
      
      if (transactions.length > 5) {
        console.log(`   ... and ${transactions.length - 5} more transactions`);
      }
    } else {
      console.log('⚠️  No transactions found. You may need to create test transactions.');
      console.log('');
      console.log('Create test transactions:');
      console.log(`curl -X POST ${BASE_URL}/accounts/{accountId}/transactions \\`);
      console.log('  -H "Content-Type: application/json" \\');
      console.log(`  -H "Authorization: Bearer ${API_KEY}" \\`);
      console.log('  -d \'{"type": "purchase", "amount": -25.50, "description": "STARBUCKS #1234", "date": "2025-09-29"}\'');
      return;
    }
    
    console.log('');
    console.log('3. Testing AI analysis...');
    
    // Test AI analysis
    const analysis = await nessie.analyzeRecentDays(30);
    
    console.log('✅ AI Analysis completed successfully!');
    console.log('');
    console.log('📊 Analysis Results:');
    console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
    console.log(`📈 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);
    console.log(`📊 Categories: ${analysis.categories.length}`);
    console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
    console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
    
    console.log('');
    console.log('📈 Category Trends:');
    analysis.categories.forEach((cat: any) => {
      console.log(`   ${cat.category}: ${cat.trend} (${cat.change})`);
    });
    
    if (analysis.anomalies.length > 0) {
      console.log('');
      console.log('⚠️  Anomalies Detected:');
      analysis.anomalies.forEach((anomaly: any) => {
        console.log(`   ${anomaly.date} - ${anomaly.category}: $${anomaly.amount}`);
      });
    }
    
    console.log('');
    console.log('💡 AI Recommendations:');
    analysis.recommendations.forEach((rec: string, index: number) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    console.log('');
    console.log('🎉 SUCCESS! Your Nessie API integration is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    console.log('');
    console.log('🔧 Troubleshooting:');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('401')) {
      console.log('   • Check your API key is correct');
      console.log('   • Ensure you have API access');
      console.log('   • Verify the API key is active');
    } else if (errorMessage.includes('404')) {
      console.log('   • Check your customer ID is correct');
      console.log('   • Ensure the customer exists');
      console.log('   • Create a customer first');
    } else if (errorMessage.includes('403')) {
      console.log('   • Check your API permissions');
      console.log('   • Ensure you have access to the customer');
    } else {
      console.log('   • Check your internet connection');
      console.log('   • Verify the API endpoint is correct');
      console.log('   • Check the Nessie API documentation');
    }
  }
}

// Run the test if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  testNessieWithCredentials().catch(console.error);
}

export { testNessieWithCredentials };
