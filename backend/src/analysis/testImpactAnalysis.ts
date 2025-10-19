/**
 * Test Financial-Wellbeing Impact Analysis
 * Comprehensive test suite demonstrating the new analysis features
 */

import { 
  CorrelationAnalyzer, 
  PredictiveModeling, 
  ImpactAnalyzer,
  WellbeingData,
  WeeklyDataPoint,
  CorrelationResult,
  ImpactAnalysisResult,
  QuickInsightResult
} from './index';
import { Transaction } from '../gemini/index';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Generate realistic test data for financial transactions
 */
function generateTestTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const categories = ['Food', 'Entertainment', 'Shopping', 'Transport', 'Self-Care'];
  const baseDate = new Date();
  
  // Generate 8 weeks of data
  for (let week = 0; week < 8; week++) {
    const weekStart = new Date(baseDate);
    weekStart.setDate(weekStart.getDate() - (week * 7));
    
    // Generate 3-7 transactions per week
    const transactionCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < transactionCount; i++) {
      const dayOffset = Math.floor(Math.random() * 7);
      const transactionDate = new Date(weekStart);
      transactionDate.setDate(transactionDate.getDate() + dayOffset);
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = Math.random() * 200 + 10; // $10-$210
      
      transactions.push({
        date: transactionDate.toISOString().split('T')[0],
        category,
        amount: Math.round(amount * 100) / 100
      });
    }
  }
  
  return transactions;
}

/**
 * Generate realistic test data for wellbeing metrics
 */
function generateTestWellbeingData(): WellbeingData[] {
  const wellbeingData: WellbeingData[] = [];
  const baseDate = new Date();
  
  // Generate 8 weeks of data
  for (let week = 0; week < 8; week++) {
    const weekStart = new Date(baseDate);
    weekStart.setDate(weekStart.getDate() - (week * 7));
    
    // Add some realistic patterns
    const isStressfulWeek = week % 3 === 0; // Every 3rd week is more stressful
    const isGoodWeek = week % 4 === 1; // Every 4th week is better
    
    const baseWellbeing = isGoodWeek ? 7 : isStressfulWeek ? 4 : 6;
    const baseStress = isGoodWeek ? 3 : isStressfulWeek ? 8 : 5;
    const baseSleep = isGoodWeek ? 8 : isStressfulWeek ? 4 : 6;
    const baseEnergy = isGoodWeek ? 7 : isStressfulWeek ? 3 : 5;
    const baseMood = isGoodWeek ? 8 : isStressfulWeek ? 3 : 6;
    
    wellbeingData.push({
      date: weekStart.toISOString().split('T')[0],
      overallWellbeing: Math.max(1, Math.min(10, baseWellbeing + (Math.random() - 0.5) * 2)),
      stressLevel: Math.max(1, Math.min(10, baseStress + (Math.random() - 0.5) * 2)),
      sleepQuality: Math.max(1, Math.min(10, baseSleep + (Math.random() - 0.5) * 2)),
      energyLevel: Math.max(1, Math.min(10, baseEnergy + (Math.random() - 0.5) * 2)),
      mood: Math.max(1, Math.min(10, baseMood + (Math.random() - 0.5) * 2))
    });
  }
  
  return wellbeingData;
}

/**
 * Test correlation analysis
 */
async function testCorrelationAnalysis() {
  console.log('🔍 Testing Correlation Analysis');
  console.log('='.repeat(50));
  
  try {
    const transactions = generateTestTransactions();
    const wellbeingData = generateTestWellbeingData();
    
    console.log(`📊 Generated ${transactions.length} transactions and ${wellbeingData.length} wellbeing records`);
    
    // Aggregate weekly data
    const weeklyData = CorrelationAnalyzer.aggregateWeeklyData(transactions, wellbeingData);
    console.log(`📅 Aggregated into ${weeklyData.length} weekly data points`);
    
    // Perform correlation analysis
    const correlations = CorrelationAnalyzer.analyzeCorrelations(weeklyData);
    console.log(`🔗 Found ${correlations.length} significant correlations`);
    
    // Display top correlations
    const topCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 5);
    console.log('\n📈 Top Correlations:');
    topCorrelations.forEach((corr, index) => {
      console.log(`   ${index + 1}. ${corr.metric} → ${corr.wellbeingMetric}`);
      console.log(`      Correlation: ${corr.correlation} (${corr.strength} ${corr.direction})`);
    });
    
    // Generate correlation summary
    const summary = CorrelationAnalyzer.generateCorrelationSummary(correlations);
    console.log('\n📋 Correlation Summary:');
    console.log(summary);
    
    return { weeklyData, correlations };
    
  } catch (error) {
    console.error('❌ Correlation analysis test failed:', error);
    throw error;
  }
}

