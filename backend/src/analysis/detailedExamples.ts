/**
 * Detailed Examples of Financial-Wellbeing Impact Analysis
 * Shows actual data processing, correlations, and insights in action
 */

import { 
  CorrelationAnalyzer, 
  PredictiveModeling, 
  ImpactAnalyzer,
  WellbeingData,
  WeeklyDataPoint,
  CorrelationResult
} from './index';
import { Transaction } from '../gemini/index';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Generate realistic test data with specific patterns for demonstration
 */
function generateDetailedTestData(): { transactions: Transaction[], wellbeingData: WellbeingData[] } {
  console.log('📊 Generating detailed test data with specific patterns...\n');
  
  const transactions: Transaction[] = [];
  const wellbeingData: WellbeingData[] = [];
  const baseDate = new Date();
  
  // Create 6 weeks of data with specific patterns
  for (let week = 0; week < 6; week++) {
    const weekStart = new Date(baseDate);
    weekStart.setDate(weekStart.getDate() - (week * 7));
    const weekKey = `${weekStart.getFullYear()}-W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
    
    // Create specific spending patterns
    const entertainmentSpending = 50 + (week * 20); // Increasing entertainment spending
    const foodSpending = 200 - (week * 15); // Decreasing food spending
    const shoppingSpending = 100 + (week % 2 === 0 ? 50 : -30); // Alternating high/low
    const selfCareSpending = 30 + (week * 10); // Increasing self-care
    
    // Generate transactions for this week
    const weekTransactions = [
      { date: weekStart.toISOString().split('T')[0], category: 'Entertainment', amount: entertainmentSpending },
      { date: new Date(weekStart.getTime() + 24*60*60*1000).toISOString().split('T')[0], category: 'Food', amount: foodSpending },
      { date: new Date(weekStart.getTime() + 2*24*60*60*1000).toISOString().split('T')[0], category: 'Shopping', amount: shoppingSpending },
      { date: new Date(weekStart.getTime() + 3*24*60*60*1000).toISOString().split('T')[0], category: 'Self-Care', amount: selfCareSpending },
      { date: new Date(weekStart.getTime() + 4*24*60*60*1000).toISOString().split('T')[0], category: 'Transport', amount: 40 }
    ];
    
    transactions.push(...weekTransactions);
    
    // Create wellbeing data that correlates with spending patterns
    // Higher entertainment spending → better mood but worse sleep
    // Higher self-care spending → better overall wellbeing
    // Higher food spending → better energy but higher stress
    
    const baseWellbeing = 6 + (selfCareSpending / 100); // Self-care improves wellbeing
    const stressLevel = 5 + (foodSpending / 200) - (entertainmentSpending / 100); // Food increases stress, entertainment reduces it
    const sleepQuality = 7 - (entertainmentSpending / 80); // Entertainment hurts sleep
    const energyLevel = 6 + (foodSpending / 150) - (shoppingSpending / 200); // Food helps energy, shopping drains it
    const mood = 6 + (entertainmentSpending / 60) - (shoppingSpending / 150); // Entertainment helps mood, shopping hurts it
    
    wellbeingData.push({
      date: weekStart.toISOString().split('T')[0],
      overallWellbeing: Math.max(1, Math.min(10, Math.round(baseWellbeing * 10) / 10)),
      stressLevel: Math.max(1, Math.min(10, Math.round(stressLevel * 10) / 10)),
      sleepQuality: Math.max(1, Math.min(10, Math.round(sleepQuality * 10) / 10)),
      energyLevel: Math.max(1, Math.min(10, Math.round(energyLevel * 10) / 10)),
      mood: Math.max(1, Math.min(10, Math.round(mood * 10) / 10))
    });
    
    console.log(`📅 Week ${week + 1} (${weekKey}):`);
    console.log(`   💰 Entertainment: $${entertainmentSpending}, Food: $${foodSpending}, Shopping: $${shoppingSpending}, Self-Care: $${selfCareSpending}`);
    console.log(`   😊 Wellbeing: ${baseWellbeing.toFixed(1)}, Stress: ${stressLevel.toFixed(1)}, Sleep: ${sleepQuality.toFixed(1)}, Energy: ${energyLevel.toFixed(1)}, Mood: ${mood.toFixed(1)}`);
  }
  
  return { transactions, wellbeingData };
}

/**
 * Show detailed correlation analysis
 */
async function showDetailedCorrelationAnalysis() {
  console.log('🔍 DETAILED CORRELATION ANALYSIS');
  console.log('='.repeat(60));
  
  const { transactions, wellbeingData } = generateDetailedTestData();
  
  console.log('\n📊 Raw Transaction Data:');
  transactions.forEach((tx, index) => {
    console.log(`   ${index + 1}. ${tx.date} - ${tx.category}: $${tx.amount}`);
  });
  
  console.log('\n😊 Raw Wellbeing Data:');
  wellbeingData.forEach((wd, index) => {
    console.log(`   ${index + 1}. ${wd.date} - Wellbeing: ${wd.overallWellbeing}, Stress: ${wd.stressLevel}, Sleep: ${wd.sleepQuality}, Energy: ${wd.energyLevel}, Mood: ${wd.mood}`);
  });
  
  // Aggregate weekly data
  console.log('\n📅 Aggregating into weekly data points...');
  const weeklyData = CorrelationAnalyzer.aggregateWeeklyData(transactions, wellbeingData);
  
  console.log('\n📈 Weekly Aggregated Data:');
  weeklyData.forEach((week, index) => {
    console.log(`\n   Week ${index + 1} (${week.week}):`);
    console.log(`   💰 Financial:`);
    console.log(`      Total: $${week.financial.totalSpending.toFixed(2)}`);
    console.log(`      Entertainment: $${week.financial.entertainmentSpending.toFixed(2)}`);
    console.log(`      Food: $${week.financial.foodSpending.toFixed(2)}`);
    console.log(`      Shopping: $${week.financial.shoppingSpending.toFixed(2)}`);
    console.log(`      Self-Care: $${week.financial.selfCareSpending.toFixed(2)}`);
    console.log(`      Transport: $${week.financial.transportSpending.toFixed(2)}`);
    console.log(`      Savings Rate: ${week.financial.savingsRate.toFixed(1)}%`);
    console.log(`   😊 Wellbeing:`);
    console.log(`      Overall: ${week.wellbeing.overallWellbeing}/10`);
    console.log(`      Stress: ${week.wellbeing.stressLevel}/10`);
    console.log(`      Sleep: ${week.wellbeing.sleepQuality}/10`);
    console.log(`      Energy: ${week.wellbeing.energyLevel}/10`);
    console.log(`      Mood: ${week.wellbeing.mood}/10`);
  });
  
  // Perform correlation analysis
  console.log('\n🔗 Calculating correlations...');
  const correlations = CorrelationAnalyzer.analyzeCorrelations(weeklyData);
  
  console.log(`\n📊 Found ${correlations.length} significant correlations:`);
  correlations.forEach((corr, index) => {
    const financialLabel = getFinancialMetricLabel(corr.metric);
    const wellbeingLabel = getWellbeingMetricLabel(corr.wellbeingMetric);
    const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
    const strength = corr.strength === 'strong' ? '🔴' : corr.strength === 'moderate' ? '🟡' : '🟢';
    
    console.log(`\n   ${index + 1}. ${strength} ${financialLabel} ${direction} ${wellbeingLabel}`);
    console.log(`      Correlation coefficient: ${corr.correlation}`);
    console.log(`      Strength: ${corr.strength} ${corr.direction}`);
    console.log(`      Significance: ${corr.significance}`);
    
    // Show what this means in practical terms
    if (corr.strength === 'strong') {
      console.log(`      💡 This is a strong relationship! Changes in ${financialLabel} will significantly affect ${wellbeingLabel}.`);
    } else if (corr.strength === 'moderate') {
      console.log(`      💡 This is a moderate relationship. ${financialLabel} has a noticeable impact on ${wellbeingLabel}.`);
    } else {
      console.log(`      💡 This is a weak relationship. ${financialLabel} has a small impact on ${wellbeingLabel}.`);
    }
  });
  
  return { weeklyData, correlations };
}

/**
 * Show detailed predictive modeling
 */
async function showDetailedPredictiveModeling(weeklyData: WeeklyDataPoint[], correlations: CorrelationResult[]) {
  console.log('\n\n🤖 DETAILED PREDICTIVE MODELING');
  console.log('='.repeat(60));
  
  const strongCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 3);
  console.log(`\n🎯 Using top ${strongCorrelations.length} correlations for modeling:`);
  strongCorrelations.forEach((corr, index) => {
    console.log(`   ${index + 1}. ${corr.metric} → ${corr.wellbeingMetric} (${corr.correlation})`);
  });
  
  // Train models for different wellbeing metrics
  const wellbeingMetrics = ['overallWellbeing', 'stressLevel', 'sleepQuality', 'energyLevel', 'mood'];
  
  for (const metric of wellbeingMetrics) {
    console.log(`\n🎯 Training model for ${metric}...`);
    
    const model = PredictiveModeling.trainModel(weeklyData, metric, strongCorrelations);
    
    if (model) {
      console.log(`   ✅ Model trained successfully!`);
      console.log(`   📊 R-squared: ${model.rSquared} (${model.rSquared > 0.7 ? 'Excellent' : model.rSquared > 0.4 ? 'Good' : 'Fair'} fit)`);
      console.log(`   🔢 Intercept: ${model.intercept.toFixed(3)}`);
      console.log(`   📈 Coefficients:`);
      
      Object.entries(model.coefficients).forEach(([financialMetric, coefficient]) => {
        const label = getFinancialMetricLabel(financialMetric);
        const impact = coefficient > 0 ? 'increases' : 'decreases';
        const magnitude = Math.abs(coefficient);
        console.log(`      ${label}: ${coefficient.toFixed(3)} (${impact} ${metric} by ${magnitude.toFixed(3)} per $100)`);
      });
      
      // Test predictions with different scenarios
      console.log(`\n   🔮 Testing predictions with different spending scenarios:`);
      
      const scenarios = [
        { name: 'Current Spending', data: getCurrentFinancialData(weeklyData) },
        { name: 'High Entertainment', data: { ...getCurrentFinancialData(weeklyData), entertainmentSpending: 200 } },
        { name: 'High Self-Care', data: { ...getCurrentFinancialData(weeklyData), selfCareSpending: 150 } },
        { name: 'Low Shopping', data: { ...getCurrentFinancialData(weeklyData), shoppingSpending: 50 } }
      ];
      
      scenarios.forEach(scenario => {
        const prediction = PredictiveModeling.makePrediction(model, scenario.data);
        console.log(`\n      ${scenario.name}:`);
        console.log(`         Predicted ${metric}: ${prediction.predictedValue.toFixed(2)}/10`);
        console.log(`         Confidence: ${prediction.confidence}`);
        console.log(`         Key factors:`);
        prediction.factors.slice(0, 3).forEach(factor => {
          const label = getFinancialMetricLabel(factor.metric);
          console.log(`            ${label}: ${factor.impact > 0 ? '+' : ''}${factor.impact.toFixed(2)} (${factor.contribution}% of impact)`);
        });
      });
      
    } else {
      console.log(`   ⚠️  Could not train model for ${metric} (insufficient data or correlations)`);
    }
  }
}

/**
 * Show What-If scenario analysis
 */
async function showWhatIfScenarios(weeklyData: WeeklyDataPoint[], correlations: CorrelationResult[]) {
  console.log('\n\n💭 WHAT-IF SCENARIO ANALYSIS');
  console.log('='.repeat(60));
  
  const strongCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 3);
  const models: { [key: string]: any } = {};
  
  // Train models for scenario analysis
  const wellbeingMetrics = ['overallWellbeing', 'stressLevel', 'sleepQuality'];
  for (const metric of wellbeingMetrics) {
    const model = PredictiveModeling.trainModel(weeklyData, metric, strongCorrelations);
    if (model) {
      models[metric] = model;
    }
  }
  
  if (Object.keys(models).length === 0) {
    console.log('⚠️  No models available for What-If analysis');
    return;
  }
  
  const currentFinancialData = getCurrentFinancialData(weeklyData);
  console.log('\n💰 Current Financial Situation:');
  Object.entries(currentFinancialData).forEach(([metric, value]) => {
    const label = getFinancialMetricLabel(metric);
    console.log(`   ${label}: $${value.toFixed(2)}`);
  });
  
  // Define scenarios
  const scenarios = [
    {
      name: "Cut Entertainment Budget by 50%",
      changes: { entertainmentSpending: -100, selfCareSpending: 0, shoppingSpending: 0, foodSpending: 0 }
    },
    {
      name: "Double Self-Care Spending",
      changes: { entertainmentSpending: 0, selfCareSpending: 100, shoppingSpending: 0, foodSpending: 0 }
    },
    {
      name: "Reduce Shopping by 30%",
      changes: { entertainmentSpending: 0, selfCareSpending: 0, shoppingSpending: -50, foodSpending: 0 }
    },
    {
      name: "Increase Food Budget",
      changes: { entertainmentSpending: 0, selfCareSpending: 0, shoppingSpending: 0, foodSpending: 75 }
    }
  ];
  
  console.log('\n🔮 What-If Scenarios:');
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n   ${index + 1}. ${scenario.name}`);
    console.log(`      Changes: ${Object.entries(scenario.changes).map(([k, v]) => `${getFinancialMetricLabel(k)}: ${v > 0 ? '+' : ''}$${v}`).join(', ')}`);
    
    // Calculate new financial data
    const newFinancialData = { ...currentFinancialData };
    Object.entries(scenario.changes).forEach(([metric, change]) => {
      newFinancialData[metric] = (newFinancialData[metric] || 0) + change;
    });
    
    console.log(`      New totals:`);
    Object.entries(newFinancialData).forEach(([metric, value]) => {
      const label = getFinancialMetricLabel(metric);
      const change = value - (currentFinancialData[metric] || 0);
      console.log(`         ${label}: $${value.toFixed(2)} (${change > 0 ? '+' : ''}$${change.toFixed(2)})`);
    });
    
    // Make predictions
    console.log(`      Predicted wellbeing impact:`);
    Object.entries(models).forEach(([metric, model]) => {
      const currentPrediction = PredictiveModeling.makePrediction(model, currentFinancialData);
      const newPrediction = PredictiveModeling.makePrediction(model, newFinancialData);
      const change = newPrediction.predictedValue - currentPrediction.predictedValue;
      
      const metricLabel = getWellbeingMetricLabel(metric);
      const direction = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeText = change > 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
      
      console.log(`         ${metricLabel}: ${newPrediction.predictedValue.toFixed(2)}/10 ${direction} (${changeText})`);
    });
  });
  
  // Generate What-If scenarios using the service
  console.log('\n🤖 AI-Generated What-If Analysis:');
  const whatIfResults = PredictiveModeling.generateWhatIfScenarios(models, currentFinancialData, scenarios);
  
  whatIfResults.forEach((result, index) => {
    console.log(`\n   ${index + 1}. ${result.scenario}:`);
    console.log(`      ${result.recommendation}`);
  });
}

