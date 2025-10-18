/**
 * Add Test Data to Nessie API
 * This will help you add sample transactions for testing
 */

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const fetch: (url: string, options?: any) => Promise<Response>;

async function addTestData() {
  console.log('📊 Adding Test Data to Nessie API');
  console.log('='.repeat(50));
  
  const API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
  const CUSTOMER_ID = '68f4080c9683f20dd519f005';
  const ACCOUNT_ID = '68f4080c9683f20dd519f006';
  const BASE_URL = 'http://api.nessieisreal.com';
  
  // Sample transactions to add
  const testTransactions = [
    {
      type: 'purchase',
      amount: -25.50,
      description: 'STARBUCKS #1234',
      date: '2025-09-29'
    },
    {
      type: 'purchase',
      amount: -10.00,
      description: 'UBER RIDE',
      date: '2025-09-29'
    },
    {
      type: 'purchase',
      amount: -35.50,
      description: 'GROCERY STORE',
      date: '2025-09-30'
    },
    {
      type: 'purchase',
      amount: -18.75,
      description: 'COFFEE SHOP',
      date: '2025-10-01'
    },
    {
      type: 'purchase',
      amount: -42.00,
      description: 'RESTAURANT',
      date: '2025-10-01'
    },
    {
      type: 'purchase',
      amount: -120.00,
      description: 'SHOPPING MALL',
      date: '2025-10-02'
    },
    {
      type: 'purchase',
      amount: -500.00,
      description: 'LARGE PURCHASE',
      date: '2025-10-03'
    },
    {
      type: 'purchase',
      amount: -15.00,
      description: 'GAS STATION',
      date: '2025-10-04'
    },
    {
      type: 'purchase',
      amount: -28.90,
      description: 'PHARMACY',
      date: '2025-10-05'
    },
    {
      type: 'purchase',
      amount: -75.00,
      description: 'ENTERTAINMENT',
      date: '2025-10-06'
    }
  ];
  
  console.log(`📝 Adding ${testTransactions.length} test transactions...`);
  console.log(`🏦 Account: ${ACCOUNT_ID}`);
  console.log('');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < testTransactions.length; i++) {
    const transaction = testTransactions[i];
    
    try {
      console.log(`Adding transaction ${i + 1}/${testTransactions.length}: ${transaction.description} - $${Math.abs(transaction.amount)}`);
      
      const response = await fetch(`${BASE_URL}/accounts/${ACCOUNT_ID}/transactions?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Success! Transaction ID: ${result.objectCreated?._id || 'Unknown'}`);
        successCount++;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${response.status} ${response.statusText} - ${errorText}`);
        errorCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      errorCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log('📊 Results:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  
  if (successCount > 0) {
    console.log('');
    console.log('🎉 Test data added successfully!');
    console.log('Now you can run: npx ts-node src/ai/gemini/testRunner.ts nessie');
  } else {
    console.log('');
    console.log('❌ No transactions were added. Check your API key and account ID.');
  }
}

// Run the script if this file is executed directly
if (require.main === module) {
  addTestData().catch(console.error);
}

export { addTestData };
