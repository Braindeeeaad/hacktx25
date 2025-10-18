/**
 * Check Nessie Data and Help Create Test Data
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function checkNessieData() {
  console.log('🔍 Checking Your Nessie Data');
  console.log('='.repeat(50));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';
  const BASE_URL = 'http://api.nessieisreal.com';
  
  try {
    // Check if customer exists
    console.log('1. Checking customer...');
    const customerResponse = await fetch(`${BASE_URL}/customers/${CUSTOMER_ID}?key=${API_KEY}`);
    
    if (customerResponse.ok) {
      const customer = await customerResponse.json();
      console.log(`   ✅ Customer found: ${customer.first_name} ${customer.last_name}`);
    } else {
      console.log(`   ❌ Customer not found: ${customerResponse.status}`);
      return;
    }
    
    console.log('');
    
    // Check accounts
    console.log('2. Checking accounts...');
    const accountsResponse = await fetch(`${BASE_URL}/customers/${CUSTOMER_ID}/accounts?key=${API_KEY}`);
    
    if (accountsResponse.ok) {
      const accounts = await accountsResponse.json();
      console.log(`   📊 Found ${accounts.length} accounts`);
      
      if (accounts.length > 0) {
        accounts.forEach((account: any, index: number) => {
          console.log(`   ${index + 1}. ${account.nickname || 'Unnamed'} (${account.type}) - ID: ${account._id}`);
        });
        
        // Check transactions for each account
        console.log('');
        console.log('3. Checking transactions...');
        
        for (const account of accounts) {
          console.log(`   Checking account: ${account.nickname || 'Unnamed'} (${account._id})`);
          
          const transactionsResponse = await fetch(`${BASE_URL}/accounts/${account._id}/transactions?key=${API_KEY}`);
          
          if (transactionsResponse.ok) {
            const transactions = await transactionsResponse.json();
            console.log(`     📈 Found ${transactions.length} transactions`);
            
            if (transactions.length > 0) {
              console.log('     Sample transactions:');
              transactions.slice(0, 3).forEach((tx: any, index: number) => {
                console.log(`       ${index + 1}. ${tx.date} - ${tx.description} - $${Math.abs(tx.amount)}`);
              });
            } else {
              console.log('     ⚠️  No transactions found');
            }
          } else {
            console.log(`     ❌ Error fetching transactions: ${transactionsResponse.status}`);
          }
        }
      } else {
        console.log('   ⚠️  No accounts found. You need to create accounts first.');
        console.log('');
        console.log('   📝 To create an account, run:');
        console.log(`   curl -X POST ${BASE_URL}/customers/${CUSTOMER_ID}/accounts \\`);
        console.log('     -H "Content-Type: application/json" \\');
        console.log(`     -d \'{"type": "Checking", "nickname": "My Checking Account", "rewards": 0, "balance": 1000}\'`);
      }
    } else {
      console.log(`   ❌ Error fetching accounts: ${accountsResponse.status}`);
    }
    
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   1. If no accounts: Create an account using the curl command above');
    console.log('   2. If no transactions: Add test transactions to your account');
    console.log('   3. Then run: npx ts-node src/ai/gemini/testRunner.ts nessie');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the check if this file is executed directly
if (require.main === module) {
  checkNessieData().catch(console.error);
}

export { checkNessieData };
