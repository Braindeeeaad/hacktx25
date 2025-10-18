/**
 * Test Different Transaction Endpoint Formats for Nessie API
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function testTransactionFormats() {
  console.log('🔍 Testing Different Transaction Endpoint Formats');
  console.log('='.repeat(60));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';
  const ACCOUNT_ID = '68f4080c9683f20dd519f006';
  const BASE_URL = 'http://api.nessieisreal.com';
  
  // Try different endpoint variations based on common API patterns
  const endpoints = [
    {
      name: 'Standard format',
      url: `${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'With /api prefix',
      url: `${BASE_URL}/api/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'With /api/v1 prefix',
      url: `${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'With /api/v2 prefix',
      url: `${BASE_URL}/api/v2/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'Customer-based transactions',
      url: `${BASE_URL}/customers/${CUSTOMER_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'Customer accounts transactions',
      url: `${BASE_URL}/customers/${CUSTOMER_ID}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'With /enterprise prefix',
      url: `${BASE_URL}/enterprise/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'Different base URL (https)',
      url: `https://api.nessieisreal.com/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    console.log(`   URL: ${endpoint.url}`);
    
    try {
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS! Found ${Array.isArray(data) ? data.length : 'unknown'} transactions`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
        }
        console.log('   🎉 THIS ENDPOINT WORKS!');
        break; // Stop testing if we find a working endpoint
      } else {
        const errorText = await response.text();
        if (errorText.includes('<!DOCTYPE html>')) {
          console.log(`   ❌ HTML Error Page (404) - Endpoint not found`);
        } else if (errorText.includes('"code":404')) {
          console.log(`   ❌ JSON Error: ${errorText.substring(0, 100)}...`);
        } else {
          console.log(`   ❌ Error: ${errorText.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error}`);
    }
    
    console.log('');
  }
  
  console.log('💡 If all endpoints fail:');
  console.log('   1. Check the official Nessie API documentation');
  console.log('   2. The transaction endpoints might not be available in your API access level');
  console.log('   3. You might need to request additional permissions');
  console.log('   4. The API might be in a different version or have different endpoint structure');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTransactionFormats().catch(console.error);
}

export { testTransactionFormats };
