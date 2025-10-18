/**
 * Test Nessie API Key Directly
 * This will help us debug the authentication issue
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function testNessieAPIKey() {
  console.log('🔍 Testing Nessie API Key Directly');
  console.log('='.repeat(50));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';
  const BASE_URL = 'http://api.nessieisreal.com';
  
  console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...`);
  console.log(`👤 Customer ID: ${CUSTOMER_ID}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('');
  
  try {
    // Test 1: Try to get customers list
    console.log('1. Testing customers endpoint...');
    const customersResponse = await fetch(`${BASE_URL}/customers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    
    console.log(`   Status: ${customersResponse.status} ${customersResponse.statusText}`);
    
    if (customersResponse.ok) {
      const customers = await customersResponse.json();
      console.log(`   ✅ Success! Found ${customers.length} customers`);
      if (customers.length > 0) {
        console.log(`   📊 Sample customer: ${customers[0].first_name} ${customers[0].last_name}`);
      }
    } else {
      const errorText = await customersResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    console.log('');
    
    // Test 2: Try to get specific customer
    console.log('2. Testing specific customer...');
    const customerResponse = await fetch(`${BASE_URL}/customers/${CUSTOMER_ID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    
    console.log(`   Status: ${customerResponse.status} ${customerResponse.statusText}`);
    
    if (customerResponse.ok) {
      const customer = await customerResponse.json();
      console.log(`   ✅ Success! Customer: ${customer.first_name} ${customer.last_name}`);
    } else {
      const errorText = await customerResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    console.log('');
    
    // Test 3: Try to get customer accounts
    console.log('3. Testing customer accounts...');
    const accountsResponse = await fetch(`${BASE_URL}/customers/${CUSTOMER_ID}/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    
    console.log(`   Status: ${accountsResponse.status} ${accountsResponse.statusText}`);
    
    if (accountsResponse.ok) {
      const accounts = await accountsResponse.json();
      console.log(`   ✅ Success! Found ${accounts.length} accounts`);
      if (accounts.length > 0) {
        console.log(`   📊 Sample account: ${accounts[0].nickname || 'Unnamed'} (${accounts[0].type})`);
      }
    } else {
      const errorText = await accountsResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }
    
    console.log('');
    
    // Test 4: Try alternative authentication methods
    console.log('4. Testing alternative authentication...');
    
    // Try with API key in query parameter
    const queryResponse = await fetch(`${BASE_URL}/customers?key=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`   Query param status: ${queryResponse.status} ${queryResponse.statusText}`);
    
    // Try with different header format
    const headerResponse = await fetch(`${BASE_URL}/customers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
    });
    
    console.log(`   X-API-Key header status: ${headerResponse.status} ${headerResponse.statusText}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('');
  console.log('💡 Troubleshooting tips:');
  console.log('   • Check if your API key is correct');
  console.log('   • Verify you have API access');
  console.log('   • Check the Nessie API documentation for authentication format');
  console.log('   • Try the API key in different formats');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testNessieAPIKey().catch(console.error);
}

export { testNessieAPIKey };
