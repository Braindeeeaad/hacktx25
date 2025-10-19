/**
 * Test Customer and Account Creation with Nessie API
 * Demonstrates the new create methods added to nessieIntegration.ts
 */

import { NessieAPIIntegration } from './nessieIntegration';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test customer and account creation
 */
async function testCustomerAccountCreation() {
  console.log('🧪 TESTING CUSTOMER AND ACCOUNT CREATION');
  console.log('='.repeat(60));
  
  // Initialize Nessie integration
  const nessie = new NessieAPIIntegration(
    '2535e8ec7de75e2bb33a7e0bab0cc897', // Your actual API key
    '68f4080c9683f20dd519f005',          // Your actual customer ID
    'http://api.nessieisreal.com'        // Base URL
  );

  try {
    // Test 1: Create a new customer
    console.log('\n1. Creating a new customer...');
    const newCustomer = await nessie.createCustomer({
      first_name: 'John',
      last_name: 'Doe',
      address: {
        street_number: '123',
        street_name: 'Main Street',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }
    }) as any;
    
    console.log('✅ Customer created successfully:');
    console.log(`   ID: ${newCustomer._id}`);
    console.log(`   Name: ${newCustomer.first_name} ${newCustomer.last_name}`);
    console.log(`   Address: ${newCustomer.address.street_number} ${newCustomer.address.street_name}, ${newCustomer.address.city}, ${newCustomer.address.state} ${newCustomer.address.zip}`);

    // Test 2: Create accounts for the new customer
    console.log('\n2. Creating accounts for the new customer...');
    const checkingAccount = await nessie.createAccountForCustomer(newCustomer._id, {
      type: 'Checking',
      nickname: 'Primary Checking',
      balance: 1500,
      rewards: 0
    }) as any;
    
    const savingsAccount = await nessie.createAccountForCustomer(newCustomer._id, {
      type: 'Savings',
      nickname: 'Emergency Fund',
      balance: 10000,
      rewards: 0
    }) as any;
    
    console.log('✅ Accounts created successfully:');
    console.log(`   Checking Account ID: ${checkingAccount._id}`);
    console.log(`   Savings Account ID: ${savingsAccount._id}`);

    // Test 3: Get customer details
    console.log('\n3. Retrieving customer details...');
    const customerDetails = await nessie.getCustomer(newCustomer._id) as any;
    console.log('✅ Customer details retrieved:');
    console.log(`   Full Name: ${customerDetails.first_name} ${customerDetails.last_name}`);

    // Test 4: Get all customers
    console.log('\n4. Retrieving all customers...');
    const allCustomers = await nessie.getAllCustomers() as any[];
    console.log(`✅ Found ${allCustomers.length} customers total`);

    // Test 5: Get account details
    console.log('\n5. Retrieving account details...');
    const accountDetails = await nessie.getAccount(checkingAccount._id) as any;
    console.log('✅ Account details retrieved:');
    console.log(`   Type: ${accountDetails.type}`);
    console.log(`   Nickname: ${accountDetails.nickname}`);
    console.log(`   Balance: $${accountDetails.balance}`);

    // Test 6: Get account with customer info
    console.log('\n6. Retrieving account with customer info...');
    const accountWithCustomer = await nessie.getAccountWithCustomer(checkingAccount._id) as any;
    console.log('✅ Account with customer info retrieved:');
    console.log(`   Account: ${accountWithCustomer.account.type} - ${accountWithCustomer.account.nickname}`);
    console.log(`   Customer: ${accountWithCustomer.customer.first_name} ${accountWithCustomer.customer.last_name}`);

    // Test 7: Update customer
    console.log('\n7. Updating customer information...');
    const updatedCustomer = await nessie.updateCustomer(newCustomer._id, {
      first_name: 'Johnny',
      address: {
        city: 'Dallas'
      }
    }) as any;
    console.log('✅ Customer updated successfully:');
    console.log(`   New name: ${updatedCustomer.first_name} ${updatedCustomer.last_name}`);
    console.log(`   New city: ${updatedCustomer.address.city}`);

    // Test 8: Update account
    console.log('\n8. Updating account information...');
    const updatedAccount = await nessie.updateAccount(checkingAccount._id, {
      nickname: 'Updated Primary Checking',
      balance: 2000
    }) as any;
    console.log('✅ Account updated successfully:');
    console.log(`   New nickname: ${updatedAccount.nickname}`);
    console.log(`   New balance: $${updatedAccount.balance}`);

    // Test 9: Create customer with default accounts (convenience method)
    console.log('\n9. Creating customer with default accounts...');
    const customerWithAccounts = await nessie.createCustomerWithAccounts({
      first_name: 'Jane',
      last_name: 'Smith',
      address: {
        street_number: '456',
        street_name: 'Oak Avenue',
        city: 'Houston',
        state: 'TX',
        zip: '77001'
      }
    }) as any;
    
    console.log('✅ Customer with accounts created successfully:');
    console.log(`   Customer ID: ${customerWithAccounts.customer._id}`);
    console.log(`   Accounts created: ${customerWithAccounts.accounts.length}`);
    console.log(`   Message: ${customerWithAccounts.message}`);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('Summary of what was tested:');
    console.log('✅ Create customer');
    console.log('✅ Create account for specific customer');
    console.log('✅ Get customer by ID');
    console.log('✅ Get all customers');
    console.log('✅ Get account by ID');
    console.log('✅ Get account with customer info');
    console.log('✅ Update customer');
    console.log('✅ Update account');
    console.log('✅ Create customer with default accounts (convenience method)');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Test account deletion (optional - be careful with this)
 */
async function testAccountDeletion() {
  console.log('\n🗑️  TESTING ACCOUNT DELETION (OPTIONAL)');
  console.log('='.repeat(60));
  console.log('⚠️  WARNING: This will delete accounts. Only run if you want to clean up test data.');
  
  // Uncomment the following lines if you want to test deletion
  /*
  const nessie = new NessieAPIIntegration(
    '2535e8ec7de75e2bb33a7e0bab0cc897',
    '68f4080c9683f20dd519f005',
    'http://api.nessieisreal.com'
  );

  try {
    // Get all customers first
    const customers = await nessie.getAllCustomers();
    console.log(`Found ${customers.length} customers`);
    
    // Get accounts for each customer
    for (const customer of customers) {
      const accounts = await nessie.getAccounts();
      console.log(`Customer ${customer.first_name} has ${accounts.length} accounts`);
      
      // Delete accounts (be careful!)
      for (const account of accounts) {
        try {
          await nessie.deleteAccount(account._id);
          console.log(`✅ Deleted account ${account._id}`);
        } catch (error) {
          console.log(`❌ Failed to delete account ${account._id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Deletion test failed:', error);
  }
  */
}

// Run tests if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  testCustomerAccountCreation()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

export { testCustomerAccountCreation, testAccountDeletion };
