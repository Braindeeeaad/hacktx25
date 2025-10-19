/**
 * Test Nessie API Customer and Account Creation (No Gemini Required)
 * This test only uses the Nessie API methods without importing Gemini modules
 */

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

/**
 * Simple Nessie API client for testing (without Gemini dependencies)
 */
class NessieAPITest {
  private apiKey: string;
  private baseUrl: string;
  private customerId: string;

  constructor(apiKey: string, customerId: string, baseUrl: string = 'http://api.nessieisreal.com') {
    this.apiKey = apiKey;
    this.customerId = customerId;
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: {
    first_name: string;
    last_name: string;
    address: {
      street_number: string;
      street_name: string;
      city: string;
      state: string;
      zip: string;
    };
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/customers?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Create a new account for a specific customer
   */
  async createAccountForCustomer(customerId: string, accountData: {
    type: string;
    nickname?: string;
    rewards?: number;
    balance?: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}/accounts?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create account for customer:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   */
  async getAllCustomers() {
    try {
      const response = await fetch(`${this.baseUrl}/customers?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw error;
    }
  }

  /**
   * Get account by ID
   */
  async getAccount(accountId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch account:', error);
      throw error;
    }
  }

  /**
   * Update a customer
   */
  async updateCustomer(customerId: string, customerData: {
    first_name?: string;
    last_name?: string;
    address?: {
      street_number?: string;
      street_name?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}?key=${this.apiKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }

  /**
   * Update an account
   */
  async updateAccount(accountId: string, accountData: {
    type?: string;
    nickname?: string;
    rewards?: number;
    balance?: number;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}?key=${this.apiKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        throw new Error(`Nessie API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update account:', error);
      throw error;
    }
  }
}

/**
 * Test customer and account creation
 */
async function testNessieAPIOnly() {
  console.log('🧪 TESTING NESSIE API CUSTOMER AND ACCOUNT CREATION');
  console.log('='.repeat(60));
  
  // Initialize Nessie API client
  const nessie = new NessieAPITest(
    '7144021f6c954956d9e684aafabb77d6', // Nessie API key
    '68f4080c9683f20dd519f005',          // Customer ID
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
    const customer = newCustomer.objectCreated || newCustomer;
    console.log(`   ID: ${customer._id}`);
    console.log(`   Name: ${customer.first_name} ${customer.last_name}`);
    console.log(`   Address: ${customer.address.street_number} ${customer.address.street_name}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`);

    // Test 2: Create accounts for the new customer
    console.log('\n2. Creating accounts for the new customer...');
    const checkingAccount = await nessie.createAccountForCustomer(customer._id, {
      type: 'Checking',
      nickname: 'Primary Checking',
      balance: 1500,
      rewards: 0
    }) as any;
    
    const savingsAccount = await nessie.createAccountForCustomer(customer._id, {
      type: 'Savings',
      nickname: 'Emergency Fund',
      balance: 10000,
      rewards: 0
    }) as any;
    
    console.log('✅ Accounts created successfully:');
    const checkingAccountData = checkingAccount.objectCreated || checkingAccount;
    const savingsAccountData = savingsAccount.objectCreated || savingsAccount;
    console.log(`   Checking Account ID: ${checkingAccountData._id}`);
    console.log(`   Savings Account ID: ${savingsAccountData._id}`);

    // Test 3: Get customer details
    console.log('\n3. Retrieving customer details...');
    const customerDetails = await nessie.getCustomer(customer._id) as any;
    console.log('✅ Customer details retrieved:');
    console.log(`   Full Name: ${customerDetails.first_name} ${customerDetails.last_name}`);

    // Test 4: Get all customers
    console.log('\n4. Retrieving all customers...');
    const allCustomers = await nessie.getAllCustomers() as any[];
    console.log(`✅ Found ${allCustomers.length} customers total`);

    // Test 5: Get account details
    console.log('\n5. Retrieving account details...');
    const accountDetails = await nessie.getAccount(checkingAccountData._id) as any;
    console.log('✅ Account details retrieved:');
    console.log(`   Type: ${accountDetails.type}`);
    console.log(`   Nickname: ${accountDetails.nickname}`);
    console.log(`   Balance: $${accountDetails.balance}`);

    // Test 6: Update customer
    console.log('\n6. Updating customer information...');
    const updatedCustomer = await nessie.updateCustomer(customer._id, {
      first_name: 'Johnny',
      address: {
        city: 'Dallas'
      }
    }) as any;
    console.log('✅ Customer updated successfully:');
    console.log(`   New name: ${updatedCustomer.first_name} ${updatedCustomer.last_name}`);
    console.log(`   New city: ${updatedCustomer.address.city}`);

    // Test 7: Update account
    console.log('\n7. Updating account information...');
    const updatedAccount = await nessie.updateAccount(checkingAccountData._id, {
      nickname: 'Updated Primary Checking',
      balance: 2000
    }) as any;
    console.log('✅ Account updated successfully:');
    console.log(`   New nickname: ${updatedAccount.nickname}`);
    console.log(`   New balance: $${updatedAccount.balance}`);

    console.log('\n🎉 ALL NESSIE API TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('Summary of what was tested:');
    console.log('✅ Create customer');
    console.log('✅ Create account for specific customer');
    console.log('✅ Get customer by ID');
    console.log('✅ Get all customers');
    console.log('✅ Get account by ID');
    console.log('✅ Update customer');
    console.log('✅ Update account');
    console.log('\nAll methods correlate with the existing GET methods in nessieIntegration.ts!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  testNessieAPIOnly()
    .then(() => {
      console.log('\n✅ All Nessie API tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Tests failed:', error);
      process.exit(1);
    });
}

export { testNessieAPIOnly };
