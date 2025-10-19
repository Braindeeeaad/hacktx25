/**
 * Simple Example of Financial-Wellbeing Impact Analysis
 * Shows a clear, easy-to-understand example of how the analysis works
 */

import { CorrelationAnalyzer, PredictiveModeling } from './index';
import { Transaction } from '../gemini/index';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Create a simple, clear example with obvious patterns
 */
function createSimpleExample() {
  console.log('🎯 SIMPLE EXAMPLE: How Entertainment Spending Affects Wellbeing');
  console.log('='.repeat(70));
  
  // Create 4 weeks of data with a clear pattern
  const transactions: Transaction[] = [
    // Week 1: Low entertainment spending
    { date: '2024-01-01', category: 'Entertainment', amount: 20 },
    { date: '2024-01-02', category: 'Food', amount: 150 },
    { date: '2024-01-03', category: 'Transport', amount: 40 },
    
    // Week 2: Medium entertainment spending
    { date: '2024-01-08', category: 'Entertainment', amount: 60 },
    { date: '2024-01-09', category: 'Food', amount: 140 },
    { date: '2024-01-10', category: 'Transport', amount: 35 },
    
    // Week 3: High entertainment spending
    { date: '2024-01-15', category: 'Entertainment', amount: 120 },
    { date: '2024-01-16', category: 'Food', amount: 130 },
    { date: '2024-01-17', category: 'Transport', amount: 45 },
    
    // Week 4: Very high entertainment spending
    { date: '2024-01-22', category: 'Entertainment', amount: 200 },
    { date: '2024-01-23', category: 'Food', amount: 120 },
    { date: '2024-01-24', category: 'Transport', amount: 50 },
  ];
  
  const wellbeingData = [
    // Week 1: Low entertainment = good sleep, low stress
    { date: '2024-01-01', overallWellbeing: 7, stressLevel: 3, sleepQuality: 8, energyLevel: 7, mood: 6 },
    
    // Week 2: Medium entertainment = okay sleep, medium stress
    { date: '2024-01-08', overallWellbeing: 6, stressLevel: 4, sleepQuality: 7, energyLevel: 6, mood: 7 },
    
    // Week 3: High entertainment = poor sleep, high stress
    { date: '2024-01-15', overallWellbeing: 5, stressLevel: 6, sleepQuality: 5, energyLevel: 5, mood: 8 },
    
    // Week 4: Very high entertainment = very poor sleep, very high stress
    { date: '2024-01-22', overallWellbeing: 4, stressLevel: 8, sleepQuality: 3, energyLevel: 4, mood: 9 },
  ];
  
  console.log('\n📊 THE DATA:');
  console.log('Week 1: $20 entertainment → Sleep: 8/10, Stress: 3/10');
  console.log('Week 2: $60 entertainment → Sleep: 7/10, Stress: 4/10');
  console.log('Week 3: $120 entertainment → Sleep: 5/10, Stress: 6/10');
  console.log('Week 4: $200 entertainment → Sleep: 3/10, Stress: 8/10');
  
  console.log('\n🔍 THE PATTERN:');
  console.log('As entertainment spending increases:');
  console.log('• Sleep quality gets worse (8→7→5→3)');
  console.log('• Stress levels increase (3→4→6→8)');
  console.log('• But mood improves (6→7→8→9)');
  
  return { transactions, wellbeingData };
}

/**
 * Show the correlation analysis in action
 */
