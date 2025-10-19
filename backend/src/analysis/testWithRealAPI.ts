/**
 * Test with Real Gemini API Key
 * This will test the API with a real key if available
 */

import { ImpactAnalyzer } from './index';
import { Transaction } from '../gemini/index';
import { WellbeingData } from './correlationAnalyzer';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test with real API key
 */
async function testWithRealAPI() {
  console.log('🧪 TESTING WITH REAL GEMINI API KEY');
  console.log('='.repeat(50));
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'demo-key' || apiKey === 'test-key') {
    console.log('❌ No valid Gemini API key found');
    console.log('');
    console.log('To test with a real API key:');
    console.log('1. Get a key from: https://makersuite.google.com/app/apikey');
    console.log('2. Set it: export GEMINI_API_KEY="your-key-here"');
    console.log('3. Run this test again');
    return;
  }
  
  console.log(`✅ Found API key: ${apiKey.substring(0, 10)}...`);
  
  // Create test data
  const transactions: Transaction[] = [
    { date: '2024-01-01', category: 'Entertainment', amount: 50 },
    { date: '2024-01-02', category: 'Food', amount: 120 },
    { date: '2024-01-03', category: 'Self-Care', amount: 80 },
    { date: '2024-01-08', category: 'Entertainment', amount: 100 },
    { date: '2024-01-09', category: 'Food', amount: 140 },
    { date: '2024-01-10', category: 'Shopping', amount: 60 },
    { date: '2024-01-15', category: 'Entertainment', amount: 150 },
    { date: '2024-01-16', category: 'Food', amount: 160 },
    { date: '2024-01-17', category: 'Shopping', amount: 120 },
    { date: '2024-01-22', category: 'Entertainment', amount: 200 },
    { date: '2024-01-23', category: 'Food', amount: 180 },
    { date: '2024-01-24', category: 'Shopping', amount: 180 },
  ];
  
  const wellbeingData: WellbeingData[] = [
    { date: '2024-01-01', overallWellbeing: 7, stressLevel: 3, sleepQuality: 8, energyLevel: 7, mood: 6 },
    { date: '2024-01-08', overallWellbeing: 6, stressLevel: 4, sleepQuality: 7, energyLevel: 6, mood: 7 },
    { date: '2024-01-15', overallWellbeing: 5, stressLevel: 6, sleepQuality: 5, energyLevel: 5, mood: 8 },
    { date: '2024-01-22', overallWellbeing: 4, stressLevel: 8, sleepQuality: 3, energyLevel: 4, mood: 9 },
  ];
  
  console.log(`\n📊 Test data: ${transactions.length} transactions, ${wellbeingData.length} wellbeing records`);
  
  const analyzer = new ImpactAnalyzer(apiKey);
  
  try {
    console.log('\n🔍 Testing complete analysis...');
    const analysis = await analyzer.analyzeFinancialWellbeingImpact(transactions, wellbeingData);
    
    console.log('✅ Complete analysis successful!');
    console.log(`📈 Generated ${analysis.report.keyInsights.length} insights`);
    console.log(`🔗 Found ${analysis.correlations.length} correlations`);
    
    // Show first insight
    if (analysis.report.keyInsights.length > 0) {
      const firstInsight = analysis.report.keyInsights[0];
      console.log('\n💡 Sample AI Insight:');
      console.log(`   Title: ${firstInsight.title}`);
      console.log(`   Insight: ${firstInsight.insight}`);
      console.log(`   Actions: ${firstInsight.actionableAdvice.join(', ')}`);
    }
    
  } catch (error) {
    console.log('❌ Complete analysis failed:');
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  try {
    console.log('\n⚡ Testing quick insight...');
    const insight = await analyzer.generateQuickInsight(transactions.slice(-6), wellbeingData.slice(-2));
    
    console.log('✅ Quick insight successful!');
    console.log(`💡 Insight: ${insight.insight}`);
    console.log(`🎯 Action: ${insight.action}`);
    console.log(`⏰ Timeframe: ${insight.timeframe}`);
    
  } catch (error) {
    console.log('❌ Quick insight failed:');
    console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  console.log('\n🎉 API testing completed!');
}

// Run test if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  testWithRealAPI().catch(console.error);
}

export { testWithRealAPI };

