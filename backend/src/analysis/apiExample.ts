/**
 * API Example - Shows how to use the Financial-Wellbeing Impact Analysis API
 * Demonstrates the actual API calls and responses
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
 * Create sample data for API demonstration
 */
function createSampleData() {
  const transactions: Transaction[] = [
    // Week 1: Low spending, good wellbeing
    { date: '2024-01-01', category: 'Entertainment', amount: 30 },
    { date: '2024-01-02', category: 'Food', amount: 120 },
    { date: '2024-01-03', category: 'Self-Care', amount: 50 },
    { date: '2024-01-04', category: 'Transport', amount: 35 },
    
    // Week 2: Medium spending, okay wellbeing
    { date: '2024-01-08', category: 'Entertainment', amount: 80 },
    { date: '2024-01-09', category: 'Food', amount: 140 },
    { date: '2024-01-10', category: 'Shopping', amount: 60 },
    { date: '2024-01-11', category: 'Self-Care', amount: 30 },
    { date: '2024-01-12', category: 'Transport', amount: 40 },
    
    // Week 3: High spending, poor wellbeing
    { date: '2024-01-15', category: 'Entertainment', amount: 150 },
    { date: '2024-01-16', category: 'Food', amount: 180 },
    { date: '2024-01-17', category: 'Shopping', amount: 120 },
    { date: '2024-01-18', category: 'Self-Care', amount: 20 },
    { date: '2024-01-19', category: 'Transport', amount: 45 },
    
    // Week 4: Very high spending, very poor wellbeing
    { date: '2024-01-22', category: 'Entertainment', amount: 200 },
    { date: '2024-01-23', category: 'Food', amount: 160 },
    { date: '2024-01-24', category: 'Shopping', amount: 180 },
    { date: '2024-01-25', category: 'Self-Care', amount: 10 },
    { date: '2024-01-26', category: 'Transport', amount: 50 },
    
    // Week 5: Moderate spending, recovering wellbeing
    { date: '2024-01-29', category: 'Entertainment', amount: 60 },
    { date: '2024-01-30', category: 'Food', amount: 130 },
    { date: '2024-01-31', category: 'Self-Care', amount: 80 },
    { date: '2024-02-01', category: 'Transport', amount: 38 },
  ];
  
  const wellbeingData: WellbeingData[] = [
    { date: '2024-01-01', overallWellbeing: 8, stressLevel: 2, sleepQuality: 9, energyLevel: 8, mood: 7 },
    { date: '2024-01-08', overallWellbeing: 6, stressLevel: 4, sleepQuality: 7, energyLevel: 6, mood: 6 },
    { date: '2024-01-15', overallWellbeing: 4, stressLevel: 7, sleepQuality: 5, energyLevel: 4, mood: 5 },
    { date: '2024-01-22', overallWellbeing: 3, stressLevel: 9, sleepQuality: 3, energyLevel: 3, mood: 4 },
    { date: '2024-01-29', overallWellbeing: 6, stressLevel: 5, sleepQuality: 6, energyLevel: 6, mood: 6 },
  ];
  
  return { transactions, wellbeingData };
}

/**
 * Demonstrate the complete analysis API
 */