function showCorrelationAnalysis(transactions: Transaction[], wellbeingData: any[]) {
  console.log('\n\n🔗 CORRELATION ANALYSIS:');
  console.log('='.repeat(50));
  
  // Aggregate weekly data
  const weeklyData = CorrelationAnalyzer.aggregateWeeklyData(transactions, wellbeingData);
  
  console.log('\n📈 Weekly Aggregated Data:');
  weeklyData.forEach((week, index) => {
    console.log(`Week ${index + 1}: Entertainment $${week.financial.entertainmentSpending} → Sleep ${week.wellbeing.sleepQuality}/10, Stress ${week.wellbeing.stressLevel}/10`);
  });
  
  // Find correlations
  const correlations = CorrelationAnalyzer.analyzeCorrelations(weeklyData);
  
  console.log('\n🔍 Key Correlations Found:');
  correlations.forEach(corr => {
    if (corr.metric === 'entertainmentSpending') {
      const direction = corr.direction === 'positive' ? 'increases' : 'decreases';
      const strength = corr.strength === 'strong' ? '🔴 STRONG' : corr.strength === 'moderate' ? '🟡 MODERATE' : '🟢 WEAK';
      
      console.log(`\n${strength} Entertainment spending ${direction} ${corr.wellbeingMetric}`);
      console.log(`   Correlation coefficient: ${corr.correlation}`);
      
      if (corr.wellbeingMetric === 'sleepQuality' && corr.direction === 'negative') {
        console.log('   💡 This means: More entertainment spending = worse sleep quality');
      } else if (corr.wellbeingMetric === 'stressLevel' && corr.direction === 'positive') {
        console.log('   💡 This means: More entertainment spending = higher stress levels');
      } else if (corr.wellbeingMetric === 'mood' && corr.direction === 'positive') {
        console.log('   💡 This means: More entertainment spending = better mood');
      }
    }
  });
  
  return { weeklyData, correlations };
}

/**
 * Show predictive modeling in action
 */
function showPredictiveModeling(weeklyData: any[], correlations: any[]) {
  console.log('\n\n🤖 PREDICTIVE MODELING:');
  console.log('='.repeat(50));
  
  const strongCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 2);
  
  // Train a model for sleep quality
  const sleepModel = PredictiveModeling.trainModel(weeklyData, 'sleepQuality', strongCorrelations);
  
  if (sleepModel) {
    console.log('\n🎯 Sleep Quality Prediction Model:');
    console.log(`   R-squared: ${sleepModel.rSquared} (${sleepModel.rSquared > 0.7 ? 'Excellent' : 'Good'} fit)`);
    console.log(`   Base sleep quality: ${sleepModel.intercept.toFixed(1)}/10`);
    
    Object.entries(sleepModel.coefficients).forEach(([metric, coefficient]) => {
      const impact = coefficient > 0 ? 'improves' : 'hurts';
      console.log(`   Entertainment spending ${impact} sleep by ${Math.abs(coefficient).toFixed(2)} points per $100`);
    });
    
    // Test predictions
    console.log('\n🔮 Testing Predictions:');
    
    const scenarios = [
      { name: 'Conservative Week', entertainment: 30 },
      { name: 'Normal Week', entertainment: 80 },
      { name: 'Party Week', entertainment: 150 },
      { name: 'Extreme Week', entertainment: 250 }
    ];
    
    scenarios.forEach(scenario => {
      const prediction = PredictiveModeling.makePrediction(sleepModel, {
        entertainmentSpending: scenario.entertainment,
        foodSpending: 140,
        shoppingSpending: 0,
        transportSpending: 40,
        selfCareSpending: 0,
        totalSpending: scenario.entertainment + 180,
        savingsRate: 20,
        anomalySpending: 0
      });
      
      console.log(`\n   ${scenario.name} ($${scenario.entertainment} entertainment):`);
      console.log(`      Predicted sleep quality: ${prediction.predictedValue.toFixed(1)}/10`);
      console.log(`      Confidence: ${prediction.confidence}`);
      
      // Interpret the result
      if (prediction.predictedValue >= 7) {
        console.log(`      💤 You'll sleep well!`);
      } else if (prediction.predictedValue >= 5) {
        console.log(`      😴 You'll sleep okay, but could be better`);
      } else {
        console.log(`      😵 You'll have poor sleep - consider cutting back on entertainment`);
      }
    });
  }
}

/**
 * Show What-If scenarios
 */
