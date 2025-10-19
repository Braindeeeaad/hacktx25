/**
 * Test Nessie API Connectivity
 * Simple test to check if Nessie API is reachable
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

async function testNessieConnectivity() {
  console.log('🔗 Testing Nessie API Connectivity');
  console.log('==================================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
  const NESSIE_CUSTOMER_ID = process.env.NESSIE_CUSTOMER_ID;

  console.log(`API Key: ${NESSIE_API_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`Customer ID: ${NESSIE_CUSTOMER_ID ? 'SET' : 'NOT SET'}`);

  if (!NESSIE_API_KEY || !NESSIE_CUSTOMER_ID) {
    console.log('❌ Nessie API keys not configured');
    return;
  }

  try {
    console.log('\n1️⃣ Testing basic connectivity to Nessie API...');
    
    // Test with a simple ping to the API
    const response = await axios.get(
      `https://api.reimaginebanking.com/customers/${NESSIE_CUSTOMER_ID}/accounts`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${NESSIE_API_KEY}:`).toString('base64')}`
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('✅ Nessie API is reachable!');
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);

  } catch (error: any) {
    console.log('❌ Nessie API connectivity failed:');
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔧 Issue: DNS resolution failed');
      console.log('   - The domain api.reimaginebanking.com cannot be resolved');
      console.log('   - This could be a network connectivity issue');
      console.log('   - Try checking your internet connection');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Issue: Connection refused');
      console.log('   - The server is not accepting connections');
      console.log('   - This could be a firewall or proxy issue');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('🔧 Issue: Connection timeout');
      console.log('   - The request took too long to complete');
      console.log('   - This could be a network latency issue');
    } else {
      console.log(`🔧 Issue: ${error.code || 'Unknown error'}`);
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Try accessing https://api.reimaginebanking.com in a browser');
    console.log('3. Check if your firewall is blocking the connection');
    console.log('4. Try using a different network (mobile hotspot)');
    console.log('5. Check if your DNS settings are correct');
  }
}

// Run the test
if (require.main === module) {
  testNessieConnectivity();
}
