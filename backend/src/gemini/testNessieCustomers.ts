/**
 * Test Nessie API - Get All Customers
 * Check what customers are available in the system
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '7144021f6c954956d9e684aafabb77d6';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieCustomers() {
  console.log('👥 Nessie API - Get All Customers');
  console.log('==================================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;

  console.log(`API Key: ${NESSIE_API_KEY}`);

  try {
    console.log('\n1️⃣ Getting all customers...');
    
    const response = await axios.get(
      `http://api.nessieisreal.com/customers`,
      {
        params: {
          key: NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    console.log('✅ Nessie API Response:');
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, JSON.stringify(response.data, null, 2));

    if (response.data && Array.isArray(response.data)) {
      console.log(`\n📊 Found ${response.data.length} customers`);
      if (response.data.length > 0) {
        console.log('\nCustomer details:');
        response.data.forEach((customer: any, index: number) => {
          console.log(`  Customer ${index + 1}:`);
          console.log(`    ID: ${customer._id}`);
          console.log(`    First Name: ${customer.first_name}`);
          console.log(`    Last Name: ${customer.last_name}`);
          console.log(`    Address: ${customer.address}`);
        });
      } else {
        console.log('⚠️ No customers found');
      }
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
  testNessieCustomers();
}
