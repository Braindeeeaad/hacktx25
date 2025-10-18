/**
 * Test Different Transaction Endpoint Formats
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function testTransactionEndpoints() {
  console.log('🔍 Testing Transaction Endpoint Variations');
  console.log('='.repeat(50));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const ACCOUNT_ID = '68f4080c9683f20dd519f005';
  const BASE_URL = 'http://api.nessieisreal.com';
  
  // Try different endpoint variations
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
      name: 'With /v1 prefix',
      url: `${BASE_URL}/v1/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`
    },
    {
      name: 'Different account ID format',
      url: `${BASE_URL}/accounts/68f4080c9683f20dd519f006/transactions?key=${API_KEY}`
    },
    {
      name: 'With customer prefix',
      url: `${BASE_URL}/customers/${ACCOUNT_ID}/accounts/68f4080c9683f20dd519f006/transactions?key=${API_KEY}`
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
        console.log(`   ✅ Success! Found ${Array.isArray(data) ? data.length : 'unknown'} transactions`);
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
        }
      } else {
        const errorText = await response.text();
        if (errorText.includes('<!DOCTYPE html>')) {
          console.log(`   ❌ HTML Error Page (404) - Endpoint not found`);
        } else {
          console.log(`   ❌ Error: ${errorText.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error}`);
    }
    
    console.log('');
  }
  
  console.log('💡 If all endpoints fail, try:');
  console.log('   1. Check the Nessie API documentation');
  console.log('   2. Use the Swagger UI at http://api.nessieisreal.com/documentation');
  console.log('   3. Test with curl commands');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTransactionEndpoints().catch(console.error);
}

export { testTransactionEndpoints };