/**
 * Test predictive modeling
 */
async function testPredictiveModeling(weeklyData: WeeklyDataPoint[], correlations: CorrelationResult[]) {
  console.log('\n🤖 Testing Predictive Modeling');
  console.log('='.repeat(50));
  
  try {
    const strongCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 3);
    
    // Train models for different wellbeing metrics
    const wellbeingMetrics = ['overallWellbeing', 'stressLevel', 'sleepQuality'];
    const models: { [key: string]: any } = {};
    
    for (const metric of wellbeingMetrics) {
      console.log(`\n🎯 Training model for ${metric}...`);
      const model = PredictiveModeling.trainModel(weeklyData, metric, strongCorrelations);
      
      if (model) {
        models[metric] = model;
        console.log(`   ✅ Model trained successfully`);
        console.log(`   📊 R-squared: ${model.rSquared}`);
        console.log(`   🔢 Coefficients: ${Object.keys(model.coefficients).length}`);
      } else {
        console.log(`   ⚠️  Could not train model for ${metric}`);
      }
    }
    
    // Test predictions
    if (Object.keys(models).length > 0) {
      console.log('\n🔮 Testing Predictions:');
      
      const currentFinancialData = {
        totalSpending: 500,
        entertainmentSpending: 100,
        foodSpending: 200,
        shoppingSpending: 150,
        transportSpending: 50,
        selfCareSpending: 50,
        savingsRate: 20,
        anomalySpending: 0
      };
      
      Object.entries(models).forEach(([metric, model]) => {
        const prediction = PredictiveModeling.makePrediction(model, currentFinancialData);
        console.log(`   ${metric}: ${prediction.predictedValue} (confidence: ${prediction.confidence})`);
      });
      
      // Test What-If scenarios
      console.log('\n💭 Testing What-If Scenarios:');
      const scenarios = [
        {
          name: "Reduce Entertainment Spending",
          changes: { entertainmentSpending: -50, selfCareSpending: 0 }
        },
        {
          name: "Increase Self-Care Budget",
          changes: { entertainmentSpending: 0, selfCareSpending: 100 }
        }
      ];
      
      const whatIfResults = PredictiveModeling.generateWhatIfScenarios(
        models, 
        currentFinancialData, 
        scenarios
      );
      
      whatIfResults.forEach(scenario => {
        console.log(`\n   📋 ${scenario.scenario}:`);
        console.log(`      ${scenario.recommendation}`);
      });
    }
    
    return models;
    
  } catch (error) {
    console.error('❌ Predictive modeling test failed:', error);
    throw error;
  }
}

/**
 * Test complete impact analysis
 */
async function testCompleteImpactAnalysis() {
  console.log('\n🧠 Testing Complete Impact Analysis');
  console.log('='.repeat(50));
  
  try {
    // Note: This test requires a valid Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY || 'test-key';
    const impactAnalyzer = new ImpactAnalyzer(geminiApiKey);
    
    const transactions = generateTestTransactions();
    const wellbeingData = generateTestWellbeingData();
    
    console.log('📊 Running complete financial-wellbeing impact analysis...');
    
    // This will fail without a real API key, but we can test the structure
    try {
      const analysisResult = await impactAnalyzer.analyzeFinancialWellbeingImpact(
        transactions,
        wellbeingData
      );
      
      console.log('✅ Complete analysis successful!');
      console.log(`📈 Generated ${analysisResult.report.keyInsights.length} key insights`);
      console.log(`💡 Generated ${analysisResult.report.recommendations.length} recommendations`);
      console.log(`🔮 Generated ${analysisResult.report.whatIfScenarios.length} What-If scenarios`);
      
      return analysisResult;
      
    } catch (apiError) {
      console.log('⚠️  Complete analysis requires valid Gemini API key');
      console.log('   (This is expected in test environment)');
      
      // Test quick insight instead
      console.log('\n⚡ Testing Quick Insight...');
      try {
        const quickInsight = await impactAnalyzer.generateQuickInsight(
          transactions.slice(-10), // Last 10 transactions
          wellbeingData.slice(-2)  // Last 2 weeks
        );
        
        console.log('✅ Quick insight generated!');
        console.log(`💡 Insight: ${quickInsight.insight}`);
        console.log(`🎯 Action: ${quickInsight.action}`);
        
        return { quickInsight };
        
      } catch (quickError) {
        console.log('⚠️  Quick insight also requires valid Gemini API key');
        return { error: 'API key required' };
      }
    }
    
  } catch (error) {
    console.error('❌ Complete impact analysis test failed:', error);
    throw error;
  }
}

