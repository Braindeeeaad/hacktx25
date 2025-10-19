# Financial-Wellbeing Impact Analysis Module

This module provides advanced statistical analysis and AI-powered insights to understand the relationship between financial behavior and emotional wellbeing. It's the "wow feature" that connects your financial data with wellbeing metrics to provide actionable, personalized recommendations.

## 🧠 Core Features

### 1. Correlation Analysis
- **Spearman's Rank Correlation**: Finds relationships between financial and wellbeing metrics
- **Statistical Significance**: Identifies meaningful correlations (not just random patterns)
- **Multi-metric Analysis**: Analyzes 8 financial metrics against 5 wellbeing metrics

### 2. Predictive Modeling
- **Linear Regression**: Predicts wellbeing impact of financial decisions
- **What-If Scenarios**: Simulates the impact of different spending choices
- **Confidence Scoring**: Provides reliability estimates for predictions

### 3. AI-Powered Insights
- **Gemini 2.5 Pro Integration**: Generates personalized, actionable recommendations
- **Contextual Analysis**: Considers both positive and negative correlations
- **Real-time Insights**: Quick analysis for immediate decision-making

## 📊 Supported Metrics

### Financial Metrics
- **Total Spending**: Overall weekly/monthly spending
- **Entertainment Spending**: Movies, games, events, etc.
- **Food & Dining**: Restaurants, takeout, groceries
- **Shopping**: Retail purchases, online shopping
- **Transportation**: Gas, public transit, rideshare
- **Self-Care**: Health, fitness, personal care
- **Savings Rate**: Percentage of income saved
- **Unusual Spending**: Anomaly detection for large purchases

### Wellbeing Metrics
- **Overall Wellbeing**: General life satisfaction (1-10 scale)
- **Stress Levels**: Perceived stress (1-10 scale, inverted for analysis)
- **Sleep Quality**: Rest and recovery quality (1-10 scale)
- **Energy Levels**: Daily energy and motivation (1-10 scale)
- **Mood**: Emotional state and happiness (1-10 scale)

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { ImpactAnalyzer } from './analysis';

// Initialize with your Gemini API key
const analyzer = new ImpactAnalyzer(process.env.GEMINI_API_KEY);

// Your financial transactions
const transactions = [
  { date: '2024-01-01', category: 'Food', amount: 25.50 },
  { date: '2024-01-02', category: 'Entertainment', amount: 45.00 },
  // ... more transactions
];

// Your wellbeing data
const wellbeingData = [
  { 
    date: '2024-01-01', 
    overallWellbeing: 7, 
    stressLevel: 4, 
    sleepQuality: 8, 
    energyLevel: 6, 
    mood: 7 
  },
  // ... more wellbeing records
];

// Run complete analysis
const analysis = await analyzer.analyzeFinancialWellbeingImpact(
  transactions, 
  wellbeingData
);

console.log(analysis.report.summary);
console.log(analysis.report.keyInsights);
```

### 2. Quick Insights

```typescript
// Get a quick, actionable insight
const insight = await analyzer.generateQuickInsight(
  recentTransactions, 
  recentWellbeingData
);

console.log(insight.insight);
console.log(insight.action);
```

### 3. API Integration

```typescript
import { analysisRoutes } from './analysis';

// Add to your Express app
app.use('/api/analysis', analysisRoutes);

