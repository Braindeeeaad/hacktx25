/**
 * Test Nessie API - Simple Test with Created Data
 * Test with the customer and account we just created
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '7144021f6c954956d9e684aafabb77d6';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieSimple() {
  console.log('🧪 Nessie API - Simple Test');
  console.log('============================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
  
  // Use the customer and account we just created
  const customerId = '68f45dc39683f20dd51a1493';
  const accountId = '68f45dc39683f20dd51a1494';

  console.log(`API Key: ${NESSIE_API_KEY}`);
  console.log(`Customer ID: ${customerId}`);
  console.log(`Account ID: ${accountId}`);

  try {
    // Step 1: Get customer accounts
    console.log('\n1️⃣ Getting customer accounts...');
    
    const accountsResponse = await axios.get(
      `http://api.nessieisreal.com/customers/${customerId}/accounts`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Accounts retrieved:');
    console.log(`Status: ${accountsResponse.status}`);
    console.log(`Found ${accountsResponse.data.length} accounts`);
    console.log(JSON.stringify(accountsResponse.data, null, 2));

    // Step 2: Get account purchases
    console.log('\n2️⃣ Getting account purchases...');
    
    const purchasesResponse = await axios.get(
      `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Purchases retrieved:');
    console.log(`Status: ${purchasesResponse.status}`);
    console.log(`Found ${purchasesResponse.data.length} purchases`);
    console.log(JSON.stringify(purchasesResponse.data, null, 2));

    // Step 3: Create a simple purchase
    console.log('\n3️⃣ Creating a simple purchase...');
    
    const purchaseData = {
      medium: "balance",
      purchase_date: "2024-10-19",
      amount: 25.50,
      description: "Test purchase"
    };

    const purchaseResponse = await axios.post(
      `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
      purchaseData,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Purchase created:');
    console.log(`Status: ${purchaseResponse.status}`);
    console.log(JSON.stringify(purchaseResponse.data, null, 2));

    // Step 4: Get purchases again to see the new one
    console.log('\n4️⃣ Getting purchases after creation...');
    
    const updatedPurchasesResponse = await axios.get(
      `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Updated purchases:');
    console.log(`Found ${updatedPurchasesResponse.data.length} purchases`);
    console.log(JSON.stringify(updatedPurchasesResponse.data, null, 2));

    console.log('\n🎉 Nessie API is working correctly!');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Account ID: ${accountId}`);
    console.log('You can now use these IDs in your main system.');

  } catch (error: any) {
    console.log('❌ Nessie API Error:');
    console.log(`Error Message: ${error.message}`);
    
    if (error.response) {
      console.log(`Response Status: ${error.response.status}`);
      console.log(`Response Data:`, JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
if (require.main === module) {
  testNessieSimple();
}
