/**
 * Full Analysis Test - See Complete Gemini Output
 * This shows you the complete AI analysis with all details
 */

import { analyzeSpending, Transaction } from './index';
import { NessieAPIIntegration } from './nessieIntegration';

// Console and Node.js declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

declare const process: {
  argv: string[];
};

declare const require: {
  main: any;
};

declare const module: {
  exports: any;
};

/**
 * Display full analysis results with detailed formatting
 */
function displayFullAnalysis(analysis: any) {
  console.log('\n' + '='.repeat(80));
  console.log('🤖 COMPLETE GEMINI AI ANALYSIS RESULTS');
  console.log('='.repeat(80));
  
  // Summary Section
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(40));
  console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
  console.log(`📅 Time Span: ${analysis.summary.spanDays} days`);
  console.log(`📈 Average Daily: $${analysis.summary.averageDaily.toFixed(2)}`);
  
  // Categories Section
  console.log('\n📊 CATEGORY ANALYSIS');
  console.log('-'.repeat(40));
  analysis.categories.forEach((category: any, index: number) => {
    console.log(`\n${index + 1}. ${category.category.toUpperCase()}`);
    console.log(`   Trend: ${category.trend.toUpperCase()}`);
    console.log(`   Change: ${category.change}`);
    console.log(`   AI Insight: ${category.detailedAnalysis}`);
  });
  
  // Anomalies Section
  if (analysis.anomalies && analysis.anomalies.length > 0) {
    console.log('\n⚠️  ANOMALIES DETECTED');
    console.log('-'.repeat(40));
    analysis.anomalies.forEach((anomaly: any, index: number) => {
      console.log(`\n${index + 1}. ${anomaly.date} - ${anomaly.category}`);
      console.log(`   Amount: $${anomaly.amount}`);
      console.log(`   Reason: ${anomaly.detailedReason}`);
    });
  } else {
    console.log('\n✅ NO ANOMALIES DETECTED');
    console.log('-'.repeat(40));
    console.log('All spending patterns appear normal');
  }
  
  // Recommendations Section
  console.log('\n💡 AI RECOMMENDATIONS');
  console.log('-'.repeat(40));
  analysis.recommendations.forEach((rec: any, index: number) => {
    console.log(`\n${index + 1}. ${rec.shortInsight}`);
    console.log(`   ${rec.detailedAdvice}`);
    console.log(`   Category: ${rec.category}`);
    if (rec.linkedInsights && rec.linkedInsights.length > 0) {
      console.log(`   Linked Insights: ${rec.linkedInsights.join(', ')}`);
    }
    if (rec.linkedAnomalies && rec.linkedAnomalies.length > 0) {
      console.log(`   Linked Anomalies: ${rec.linkedAnomalies.join(', ')}`);
    }
  });

  // Wellness Tips Section
  if (analysis.wellnessTips && analysis.wellnessTips.length > 0) {
    console.log('\n🧘 WELLNESS TIPS');
    console.log('-'.repeat(40));
    analysis.wellnessTips.forEach((tip: any, index: number) => {
      console.log(`\n${index + 1}. ${tip.trigger.toUpperCase()}: ${tip.shortTip}`);
      console.log(`   ${tip.detailedTip}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🎯 ANALYSIS COMPLETE');
  console.log('='.repeat(80));
}

/**
 * Test with comprehensive dataset
 */
async function runFullAnalysisTest() {
  console.log('🚀 Starting Full Analysis Test');
  console.log('This will show you the complete Gemini AI output with detailed insights\n');
  
  // Comprehensive test dataset with various patterns
  const testTransactions: Transaction[] = [
    // Week 1 - Normal spending
    { "date": "2025-09-01", "category": "Food", "amount": 25.50 },
    { "date": "2025-09-01", "category": "Transport", "amount": 12.00 },
    { "date": "2025-09-02", "category": "Food", "amount": 18.75 },
    { "date": "2025-09-02", "category": "Entertainment", "amount": 35.00 },
    { "date": "2025-09-03", "category": "Food", "amount": 22.30 },
    { "date": "2025-09-03", "category": "Transport", "amount": 8.50 },
    { "date": "2025-09-04", "category": "Shopping", "amount": 85.00 },
    { "date": "2025-09-04", "category": "Food", "amount": 28.90 },
    { "date": "2025-09-05", "category": "Transport", "amount": 15.00 },
    { "date": "2025-09-05", "category": "Entertainment", "amount": 45.00 },
    { "date": "2025-09-06", "category": "Food", "amount": 32.15 },
    { "date": "2025-09-06", "category": "Utilities", "amount": 120.00 },
    { "date": "2025-09-07", "category": "Food", "amount": 19.80 },
    { "date": "2025-09-07", "category": "Transport", "amount": 11.25 },
    
    // Week 2 - Increasing spending
    { "date": "2025-09-08", "category": "Food", "amount": 35.20 },
    { "date": "2025-09-08", "category": "Transport", "amount": 18.00 },
    { "date": "2025-09-09", "category": "Food", "amount": 42.50 },
    { "date": "2025-09-09", "category": "Entertainment", "amount": 65.00 },
    { "date": "2025-09-10", "category": "Food", "amount": 38.75 },
    { "date": "2025-09-10", "category": "Shopping", "amount": 150.00 },
    { "date": "2025-09-11", "category": "Food", "amount": 45.30 },
    { "date": "2025-09-11", "category": "Transport", "amount": 22.00 },
    { "date": "2025-09-12", "category": "Entertainment", "amount": 85.00 },
    { "date": "2025-09-12", "category": "Food", "amount": 52.40 },
    { "date": "2025-09-13", "category": "Shopping", "amount": 200.00 },
    { "date": "2025-09-13", "category": "Food", "amount": 48.90 },
    { "date": "2025-09-14", "category": "Transport", "amount": 25.00 },
    { "date": "2025-09-14", "category": "Food", "amount": 41.25 },
    
    // Week 3 - Anomalies and patterns
    { "date": "2025-09-15", "category": "Food", "amount": 55.00 },
    { "date": "2025-09-15", "category": "Shopping", "amount": 500.00 }, // ANOMALY
    { "date": "2025-09-16", "category": "Food", "amount": 28.50 },
    { "date": "2025-09-16", "category": "Transport", "amount": 12.00 },
    { "date": "2025-09-17", "category": "Entertainment", "amount": 120.00 },
    { "date": "2025-09-17", "category": "Food", "amount": 35.75 },
    { "date": "2025-09-18", "category": "Food", "amount": 62.80 },
    { "date": "2025-09-18", "category": "Transport", "amount": 28.50 },
    { "date": "2025-09-19", "category": "Shopping", "amount": 75.00 },
    { "date": "2025-09-19", "category": "Food", "amount": 44.20 },
    { "date": "2025-09-20", "category": "Entertainment", "amount": 95.00 },
    { "date": "2025-09-20", "category": "Food", "amount": 58.90 },
    { "date": "2025-09-21", "category": "Transport", "amount": 32.00 },
    { "date": "2025-09-21", "category": "Food", "amount": 47.35 },
    
    // Week 4 - Final week
    { "date": "2025-09-22", "category": "Food", "amount": 38.50 },
    { "date": "2025-09-22", "category": "Utilities", "amount": 95.00 },
    { "date": "2025-09-23", "category": "Food", "amount": 42.75 },
    { "date": "2025-09-23", "category": "Transport", "amount": 18.00 },
    { "date": "2025-09-24", "category": "Shopping", "amount": 125.00 },
    { "date": "2025-09-24", "category": "Food", "amount": 36.90 },
    { "date": "2025-09-25", "category": "Entertainment", "amount": 75.00 },
    { "date": "2025-09-25", "category": "Food", "amount": 41.25 },
    { "date": "2025-09-26", "category": "Transport", "amount": 22.50 },
    { "date": "2025-09-26", "category": "Food", "amount": 33.80 },
    { "date": "2025-09-27", "category": "Food", "amount": 49.50 },
    { "date": "2025-09-27", "category": "Entertainment", "amount": 110.00 },
    { "date": "2025-09-28", "category": "Food", "amount": 28.75 },
    { "date": "2025-09-28", "category": "Transport", "amount": 15.00 }
  ];
  
  console.log(`📊 Analyzing ${testTransactions.length} transactions...`);
  console.log('📅 Date Range: 2025-09-01 to 2025-09-28 (28 days)');
  console.log('🎯 This dataset includes:');
  console.log('   • Normal spending patterns');
  console.log('   • Increasing trends over time');
  console.log('   • Anomalies (large purchases)');
  console.log('   • Multiple categories with different patterns\n');
  
  try {
    console.log('🤖 Sending data to Gemini 2.5 Pro for analysis...\n');
    
    const analysis = await analyzeSpending(testTransactions);
    
    // Display the complete analysis
    displayFullAnalysis(analysis);
    
    // Additional insights
    console.log('\n🔍 ADDITIONAL INSIGHTS');
    console.log('-'.repeat(40));
    console.log(`📈 Total Categories: ${analysis.categories.length}`);
    console.log(`⚠️  Anomalies Found: ${analysis.anomalies.length}`);
    console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
    console.log(`📊 Data Quality: ${testTransactions.length} transactions analyzed`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    return null;
  }
}

/**
 * Test with your custom dataset
 */
async function testWithCustomData() {
  console.log('🎯 Testing with Your Custom Dataset');
  console.log('This will analyze the same data from the custom test\n');
  
  // Your custom transaction data
  const customTransactions: Transaction[] = [
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
    { "date": "2025-10-09", "category": "Transport", "amount": 22.00 },
    { "date": "2025-10-09", "category": "Food", "amount": 41.50 },
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
  
  console.log(`📊 Analyzing ${customTransactions.length} custom transactions...`);
  console.log('📅 Date Range: 2025-09-29 to 2025-10-14 (16 days)');
  console.log('🎯 This dataset includes:');
  console.log('   • Your custom spending patterns');
  console.log('   • Anomaly: $500 shopping purchase');
  console.log('   • Rent payment: $950');
  console.log('   • Multiple categories with trends\n');
  
  try {
    console.log('🤖 Sending data to Gemini 2.5 Pro for analysis...\n');
    
    const analysis = await analyzeSpending(customTransactions);
    
    // Display the complete analysis
    displayFullAnalysis(analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    return null;
  }
}

/**
 * Test with Nessie API data
 */
async function testWithNessieData() {
  console.log('🎯 Testing with Nessie API Data');
  console.log('This will analyze your real spending data from Nessie API');
  
  try {
    // Initialize Nessie integration
    const nessie = new NessieAPIIntegration(
      '2535e8ec7de75e2bb33a7e0bab0cc897',        // Your actual API key
      '68f4080c9683f20dd519f005',           // Your actual customer ID
      'http://api.nessieisreal.com' // Base URL
    );
    
    console.log('🔍 Fetching data from Nessie API...');
    
    // Get transactions from last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    console.log(`📅 Date Range: ${startDateStr} to ${endDateStr} (30 days)`);
    
    const transactions = await nessie.getAllTransactions(startDateStr, endDateStr);
    
    console.log(`📊 Found ${transactions.length} transactions from Nessie API`);
    console.log('🎯 This dataset includes:');
    console.log('   • Real spending data from your Nessie account');
    console.log('   • Multiple categories with actual patterns');
    console.log('   • Authentic spending behavior analysis\n');
    
    console.log('🤖 Sending data to Gemini 2.5 Pro for analysis...\n');
    
    const analysis = await analyzeSpending(transactions);
    
    // Display the complete analysis
    displayFullAnalysis(analysis);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Nessie analysis failed:', error);
    return null;
  }
}

/**
 * Main function to run the full analysis test
 */
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'comprehensive';
  
  console.log('🚀 FULL ANALYSIS TEST - See Complete Gemini Output');
  console.log('='.repeat(60));
  
  switch (testType) {
    case 'comprehensive':
      await runFullAnalysisTest();
      break;
    case 'custom':
      await testWithCustomData();
      break;
    case 'nessie':
      await testWithNessieData();
      break;
    default:
      console.log('Available test types:');
      console.log('  comprehensive - Full analysis with comprehensive dataset');
      console.log('  custom        - Analysis with your custom dataset');
      console.log('  nessie        - Analysis with your Nessie API data');
      console.log('\nUsage: npx ts-node src/ai/gemini/fullAnalysisTest.ts [testType]');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { runFullAnalysisTest, testWithCustomData, displayFullAnalysis };