/**
 * Helper functions
 */
function getCurrentFinancialData(weeklyData: WeeklyDataPoint[]): { [key: string]: number } {
  if (weeklyData.length === 0) return {};
  
  const latestWeek = weeklyData[weeklyData.length - 1];
  return {
    totalSpending: latestWeek.financial.totalSpending,
    entertainmentSpending: latestWeek.financial.entertainmentSpending,
    foodSpending: latestWeek.financial.foodSpending,
    shoppingSpending: latestWeek.financial.shoppingSpending,
    transportSpending: latestWeek.financial.transportSpending,
    selfCareSpending: latestWeek.financial.selfCareSpending,
    savingsRate: latestWeek.financial.savingsRate,
    anomalySpending: latestWeek.financial.anomalySpending
  };
}

function getFinancialMetricLabel(metric: string): string {
  const labels: { [key: string]: string } = {
    totalSpending: 'Total Spending',
    entertainmentSpending: 'Entertainment',
    foodSpending: 'Food & Dining',
    shoppingSpending: 'Shopping',
    transportSpending: 'Transportation',
    selfCareSpending: 'Self-Care',
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
 * Main function to run detailed examples
 */
async function runDetailedExamples() {
  console.log('🚀 FINANCIAL-WELLBEING IMPACT ANALYSIS - DETAILED EXAMPLES');
  console.log('='.repeat(80));
  console.log('This will show you exactly how the analysis works with real data patterns.\n');
  
  try {
    // Step 1: Detailed correlation analysis
    const { weeklyData, correlations } = await showDetailedCorrelationAnalysis();
    
    // Step 2: Detailed predictive modeling
    await showDetailedPredictiveModeling(weeklyData, correlations);
    
    // Step 3: What-If scenario analysis
    await showWhatIfScenarios(weeklyData, correlations);
    
    console.log('\n\n🎉 DETAILED EXAMPLES COMPLETED!');
    console.log('='.repeat(80));
    console.log('You can see how:');
    console.log('• Raw transaction and wellbeing data gets aggregated into weekly patterns');
    console.log('• Statistical correlations reveal meaningful relationships between spending and mood');
    console.log('• Machine learning models predict the impact of different spending decisions');
    console.log('• What-If scenarios help users understand the consequences of their choices');
    console.log('\nThis is the "wow feature" that connects financial behavior with emotional wellbeing!');
    
  } catch (error) {
    console.error('❌ Detailed examples failed:', error);
    throw error;
  }
}

// Run examples if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  runDetailedExamples().catch(console.error);
}

export { runDetailedExamples };