async function demonstrateCompleteAnalysis() {
  console.log('🧠 COMPLETE FINANCIAL-WELLBEING IMPACT ANALYSIS');
  console.log('='.repeat(60));
  
  const { transactions, wellbeingData } = createSampleData();
  
  console.log('\n📊 Sample Data:');
  console.log(`   Transactions: ${transactions.length} records`);
  console.log(`   Wellbeing data: ${wellbeingData.length} records`);
  console.log('   Time span: 5 weeks');
  
  // Initialize analyzer (without real API key for demo)
  const analyzer = new ImpactAnalyzer(process.env.GEMINI_API_KEY || 'demo-key');
  
  try {
    console.log('\n🔍 Running complete analysis...');
    const analysis = await analyzer.analyzeFinancialWellbeingImpact(transactions, wellbeingData);
    
    console.log('\n📈 ANALYSIS RESULTS:');
    console.log('='.repeat(40));
    
    // Show metadata
    console.log(`\n📅 Analysis Date: ${analysis.metadata.analysisDate}`);
    console.log(`📊 Data Points: ${analysis.metadata.dataPoints} weeks`);
    console.log(`📅 Time Range: ${analysis.metadata.timeRange.start} to ${analysis.metadata.timeRange.end}`);
    
    // Show correlations
    console.log(`\n🔗 Key Correlations Found: ${analysis.correlations.length}`);
    analysis.correlations.slice(0, 5).forEach((corr, index) => {
      const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
      const strength = corr.strength === 'strong' ? '🔴' : corr.strength === 'moderate' ? '🟡' : '🟢';
      console.log(`   ${index + 1}. ${strength} ${corr.metric} ${direction} ${corr.wellbeingMetric} (${corr.correlation})`);
    });
    
    // Show AI insights
    console.log(`\n💡 AI-Generated Insights: ${analysis.report.keyInsights.length}`);
    analysis.report.keyInsights.forEach((insight, index) => {
      console.log(`\n   ${index + 1}. ${insight.title}`);
      console.log(`      ${insight.insight}`);
      console.log(`      Actions: ${insight.actionableAdvice.join(', ')}`);
      console.log(`      Priority: ${insight.priority} | Confidence: ${insight.confidence}`);
    });
    
    // Show recommendations
    console.log(`\n🎯 Recommendations: ${analysis.report.recommendations.length}`);
    analysis.report.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Show What-If scenarios
    console.log(`\n🔮 What-If Scenarios: ${analysis.report.whatIfScenarios.length}`);
    analysis.report.whatIfScenarios.forEach((scenario, index) => {
      console.log(`\n   ${index + 1}. ${scenario.scenario}`);
      console.log(`      Changes: ${Object.entries(scenario.changes).map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}$${v}`).join(', ')}`);
      console.log(`      Recommendation: ${scenario.recommendation}`);
    });
    
    return analysis;
    
  } catch (error) {
    console.log('\n⚠️  Complete analysis requires valid Gemini API key');
    console.log('   (This is expected in demo environment)');
    
    // Show what the API would return
    console.log('\n📋 EXPECTED API RESPONSE:');
    console.log('='.repeat(40));
    console.log(JSON.stringify({
      success: true,
      data: {
        report: {
          summary: "Your data shows strong correlations between spending patterns and wellbeing metrics.",
          keyInsights: [
            {
              title: "Entertainment Spending Affects Sleep",
              insight: "Higher entertainment spending correlates with worse sleep quality.",
              actionableAdvice: ["Limit entertainment spending to $80/week for better sleep"],
              confidence: "high",
              priority: "high",
              category: "lifestyle"
            }
          ],
          recommendations: [
            "Track your spending patterns weekly",
            "Monitor your wellbeing metrics daily"
          ],
          whatIfScenarios: [],
          nextSteps: [
            "Continue collecting data for better insights",
            "Focus on the strongest correlations first"
          ]
        },
        correlations: [
          {
            metric: "entertainmentSpending",
            wellbeingMetric: "sleepQuality",
            correlation: -0.8,
            strength: "strong",
            direction: "negative"
          }
        ],
        metadata: {
          analysisDate: new Date().toISOString(),
          dataPoints: 5,
          timeRange: { start: "2024-01-01", end: "2024-02-01" }
        }
      },
      message: "Financial-wellbeing impact analysis completed successfully"
    }, null, 2));
    
    return null;
  }
}

/**
 * Demonstrate the quick insight API
 */
async function demonstrateQuickInsight() {
  console.log('\n\n⚡ QUICK INSIGHT API DEMONSTRATION');
  console.log('='.repeat(60));
  
  const { transactions, wellbeingData } = createSampleData();
  
  // Get recent data for quick insight
  const recentTransactions = transactions.slice(-8); // Last 8 transactions
  const recentWellbeing = wellbeingData.slice(-2); // Last 2 weeks
  
  console.log('\n📊 Recent Data for Quick Insight:');
  console.log(`   Recent transactions: ${recentTransactions.length}`);
  console.log(`   Recent wellbeing: ${recentWellbeing.length} records`);
  
  const analyzer = new ImpactAnalyzer(process.env.GEMINI_API_KEY || 'demo-key');
  
  try {
    console.log('\n🔍 Generating quick insight...');
    const insight = await analyzer.generateQuickInsight(recentTransactions, recentWellbeing);
    
    console.log('\n💡 QUICK INSIGHT RESULT:');
    console.log('='.repeat(40));
    console.log(`Insight: ${insight.insight}`);
    console.log(`Action: ${insight.action}`);
    console.log(`Expected Impact: ${insight.expectedImpact}`);
    console.log(`Timeframe: ${insight.timeframe}`);
    console.log(`Confidence: ${insight.confidence}`);
    
    return insight;
    
  } catch (error) {
    console.log('\n⚠️  Quick insight requires valid Gemini API key');
    console.log('   (This is expected in demo environment)');
    
    // Show what the API would return
    console.log('\n📋 EXPECTED API RESPONSE:');
    console.log('='.repeat(40));
    console.log(JSON.stringify({
      success: true,
      data: {
        insight: "Your recent entertainment spending is high and may be affecting your sleep quality.",
        action: "Try reducing entertainment spending by $50 this week and see if your sleep improves.",
        expectedImpact: "You should see better sleep quality within 3-5 days.",
        timeframe: "3-5 days",
        confidence: "medium"
      },
      message: "Quick insight generated successfully"
    }, null, 2));
    
    return null;
  }
}

/**
 * Show API endpoint examples
 */
function showAPIEndpoints() {
  console.log('\n\n🌐 API ENDPOINT EXAMPLES');
  console.log('='.repeat(60));
  
  console.log('\n📡 Available Endpoints:');
  console.log('   GET  /api/analysis/financial-wellbeing-impact');
  console.log('   POST /api/analysis/financial-wellbeing-impact');
  console.log('   GET  /api/analysis/quick-insight');
  console.log('   POST /api/analysis/quick-insight');
  console.log('   GET  /api/analysis/health-check');
  console.log('   GET  /api/analysis/capabilities');
  
  console.log('\n📝 Example API Calls:');
  
  console.log('\n1. Complete Analysis (POST):');
  console.log('   curl -X POST http://localhost:3000/api/analysis/financial-wellbeing-impact \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"transactions": [...], "wellbeingData": [...]}\'');
  
  console.log('\n2. Quick Insight (POST):');
  console.log('   curl -X POST http://localhost:3000/api/analysis/quick-insight \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"transactions": [...], "wellbeingData": [...]}\'');
  
  console.log('\n3. Health Check:');
  console.log('   curl http://localhost:3000/api/analysis/health-check');
  
  console.log('\n4. Capabilities:');
  console.log('   curl http://localhost:3000/api/analysis/capabilities');
  
  console.log('\n📊 Frontend Integration:');
  console.log('   // React Native example');
  console.log('   const response = await fetch(\'/api/analysis/financial-wellbeing-impact\', {');
  console.log('     method: \'POST\',');
  console.log('     headers: { \'Content-Type\': \'application/json\' },');
  console.log('     body: JSON.stringify({ transactions, wellbeingData })');
  console.log('   });');
  console.log('   const analysis = await response.json();');
  console.log('   console.log(analysis.data.report.summary);');
}

/**
 * Main function
 */
async function runAPIExample() {
  console.log('🚀 FINANCIAL-WELLBEING IMPACT ANALYSIS - API EXAMPLES');
  console.log('='.repeat(80));
  console.log('This demonstrates how to use the analysis API endpoints.\n');
  
  try {
    // Step 1: Complete analysis
    await demonstrateCompleteAnalysis();
    
    // Step 2: Quick insight
    await demonstrateQuickInsight();
    
    // Step 3: API endpoints
    showAPIEndpoints();
    
    console.log('\n\n🎉 API EXAMPLES COMPLETED!');
    console.log('='.repeat(80));
    console.log('Key Points:');
    console.log('• The API accepts transaction and wellbeing data');
    console.log('• It returns structured JSON with insights and recommendations');
    console.log('• Both GET and POST endpoints are available');
    console.log('• The API is ready for frontend integration');
    console.log('• Health check and capabilities endpoints provide system info');
    
  } catch (error) {
    console.error('❌ API example failed:', error);
    throw error;
  }
}

// Run example if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  runAPIExample().catch(console.error);
}

export { runAPIExample };
