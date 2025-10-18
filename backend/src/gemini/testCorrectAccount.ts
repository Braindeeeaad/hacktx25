/**
 * Test with Correct Account ID
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function testCorrectAccount() {
  console.log('🔍 Testing with Correct Account ID');
  console.log('='.repeat(50));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';
  const ACCOUNT_ID = '68f4080c9683f20dd519f006'; // This is the correct account ID
  const BASE_URL = 'http://api.nessieisreal.com';
  
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`👤 Customer ID: ${CUSTOMER_ID}`);
  console.log(`🏦 Account ID: ${ACCOUNT_ID}`);
  console.log('');
  
  try {
    // Test GET transactions
    console.log('1. Testing GET transactions...');
    const getResponse = await fetch(`${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log(`   ✅ Success! Found ${Array.isArray(data) ? data.length : 'unknown'} transactions`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   Sample transaction: ${JSON.stringify(data[0]).substring(0, 200)}...`);
      } else {
        console.log('   📝 No transactions found - this is expected for a new account');
      }
    } else {
      const errorText = await getResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    console.log('');
    
    // Test POST transaction
    console.log('2. Testing POST transaction...');
    const transactionData = {
      type: 'purchase',
      amount: -25.50,
      description: 'TEST TRANSACTION',
      date: '2025-09-29'
    };
    
    const postResponse = await fetch(`${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData)
    });
    
    console.log(`   Status: ${postResponse.status} ${postResponse.statusText}`);
    
    if (postResponse.ok) {
      const data = await postResponse.json();
      console.log(`   ✅ Success! Transaction created: ${JSON.stringify(data).substring(0, 200)}...`);
    } else {
      const errorText = await postResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    console.log('');
    
    // Test GET transactions again to see if the new transaction appears
    console.log('3. Testing GET transactions after POST...');
    const getResponse2 = await fetch(`${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Status: ${getResponse2.status} ${getResponse2.statusText}`);
    
    if (getResponse2.ok) {
      const data = await getResponse2.json();
      console.log(`   ✅ Success! Found ${Array.isArray(data) ? data.length : 'unknown'} transactions`);
      if (Array.isArray(data) && data.length > 0) {
        console.log(`   Latest transaction: ${JSON.stringify(data[data.length - 1]).substring(0, 200)}...`);
      }
    } else {
      const errorText = await getResponse2.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   • If POST worked, you can now add more test transactions');
  console.log('   • Run: npx ts-node src/ai/gemini/testRunner.ts nessie');
  console.log('   • Or test the AI analysis with: npx ts-node src/ai/gemini/fullAnalysisTest.ts custom');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCorrectAccount().catch(console.error);
}

export { testCorrectAccount };
