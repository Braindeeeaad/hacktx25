/**
 * Test Nessie API - Create Customer and Account (Fixed)
 * Create a customer and account for testing with proper ID extraction
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '7144021f6c954956d9e684aafabb77d6';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieCreateFixed() {
  console.log('👤 Nessie API - Create Customer and Account (Fixed)');
  console.log('====================================================');
  
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
    console.log(`Customer Data:`, JSON.stringify(customerResponse.data, null, 2));

    // Extract customer ID properly
    const customerId = customerResponse.data.objectCreated._id;
    console.log(`Customer ID: ${customerId}`);

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
    console.log(`Account Data:`, JSON.stringify(accountResponse.data, null, 2));

    const accountId = accountResponse.data.objectCreated._id;
    console.log(`Account ID: ${accountId}`);

    // Step 3: Create some transactions
    console.log('\n3️⃣ Creating sample transactions...');
    
    const transactions = [
      {
        merchant_id: "test_merchant_1",
        medium: "balance",
        purchase_date: "2024-10-19",
        amount: 25.50,
        description: "Coffee shop purchase"
      },
      {
        merchant_id: "test_merchant_2", 
        medium: "balance",
        purchase_date: "2024-10-18",
        amount: 45.75,
        description: "Grocery store"
      },
      {
        merchant_id: "test_merchant_3",
        medium: "balance", 
        purchase_date: "2024-10-17",
        amount: 12.99,
        description: "Gas station"
      }
    ];

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      console.log(`\nCreating transaction ${i + 1}...`);
      
      const transactionResponse = await axios.post(
        `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
        transaction,
        {
          params: {
            key: NESSIE_API_KEY
          },
          timeout: 10000
        }
      );

      console.log(`✅ Transaction ${i + 1} created:`, transactionResponse.data.objectCreated._id);
    }

    console.log('\n🎉 Successfully created test data!');
    console.log(`Customer ID: ${customerId}`);
    console.log(`Account ID: ${accountId}`);
    console.log('You can now use these IDs for testing.');

    // Step 4: Test retrieving the data
    console.log('\n4️⃣ Testing data retrieval...');
    
    const accountsResponse = await axios.get(
      `http://api.nessieisreal.com/customers/${customerId}/accounts`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Retrieved accounts:');
    console.log(`Found ${accountsResponse.data.length} accounts`);
    console.log(JSON.stringify(accountsResponse.data, null, 2));

    const purchasesResponse = await axios.get(
      `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Retrieved purchases:');
    console.log(`Found ${purchasesResponse.data.length} purchases`);
    console.log(JSON.stringify(purchasesResponse.data, null, 2));

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
  testNessieCreateFixed();
}
