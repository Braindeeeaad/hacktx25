/**
 * Debug Nessie API Response
 * Test the Nessie API with detailed logging
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '7144021f6c954956d9e684aafabb77d6';
process.env.NESSIE_CUSTOMER_ID = '68f4080c9683f20dd519f005';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieDebug() {
  console.log('🔍 Nessie API Debug Test');
  console.log('========================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
  const NESSIE_CUSTOMER_ID = process.env.NESSIE_CUSTOMER_ID;

  console.log(`API Key: ${NESSIE_API_KEY}`);
  console.log(`Customer ID: ${NESSIE_CUSTOMER_ID}`);
  console.log(`Full URL: http://api.nessieisreal.com/customers/${NESSIE_CUSTOMER_ID}/accounts?key=${NESSIE_API_KEY}`);

  try {
    console.log('\n1️⃣ Testing Nessie API connection...');
    
    const response = await axios.get(
      `http://api.nessieisreal.com/customers/${NESSIE_CUSTOMER_ID}/accounts`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Nessie API Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log(`Headers:`, JSON.stringify(response.headers, null, 2));
    console.log(`Data:`, JSON.stringify(response.data, null, 2));

    if (response.data && Array.isArray(response.data)) {
      console.log(`\n📊 Found ${response.data.length} accounts`);
      if (response.data.length > 0) {
        console.log('Account details:');
        response.data.forEach((account: any, index: number) => {
          console.log(`  Account ${index + 1}:`);
          console.log(`    ID: ${account._id}`);
          console.log(`    Type: ${account.type}`);
          console.log(`    Nickname: ${account.nickname}`);
          console.log(`    Rewards: ${account.rewards}`);
          console.log(`    Balance: ${account.balance}`);
        });
      } else {
        console.log('⚠️ No accounts found for this customer ID');
        console.log('This could mean:');
        console.log('- The customer ID is incorrect');
        console.log('- The customer has no accounts');
        console.log('- The API key doesn\'t have access to this customer');
      }
    } else {
      console.log('⚠️ Unexpected response format:');
      console.log(JSON.stringify(response.data, null, 2));
    }

  } catch (error: any) {
    console.log('❌ Nessie API Error:');
    console.log(`Error Message: ${error.message}`);
    
    if (error.response) {
      console.log(`Response Status: ${error.response.status}`);
      console.log(`Response Status Text: ${error.response.statusText}`);
      console.log(`Response Headers:`, JSON.stringify(error.response.headers, null, 2));
      console.log(`Response Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received');
      console.log(`Request:`, JSON.stringify(error.request, null, 2));
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

// Run the test
if (require.main === module) {
  testNessieDebug();
}
