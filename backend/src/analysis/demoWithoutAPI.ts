/**
 * Demo Financial-Wellbeing Analysis Without Gemini API
 * Shows the analysis working with fallback responses when API is unavailable
 */

import { CorrelationAnalyzer, PredictiveModeling } from './index';
import { Transaction } from '../gemini/index';
import { WellbeingData } from './correlationAnalyzer';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Create comprehensive test data
 */
function createComprehensiveTestData() {
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
 * Generate mock AI insights based on correlations
 */
function generateMockInsights(correlations: any[]): any {
  const strongCorrelations = correlations.filter(c => c.strength === 'strong');
  
  if (strongCorrelations.length === 0) {
    return {
      summary: "Your spending and wellbeing data shows some interesting patterns, but no strong correlations were found yet.",
      keyInsights: [
        {
          title: "Keep Tracking Your Data",
          insight: "Continue monitoring both your spending and wellbeing to identify patterns over time.",
          actionableAdvice: ["Log your mood daily", "Track spending categories weekly"],
          confidence: "medium",
          priority: "medium",
          category: "lifestyle"
        }
      ],
      recommendations: [
        "Continue collecting data for better insights",
        "Focus on consistent data entry",
        "Look for patterns between spending and mood"
      ],
      nextSteps: [
        "Set up weekly reviews of your financial-wellbeing connection",
        "Try to identify what spending makes you feel good vs. bad"
      ]
    };
  }
  
  const topCorrelation = strongCorrelations[0];
  const financialLabel = getFinancialMetricLabel(topCorrelation.metric);
  const wellbeingLabel = getWellbeingMetricLabel(topCorrelation.wellbeingMetric);
  const direction = topCorrelation.direction === 'positive' ? 'increases' : 'decreases';
  
  return {
    summary: `Your data reveals a strong connection between ${financialLabel} and ${wellbeingLabel}. ${financialLabel} ${direction} your ${wellbeingLabel}, which could help you make more informed financial decisions.`,
    keyInsights: [
      {
        title: `${financialLabel} Affects ${wellbeingLabel}`,
        insight: `Your ${financialLabel} has a ${topCorrelation.strength} ${topCorrelation.direction} correlation with ${wellbeingLabel} (${topCorrelation.correlation}). This means changes in your spending directly impact your wellbeing.`,
        actionableAdvice: [
          `Monitor your ${financialLabel} weekly`,
          `Track how it affects your ${wellbeingLabel}`,
          `Consider adjusting your spending if needed`
        ],
        confidence: topCorrelation.strength === 'strong' ? 'high' : 'medium',
        priority: topCorrelation.strength === 'strong' ? 'high' : 'medium',
        category: 'spending'
      }
    ],
    recommendations: [
      `Pay attention to how ${financialLabel} affects your ${wellbeingLabel}`,
      "Consider setting spending limits for categories that negatively impact your wellbeing",
      "Increase spending in categories that positively impact your wellbeing"
    ],
    nextSteps: [
      "Set up weekly reviews of your financial-wellbeing connection",
      `Focus on the relationship between ${financialLabel} and ${wellbeingLabel}`,
      "Experiment with different spending patterns to see their impact"
    ]
  };
}

/**
 * Helper functions
 */
function getFinancialMetricLabel(metric: string): string {
  const labels: { [key: string]: string } = {
    totalSpending: 'Total Spending',
    entertainmentSpending: 'Entertainment Spending',
    foodSpending: 'Food & Dining Spending',
    shoppingSpending: 'Shopping Spending',
    transportSpending: 'Transportation Spending',
    selfCareSpending: 'Self-Care Spending',
    savingsRate: 'Savings Rate',
    anomalySpending: 'Unusual Spending'
  };
  return labels[metric] || metric;
}

function getWellbeingMetricLabel(metric: string): string {
  const labels: { [key: string]: string } = {
    overallWellbeing: 'Overall Wellbeing',
    stressLevel: 'Stress Levels',
    sleepQuality: 'Sleep Quality',
    energyLevel: 'Energy Levels',
    mood: 'Mood'
  };
  return labels[metric] || metric;
}

/**
 * Main demo function
 */
async function runDemoWithoutAPI() {
  console.log('🚀 FINANCIAL-WELLBEING ANALYSIS DEMO (Without Gemini API)');
  console.log('='.repeat(70));
  console.log('This demonstrates the analysis working with statistical methods only.\n');
  
  try {
    // Step 1: Create test data
    console.log('📊 Creating comprehensive test data...');
    const { transactions, wellbeingData } = createComprehensiveTestData();
    
    console.log(`   ✅ Generated ${transactions.length} transactions across 5 weeks`);
    console.log(`   ✅ Generated ${wellbeingData.length} wellbeing records`);
    
    // Step 2: Aggregate weekly data
    console.log('\n📅 Aggregating data into weekly patterns...');
    const weeklyData = CorrelationAnalyzer.aggregateWeeklyData(transactions, wellbeingData);
    
    console.log(`   ✅ Created ${weeklyData.length} weekly data points`);
    
    // Show weekly data
    console.log('\n📈 Weekly Data Summary:');
    weeklyData.forEach((week, index) => {
      console.log(`   Week ${index + 1}: Entertainment $${week.financial.entertainmentSpending}, ` +
                 `Food $${week.financial.foodSpending}, ` +
                 `Wellbeing ${week.wellbeing.overallWellbeing}/10, ` +
                 `Stress ${week.wellbeing.stressLevel}/10, ` +
                 `Sleep ${week.wellbeing.sleepQuality}/10`);
    });
    
    // Step 3: Correlation analysis
    console.log('\n🔍 Performing correlation analysis...');
    const correlations = CorrelationAnalyzer.analyzeCorrelations(weeklyData);
    
    console.log(`   ✅ Found ${correlations.length} significant correlations`);
    
    // Show top correlations
    const topCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 5);
    console.log('\n🔗 Top Correlations:');
    topCorrelations.forEach((corr, index) => {
      const financialLabel = getFinancialMetricLabel(corr.metric);
      const wellbeingLabel = getWellbeingMetricLabel(corr.wellbeingMetric);
      const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
      const strength = corr.strength === 'strong' ? '🔴' : corr.strength === 'moderate' ? '🟡' : '🟢';
      
      console.log(`   ${index + 1}. ${strength} ${financialLabel} ${direction} ${wellbeingLabel} (${corr.correlation})`);
    });
    
    // Step 4: Predictive modeling
    console.log('\n🤖 Training predictive models...');
    const models: { [key: string]: any } = {};
    const wellbeingMetrics = ['overallWellbeing', 'stressLevel', 'sleepQuality', 'energyLevel', 'mood'];
    
    for (const metric of wellbeingMetrics) {
      const model = PredictiveModeling.trainModel(weeklyData, metric, topCorrelations);
      if (model) {
        models[metric] = model;
        console.log(`   ✅ ${metric}: R² = ${model.rSquared} (${model.rSquared > 0.7 ? 'Excellent' : model.rSquared > 0.4 ? 'Good' : 'Fair'})`);
      }
    }
    
    // Step 5: What-If scenarios
    console.log('\n💭 Testing What-If scenarios...');
    const currentFinancialData = {
      totalSpending: 500,
      entertainmentSpending: 100,
      foodSpending: 150,
      shoppingSpending: 100,
      transportSpending: 40,
      selfCareSpending: 60,
      savingsRate: 20,
      anomalySpending: 0
    };
    
    const scenarios = [
      { name: "Cut Entertainment by 50%", changes: { entertainmentSpending: -50, selfCareSpending: 0, shoppingSpending: 0 } },
      { name: "Double Self-Care Budget", changes: { entertainmentSpending: 0, selfCareSpending: 60, shoppingSpending: 0 } },
      { name: "Reduce Shopping by 30%", changes: { entertainmentSpending: 0, selfCareSpending: 0, shoppingSpending: -30 } }
    ];
    
    if (Object.keys(models).length > 0) {
      const whatIfResults = PredictiveModeling.generateWhatIfScenarios(models, currentFinancialData, scenarios);
      
      console.log('\n🔮 What-If Scenario Results:');
      whatIfResults.forEach((result, index) => {
        console.log(`\n   ${index + 1}. ${result.scenario}:`);
        console.log(`      ${result.recommendation}`);
      });
    }
    
    // Step 6: Generate mock AI insights
    console.log('\n💡 Generating AI-style insights...');
    const mockReport = generateMockInsights(correlations);
    
    console.log('\n📋 FINANCIAL-WELLBEING IMPACT REPORT:');
    console.log('='.repeat(50));
    console.log(`\n📝 Summary:`);
    console.log(`   ${mockReport.summary}`);
    
    console.log(`\n💡 Key Insights:`);
    mockReport.keyInsights.forEach((insight: any, index: number) => {
      console.log(`\n   ${index + 1}. ${insight.title}`);
      console.log(`      ${insight.insight}`);
      console.log(`      Actions: ${insight.actionableAdvice.join(', ')}`);
      console.log(`      Priority: ${insight.priority} | Confidence: ${insight.confidence}`);
    });
    
    console.log(`\n🎯 Recommendations:`);
    mockReport.recommendations.forEach((rec: string, index: number) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    console.log(`\n📋 Next Steps:`);
    mockReport.nextSteps.forEach((step: string, index: number) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    console.log('\n\n🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('Key Achievements:');
    console.log('✅ Statistical correlation analysis working perfectly');
    console.log('✅ Predictive modeling with linear regression');
    console.log('✅ What-If scenario analysis');
    console.log('✅ Mock AI insights based on real data patterns');
    console.log('✅ Complete fallback system when Gemini API unavailable');
    console.log('\nThis demonstrates the core "wow feature" working without external dependencies!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Run demo if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  runDemoWithoutAPI().catch(console.error);
}

export { runDemoWithoutAPI };
