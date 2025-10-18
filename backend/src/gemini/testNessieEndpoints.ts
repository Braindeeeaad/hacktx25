/**
 * Test Nessie API Endpoints
 * This will help us find the correct endpoint format
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function testEndpoints() {
  console.log('🔍 Testing Nessie API Endpoints');
  console.log('='.repeat(50));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';
  const ACCOUNT_ID = '68f4080c9683f20dd519f006';
  const BASE_URL = 'http://api.nessieisreal.com';
  
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`👤 Customer ID: ${CUSTOMER_ID}`);
  console.log(`🏦 Account ID: ${ACCOUNT_ID}`);
  console.log('');
  
  // Test different endpoint formats
  const endpoints = [
    {
      name: 'GET /customers',
      url: `${BASE_URL}/customers?key=${API_KEY}`,
      method: 'GET'
    },
    {
      name: 'GET /customers/{id}',
      url: `${BASE_URL}/customers/${CUSTOMER_ID}?key=${API_KEY}`,
      method: 'GET'
    },
    {
      name: 'GET /customers/{id}/accounts',
      url: `${BASE_URL}/customers/${CUSTOMER_ID}/accounts?key=${API_KEY}`,
      method: 'GET'
    },
    {
      name: 'GET /accounts/{id}/transactions',
      url: `${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`,
      method: 'GET'
    },
    {
      name: 'POST /accounts/{id}/transactions',
      url: `${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`,
      method: 'POST',
      body: {
        type: 'purchase',
        amount: -25.50,
        description: 'TEST TRANSACTION',
        date: '2025-09-29'
      }
    }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.name}...`);
    
    try {
      const options: any = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(endpoint.url, options);
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success! Response: ${JSON.stringify(data).substring(0, 100)}...`);
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
  
  console.log('💡 Next Steps:');
  console.log('   • Check the Nessie API documentation for correct endpoints');
  console.log('   • Verify the API version and base URL');
  console.log('   • Test with a simple curl command first');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEndpoints().catch(console.error);
}

export { testEndpoints };
