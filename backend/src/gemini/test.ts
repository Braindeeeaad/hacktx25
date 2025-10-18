/**
 * Simple test file for the AI spending analysis module
 */

import { analyzeSpending, Transaction } from './index';

// Note: Update the GEMINI_API_KEY constant in analyzeSpending.ts with your actual API key for testing

// Test data
const testTransactions: Transaction[] = [
  { "date": "2025-10-01", "category": "Food", "amount": 25.00 },
  { "date": "2025-10-02", "category": "Food", "amount": 30.00 },
  { "date": "2025-10-03", "category": "Transport", "amount": 15.00 },
  { "date": "2025-10-04", "category": "Shopping", "amount": 100.00 },
  { "date": "2025-10-05", "category": "Food", "amount": 35.00 }
];

async function runTests() {
  console.log('🧪 Running AI spending analysis tests...');
  
  try {
    // Test 1: Basic functionality
    console.log('\n1. Testing basic analysis...');
    const result = await analyzeSpending(testTransactions);
    
    // Verify result structure
    if (!result.summary || !result.categories || !result.anomalies || !result.recommendations) {
      throw new Error('Invalid result structure');
    }
    
    console.log('✅ Basic analysis test passed');
    
    // Test 2: Summary calculations
    console.log('\n2. Testing summary calculations...');
    const expectedTotal = testTransactions.reduce((sum, t) => sum + t.amount, 0);
    if (result.summary.totalSpent !== expectedTotal) {
      throw new Error(`Total spent mismatch: expected ${expectedTotal}, got ${result.summary.totalSpent}`);
    }
    
    console.log('✅ Summary calculations test passed');
    
    // Test 3: Category analysis
    console.log('\n3. Testing category analysis...');
    const categories = result.categories.map(c => c.category);
    const expectedCategories = [...new Set(testTransactions.map(t => t.category))];
    
    for (const expectedCategory of expectedCategories) {
      if (!categories.includes(expectedCategory)) {
        throw new Error(`Missing category: ${expectedCategory}`);
      }
    }
    
    console.log('✅ Category analysis test passed');
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