// Available endpoints:
// GET /api/analysis/financial-wellbeing-impact
// POST /api/analysis/financial-wellbeing-impact
// GET /api/analysis/quick-insight
// POST /api/analysis/quick-insight
// GET /api/analysis/health-check
// GET /api/analysis/capabilities
```

## 📈 Example Output

### Correlation Analysis Results
```json
{
  "correlations": [
    {
      "metric": "entertainmentSpending",
      "wellbeingMetric": "stressLevel",
      "correlation": -0.742,
      "strength": "strong",
      "direction": "negative",
      "significance": 0.258
    }
  ]
}
```

### AI-Generated Insights
```json
{
  "summary": "Your data shows that entertainment spending has a strong negative correlation with stress levels, suggesting that nights out significantly reduce your stress.",
  "keyInsights": [
    {
      "title": "Entertainment Spending Reduces Stress",
      "insight": "For every $100 spent on entertainment, your stress levels tend to decrease by 0.8 points.",
      "actionableAdvice": [
        "Allocate $50-100 weekly for entertainment activities",
        "Prioritize social activities over solo entertainment"
      ],
      "confidence": "high",
      "priority": "high",
      "category": "lifestyle"
    }
  ]
}
```

### What-If Scenario Analysis
```json
{
  "scenario": "Reduce Entertainment Spending",
  "changes": { "entertainmentSpending": -100 },
  "predictedImpact": {
    "stressLevel": {
      "predictedValue": 6.2,
      "confidence": "high",
      "factors": [
        { "metric": "entertainmentSpending", "impact": 0.8, "contribution": 85 }
      ]
    }
  },
  "recommendation": "This scenario may increase stress levels. Consider reducing entertainment spending gradually."
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Required for AI insights
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Custom Gemini API URL
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent
```

### Data Requirements
- **Minimum**: 3 weeks of data
- **Recommended**: 8+ weeks for reliable insights
- **Frequency**: Weekly aggregation works best
- **Quality**: Consistent data entry improves accuracy

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npx ts-node src/analysis/testImpactAnalysis.ts

# Run specific tests
npx ts-node src/analysis/testImpactAnalysis.ts data
npx ts-node src/analysis/testImpactAnalysis.ts correlation
npx ts-node src/analysis/testImpactAnalysis.ts modeling
npx ts-node src/analysis/testImpactAnalysis.ts complete
```

## 📚 API Reference

### ImpactAnalyzer Class

#### `analyzeFinancialWellbeingImpact(transactions, wellbeingData)`
Performs comprehensive analysis including correlations, predictions, and AI insights.

**Returns**: `ImpactAnalysisResult`
- `report`: AI-generated insights and recommendations
- `correlations`: Statistical correlation results
- `models`: Trained regression models
- `weeklyData`: Aggregated weekly data points
- `metadata`: Analysis metadata

#### `generateQuickInsight(transactions, wellbeingData)`
Generates a quick, actionable insight for real-time decision making.

**Returns**: `QuickInsightResult`
- `insight`: Specific, actionable insight
- `action`: Concrete action to take
- `expectedImpact`: Predicted positive change
- `timeframe`: When to expect results
- `confidence`: Reliability of the insight

### CorrelationAnalyzer Class

#### `aggregateWeeklyData(transactions, wellbeingData)`
Aggregates daily transactions and wellbeing data into weekly data points.

#### `analyzeCorrelations(weeklyData)`
Performs statistical correlation analysis between financial and wellbeing metrics.

#### `getStrongestCorrelations(correlations, limit)`
Returns the most significant correlations for insights.

### PredictiveModeling Class

#### `trainModel(weeklyData, targetWellbeingMetric, correlations)`
Trains a linear regression model for predicting wellbeing impact.

#### `makePrediction(model, financialData)`
Makes a prediction using a trained model.

#### `generateWhatIfScenarios(models, currentData, scenarios)`
Generates What-If scenario analysis for different spending decisions.

## 🎯 Use Cases

### 1. Personal Finance Apps
- Show users how their spending affects their mood and stress
- Provide personalized recommendations based on spending patterns
- Help users make informed financial decisions

### 2. Wellness Platforms
- Connect financial health with mental health
- Provide holistic wellness insights
- Encourage healthy financial behaviors

### 3. Financial Coaching
- Give coaches data-driven insights about client behavior
- Identify patterns that affect client wellbeing
- Provide evidence-based recommendations

### 4. Research and Analytics
- Study the relationship between money and happiness
- Generate insights for financial wellness programs
- Create personalized financial advice systems

## 🔮 Future Enhancements

- **Machine Learning Models**: More sophisticated prediction algorithms
- **Real-time Analysis**: Live correlation updates as data comes in
- **Cohort Analysis**: Compare individual patterns with similar users
- **Seasonal Patterns**: Account for seasonal variations in spending and mood
- **Goal Setting**: Help users set and track financial-wellbeing goals
- **Integration APIs**: Connect with more financial and wellness data sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This module is part of the Financial-Wellbeing Impact Analysis system and follows the same license as the main project.

---

**Note**: This module requires a valid Gemini API key for AI-powered insights. The correlation analysis and predictive modeling work independently, but the full experience requires the AI integration.
