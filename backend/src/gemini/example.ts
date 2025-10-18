/**
 * Example usage of the AI spending analysis module
 */

import { analyzeSpending, Transaction } from './index';

// Sample transaction data
const sampleTransactions: Transaction[] = [
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  { "date": "2025-09-30", "category": "Food", "amount": 35.50 },
  { "date": "2025-09-30", "category": "Entertainment", "amount": 25.00 },
  { "date": "2025-10-01", "category": "Food", "amount": 28.25 },
  { "date": "2025-10-01", "category": "Transport", "amount": 15.00 },
  { "date": "2025-10-02", "category": "Shopping", "amount": 120.00 },
  { "date": "2025-10-02", "category": "Food", "amount": 42.00 },
  { "date": "2025-10-03", "category": "Shopping", "amount": 500.00 }, // Anomaly
  { "date": "2025-10-03", "category": "Food", "amount": 18.50 },
  { "date": "2025-10-04", "category": "Transport", "amount": 12.00 },
  { "date": "2025-10-04", "category": "Entertainment", "amount": 45.00 },
  { "date": "2025-10-05", "category": "Food", "amount": 38.75 },
  { "date": "2025-10-05", "category": "Utilities", "amount": 85.00 },
  { "date": "2025-10-06", "category": "Food", "amount": 31.25 },
  { "date": "2025-10-06", "category": "Transport", "amount": 8.50 },
  { "date": "2025-10-07", "category": "Entertainment", "amount": 60.00 },
  { "date": "2025-10-07", "category": "Food", "amount": 29.00 },
  { "date": "2025-10-08", "category": "Shopping", "amount": 75.00 },
  { "date": "2025-10-08", "category": "Food", "amount": 33.50 },
  { "date": "2025-10-09", "category": "Transport", "amount": 18.00 },
  { "date": "2025-10-09", "category": "Utilities", "amount": 95.00 },
  { "date": "2025-10-10", "category": "Rent", "amount": 950.00 },
  { "date": "2025-10-10", "category": "Food", "amount": 26.75 },
  { "date": "2025-10-11", "category": "Food", "amount": 44.00 },
  { "date": "2025-10-11", "category": "Entertainment", "amount": 35.00 },
  { "date": "2025-10-12", "category": "Shopping", "amount": 150.00 },
  { "date": "2025-10-12", "category": "Food", "amount": 37.25 },
  { "date": "2025-10-13", "category": "Transport", "amount": 22.00 },
  { "date": "2025-10-13", "category": "Food", "amount": 41.50 },
  { "date": "2025-10-14", "category": "Entertainment", "amount": 80.00 },
  { "date": "2025-10-14", "category": "Food", "amount": 32.00 }
];

async function runExample() {
  console.log('🚀 Starting AI spending analysis...');
  console.log(`📊 Analyzing ${sampleTransactions.length} transactions`);
  
  try {
    const analysis = await analyzeSpending(sampleTransactions);
    
    console.log('\n📈 Analysis Results:');
    console.log('==================');
    
    console.log('\n💰 Summary:');
    console.log(`Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);
    console.log(`Time Span: ${analysis.summary.spanDays} days`);
    
    console.log('\n📊 Category Analysis:');
    analysis.categories.forEach(category => {
      console.log(`${category.category}: ${category.trend} (${category.change}) - ${category.note}`);
    });
    
    if (analysis.anomalies.length > 0) {
      console.log('\n⚠️  Anomalies Detected:');
      analysis.anomalies.forEach(anomaly => {
        console.log(`${anomaly.date} - ${anomaly.category}: $${anomaly.amount} (${anomaly.reason})`);
      });
    }
    
    console.log('\n💡 Recommendations:');
    analysis.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

export { runExample, sampleTransactions };
