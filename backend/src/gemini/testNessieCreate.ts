/**
 * Test Nessie API - Create Customer and Account
 * Create a customer and account for testing
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '7144021f6c954956d9e684aafabb77d6';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieCreate() {
  console.log('👤 Nessie API - Create Customer and Account');
  console.log('============================================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;

  console.log(`API Key: ${NESSIE_API_KEY}`);

  try {
    // Step 1: Create a customer
    console.log('\n1️⃣ Creating a customer...');
    
    const customerData = {
      first_name: "Test",
      last_name: "User",
      address: {
        street_number: "123",
        street_name: "Main St",
        city: "Austin",
        state: "TX",
        zip: "78701"
      }
    };

    const customerResponse = await axios.post(
      `http://api.nessieisreal.com/customers`,
      customerData,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Customer created:');
    console.log(`Status: ${customerResponse.status}`);
    console.log(`Customer ID: ${customerResponse.data._id}`);
    console.log(`Customer Data:`, JSON.stringify(customerResponse.data, null, 2));

    const customerId = customerResponse.data._id;

    // Step 2: Create an account for the customer
    console.log('\n2️⃣ Creating an account...');
    
    const accountData = {
      type: "Checking",
      nickname: "Test Account",
      rewards: 0,
      balance: 1000
    };

    const accountResponse = await axios.post(
      `http://api.nessieisreal.com/customers/${customerId}/accounts`,
      accountData,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Account created:');
    console.log(`Status: ${accountResponse.status}`);
    console.log(`Account ID: ${accountResponse.data._id}`);
    console.log(`Account Data:`, JSON.stringify(accountResponse.data, null, 2));

    const accountId = accountResponse.data._id;

    // Step 3: Create some transactions
    console.log('\n3️⃣ Creating sample transactions...');
    
    const transactionData = {
      merchant_id: "test_merchant",
      medium: "balance",
      purchase_date: "2024-10-19",
      amount: 25.50,
      description: "Test purchase"
    };

    const transactionResponse = await axios.post(
      `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
      transactionData,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Transaction created:');
    console.log(`Status: ${transactionResponse.status}`);
    console.log(`Transaction Data:`, JSON.stringify(transactionResponse.data, null, 2));

    console.log('\n🎉 Successfully created test data!');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Account ID: ${accountId}`);
    console.log('You can now use these IDs for testing.');

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
  testNessieCreate();
}