function showWhatIfScenarios(weeklyData: any[], correlations: any[]) {
  console.log('\n\n💭 WHAT-IF SCENARIOS:');
  console.log('='.repeat(50));
  
  const strongCorrelations = CorrelationAnalyzer.getStrongestCorrelations(correlations, 2);
  const models: { [key: string]: any } = {};
  
  // Train models
  const sleepModel = PredictiveModeling.trainModel(weeklyData, 'sleepQuality', strongCorrelations);
  const stressModel = PredictiveModeling.trainModel(weeklyData, 'stressLevel', strongCorrelations);
  
  if (sleepModel) models.sleepQuality = sleepModel;
  if (stressModel) models.stressLevel = stressModel;
  
  if (Object.keys(models).length === 0) {
    console.log('⚠️  No models available for What-If analysis');
    return;
  }
  
  const currentSpending = {
    entertainmentSpending: 100,
    foodSpending: 140,
    shoppingSpending: 0,
    transportSpending: 40,
    selfCareSpending: 0,
    totalSpending: 280,
    savingsRate: 20,
    anomalySpending: 0
  };
  
  console.log('\n💰 Current spending: $100 entertainment per week');
  
  const scenarios = [
    {
      name: "Cut Entertainment in Half",
      changes: { entertainmentSpending: -50 }
    },
    {
      name: "Double Entertainment Budget",
      changes: { entertainmentSpending: 100 }
    }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`\n🎯 ${scenario.name}:`);
    
    const newSpending = { ...currentSpending } as any;
    Object.entries(scenario.changes).forEach(([metric, change]) => {
      newSpending[metric] = (newSpending[metric] || 0) + change;
    });
    
    console.log(`   New entertainment budget: $${newSpending.entertainmentSpending}`);
    
    // Make predictions
    Object.entries(models).forEach(([metric, model]) => {
      const currentPrediction = PredictiveModeling.makePrediction(model, currentSpending);
      const newPrediction = PredictiveModeling.makePrediction(model, newSpending);
      const change = newPrediction.predictedValue - currentPrediction.predictedValue;
      
      const metricLabel = metric === 'sleepQuality' ? 'Sleep Quality' : 'Stress Level';
      const direction = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      const changeText = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
      
      console.log(`   ${metricLabel}: ${newPrediction.predictedValue.toFixed(1)}/10 ${direction} (${changeText})`);
    });
    
    // Give advice
    if (scenario.name.includes('Cut')) {
      console.log(`   💡 Advice: This will likely improve your sleep and reduce stress!`);
    } else {
      console.log(`   💡 Advice: This might hurt your sleep and increase stress, but could boost your mood.`);
    }
  });
}

/**
 * Main function
 */
function runSimpleExample() {
  console.log('🚀 FINANCIAL-WELLBEING IMPACT ANALYSIS - SIMPLE EXAMPLE');
  console.log('='.repeat(80));
  console.log('This example shows how entertainment spending affects sleep and stress.\n');
  
  try {
    // Step 1: Create simple data with clear patterns
    const { transactions, wellbeingData } = createSimpleExample();
    
    // Step 2: Show correlation analysis
    const { weeklyData, correlations } = showCorrelationAnalysis(transactions, wellbeingData);
    
    // Step 3: Show predictive modeling
    showPredictiveModeling(weeklyData, correlations);
    
    // Step 4: Show What-If scenarios
    showWhatIfScenarios(weeklyData, correlations);
    
    console.log('\n\n🎉 SIMPLE EXAMPLE COMPLETED!');
    console.log('='.repeat(80));
    console.log('Key Takeaways:');
    console.log('• The system found strong correlations between entertainment spending and wellbeing');
    console.log('• It can predict how different spending decisions will affect your sleep and stress');
    console.log('• What-If scenarios help you make informed financial decisions');
    console.log('• This is the "wow feature" that connects money and happiness!');
    
  } catch (error) {
    console.error('❌ Simple example failed:', error);
    throw error;
  }
}

// Run example if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  runSimpleExample();
}

export { runSimpleExample };
