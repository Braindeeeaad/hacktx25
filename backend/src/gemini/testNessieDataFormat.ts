/**
 * Test Nessie API Data Format
 * Check the exact format of the transaction data
 */

import axios from 'axios';

// Set environment variables directly
process.env.NESSIE_API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

async function testNessieDataFormat() {
  console.log('🔍 Nessie API Data Format Test');
  console.log('================================');
  
  const NESSIE_API_KEY = process.env.NESSIE_API_KEY;
  const customerId = '68f4080c9683f20dd519f005';
  const accountId = '68f4080c9683f20dd519f006';

  try {
    console.log('\n1️⃣ Getting purchases from Nessie...');
    
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
      console.log('\n📊 Sample transaction data:');
      const sampleTx = purchasesResponse.data[0];
      console.log('Raw transaction object:');
      console.log(JSON.stringify(sampleTx, null, 2));
      
      console.log('\n🔍 Field analysis:');
      console.log(`_id: ${sampleTx._id}`);
      console.log(`purchase_date: ${sampleTx.purchase_date}`);
      console.log(`amount: ${sampleTx.amount} (type: ${typeof sampleTx.amount})`);
      console.log(`description: ${sampleTx.description}`);
      console.log(`merchant_id: ${sampleTx.merchant_id}`);
      console.log(`category: ${sampleTx.category}`);
      console.log(`medium: ${sampleTx.medium}`);
      
      // Test the mapping we're using
      console.log('\n🔄 Testing our mapping:');
      const mappedTx = {
        id: sampleTx._id,
        date: sampleTx.purchase_date,
        merchant: sampleTx.merchant_id || 'Unknown Merchant',
        amount: sampleTx.amount,
        category: sampleTx.category || 'Other',
        description: sampleTx.description,
        type: 'debit'
      };
      console.log('Mapped transaction:');
      console.log(JSON.stringify(mappedTx, null, 2));
      
      // Calculate total from first 5 transactions
      console.log('\n💰 Testing amount calculations:');
      const firstFive = purchasesResponse.data.slice(0, 5);
      let total = 0;
      firstFive.forEach((tx: any, index: number) => {
        const amount = parseFloat(tx.amount);
        total += amount;
        console.log(`Transaction ${index + 1}: $${amount} (${tx.description})`);
      });
      console.log(`Total from first 5: $${total.toFixed(2)}`);
      
      // Calculate total from all transactions
      const allTotal = purchasesResponse.data.reduce((sum: number, tx: any) => {
        return sum + parseFloat(tx.amount);
      }, 0);
      console.log(`Total from all ${purchasesResponse.data.length} transactions: $${allTotal.toFixed(2)}`);
      
    } else {
      console.log('⚠️ No transactions found');
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
  testNessieDataFormat();
}
