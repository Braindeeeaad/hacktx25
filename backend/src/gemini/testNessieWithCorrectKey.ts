/**
 * Test Nessie API with the correct API key from the Python script
 * Check what customers and accounts exist with the seeded data
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieWithCorrectKey() {
  console.log('🔑 Nessie API - Test with Correct API Key');
  console.log('==========================================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;

  console.log(`API Key: ${NESSIE_API_KEY}`);

  try {
    // Step 1: Get all customers
    console.log('\n1️⃣ Getting all customers...');
    
    const customersResponse = await axios.get(
      `http://api.nessieisreal.com/customers`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Customers retrieved:');
    console.log(`Status: ${customersResponse.status}`);
    console.log(`Found ${customersResponse.data.length} customers`);
    
    if (customersResponse.data.length > 0) {
      console.log('\nCustomer details:');
      customersResponse.data.forEach((customer: any, index: number) => {
        console.log(`  Customer ${index + 1}:`);
        console.log(`    ID: ${customer._id}`);
        console.log(`    Name: ${customer.first_name} ${customer.last_name}`);
        console.log(`    Address: ${customer.address.city}, ${customer.address.state}`);
      });

      // Step 2: Get accounts for the first customer
      const customerId = customersResponse.data[0]._id;
      console.log(`\n2️⃣ Getting accounts for customer: ${customerId}`);
      
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
      
      if (accountsResponse.data.length > 0) {
        console.log('\nAccount details:');
        accountsResponse.data.forEach((account: any, index: number) => {
          console.log(`  Account ${index + 1}:`);
          console.log(`    ID: ${account._id}`);
          console.log(`    Type: ${account.type}`);
          console.log(`    Nickname: ${account.nickname}`);
          console.log(`    Balance: $${account.balance}`);
        });

        // Step 3: Get purchases for the first account
        const accountId = accountsResponse.data[0]._id;
        console.log(`\n3️⃣ Getting purchases for account: ${accountId}`);
        
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
        
        if (purchasesResponse.data.length > 0) {
          console.log('\nSample purchases:');
          purchasesResponse.data.slice(0, 5).forEach((purchase: any, index: number) => {
            console.log(`  Purchase ${index + 1}:`);
            console.log(`    Date: ${purchase.purchase_date}`);
            console.log(`    Amount: $${purchase.amount}`);
            console.log(`    Description: ${purchase.description}`);
          });

          // Step 4: Get purchases with date range (last 30 days)
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 30);
          
          const startDateString = startDate.toISOString().split('T')[0];
          const endDateString = endDate.toISOString().split('T')[0];
          
          console.log(`\n4️⃣ Getting purchases for date range: ${startDateString} to ${endDateString}`);
          
          const dateRangeResponse = await axios.get(
            `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
            {
              params: {
                key: NESSIE_API_KEY,
                start_date: startDateString,
                end_date: endDateString
              },
              timeout: 10000
            }
          );

          console.log('✅ Date range purchases retrieved:');
          console.log(`Status: ${dateRangeResponse.status}`);
          console.log(`Found ${dateRangeResponse.data.length} purchases in date range`);
          
          if (dateRangeResponse.data.length > 0) {
            console.log('\nDate range purchases:');
            dateRangeResponse.data.slice(0, 10).forEach((purchase: any, index: number) => {
              console.log(`  ${index + 1}. ${purchase.purchase_date}: $${purchase.amount} - ${purchase.description}`);
            });
          }

          console.log('\n🎉 Successfully found seeded data!');
          console.log(`Customer ID: ${customerId}`);
          console.log(`Account ID: ${accountId}`);
          console.log(`Total Purchases: ${purchasesResponse.data.length}`);
          console.log(`Date Range Purchases: ${dateRangeResponse.data.length}`);
          
        } else {
          console.log('⚠️ No purchases found for this account');
        }
      } else {
        console.log('⚠️ No accounts found for this customer');
      }
    } else {
      console.log('⚠️ No customers found with this API key');
    }

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
  testNessieWithCorrectKey();
}