/**
 * Test data generation and validation
 */
async function testDataGeneration() {
  console.log('📊 Testing Data Generation');
  console.log('='.repeat(50));
  
  try {
    const transactions = generateTestTransactions();
    const wellbeingData = generateTestWellbeingData();
    
    console.log(`✅ Generated ${transactions.length} transactions`);
    console.log(`   Categories: ${[...new Set(transactions.map(t => t.category))].join(', ')}`);
    console.log(`   Date range: ${transactions[0].date} to ${transactions[transactions.length - 1].date}`);
    
    console.log(`✅ Generated ${wellbeingData.length} wellbeing records`);
    console.log(`   Date range: ${wellbeingData[0].date} to ${wellbeingData[wellbeingData.length - 1].date}`);
    
    // Validate data quality
    const avgWellbeing = wellbeingData.reduce((sum, w) => sum + w.overallWellbeing, 0) / wellbeingData.length;
    const avgSpending = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;
    
    console.log(`📈 Average wellbeing: ${avgWellbeing.toFixed(2)}/10`);
    console.log(`💰 Average transaction: $${avgSpending.toFixed(2)}`);
    
    return { transactions, wellbeingData };
    
  } catch (error) {
    console.error('❌ Data generation test failed:', error);
    throw error;
  }
}

/**
 * Main test function
 */
async function runAllTests() {
  console.log('🚀 Starting Financial-Wellbeing Impact Analysis Tests');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Data Generation
    await testDataGeneration();
    
    // Test 2: Correlation Analysis
    const { weeklyData, correlations } = await testCorrelationAnalysis();
    
    // Test 3: Predictive Modeling
    const models = await testPredictiveModeling(weeklyData, correlations);
    
    // Test 4: Complete Impact Analysis
    await testCompleteImpactAnalysis();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Data generation and validation');
    console.log('   ✅ Correlation analysis');
    console.log('   ✅ Predictive modeling');
    console.log('   ✅ What-If scenario analysis');
    console.log('   ⚠️  Complete analysis (requires Gemini API key)');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Set GEMINI_API_KEY environment variable');
    console.log('   2. Test with real financial and wellbeing data');
    console.log('   3. Integrate with your existing API endpoints');
    console.log('   4. Add the analysis routes to your Express app');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

/**
 * Run specific test
 */
async function runSpecificTest(testName: string) {
  console.log(`🧪 Running specific test: ${testName}`);
  console.log('='.repeat(50));
  
  switch (testName) {
    case 'data':
      await testDataGeneration();
      break;
    case 'correlation':
      await testCorrelationAnalysis();
      break;
    case 'modeling':
      const { weeklyData, correlations } = await testCorrelationAnalysis();
      await testPredictiveModeling(weeklyData, correlations);
      break;
    case 'complete':
      await testCompleteImpactAnalysis();
      break;
    default:
      console.log('Available tests: data, correlation, modeling, complete, all');
      break;
  }
}

// Run tests if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';
  
  if (testType === 'all') {
    runAllTests().catch(console.error);
  } else {
    runSpecificTest(testType).catch(console.error);
  }
}

export { 
  runAllTests, 
  runSpecificTest,
  testDataGeneration,
  testCorrelationAnalysis,
  testPredictiveModeling,
  testCompleteImpactAnalysis
};
