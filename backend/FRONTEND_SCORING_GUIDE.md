# 🎯 **Frontend Scoring System Guide**

## ✅ **What You Have:**

**Complete Wellness & Finance Scoring System** with easy-to-display metrics for your React Native app!

## 🚀 **Available API Functions:**

### **1. Complete Scoring System**
```typescript
import { getScoringSystem } from './scoringAPI';

const result = await getScoringSystem(moodEntries, transactions);

// Result includes:
result.overallScore        // 0-100 overall score
result.wellnessScore       // 0-100 wellness score  
result.financeScore        // 0-100 finance score
result.overallGrade        // 'A', 'B', 'C', 'D', 'F'
result.overallStatus       // 'excellent', 'good', 'fair', etc.
result.wellnessBreakdown   // { physical, mental, social }
result.financeBreakdown    // { spending, budgeting, stability }
result.keyMetrics          // { correlation, spendingConsistency, stressLevel, socialConnection }
result.topInsights         // Array of key insights
result.topActions          // Array of priority actions
result.trends              // { wellness: { improving, declining, stable }, finance: {...} }
```

### **2. Quick Scores (Dashboard)**
```typescript
import { getQuickScores } from './scoringAPI';

const scores = await getQuickScores(moodEntries, transactions);

// Simple scores for dashboard:
scores.overallScore        // 0-100
scores.wellnessScore       // 0-100
scores.financeScore        // 0-100
scores.overallGrade        // 'A', 'B', 'C', 'D', 'F'
scores.overallStatus       // 'excellent', 'good', 'fair', etc.
```

### **3. Individual Scores**
```typescript
import { getWellnessScore, getFinanceScore } from './scoringAPI';

// Wellness score only
const wellness = await getWellnessScore(moodEntries);
wellness.overall           // 0-100
wellness.breakdown         // { physical, mental, social }
wellness.insights          // Array of insights
wellness.recommendations   // Array of recommendations

// Finance score only
const finance = await getFinanceScore(transactions);
finance.overall            // 0-100
finance.breakdown          // { spending, budgeting, stability }
finance.insights           // Array of insights
finance.recommendations    // Array of recommendations
```

## 📱 **Frontend Integration Examples:**

### **Dashboard Component**
```typescript
// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getQuickScores } from './scoringAPI';

export const Dashboard = ({ moodEntries, transactions }) => {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const loadScores = async () => {
      const result = await getQuickScores(moodEntries, transactions);
      setScores(result);
    };
    loadScores();
  }, [moodEntries, transactions]);

  if (!scores) return <Text>Loading scores...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Scores</Text>
      
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall</Text>
        <Text style={styles.scoreValue}>{scores.overallScore}/100</Text>
        <Text style={styles.grade}>{scores.overallGrade}</Text>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Wellness</Text>
          <Text style={styles.scoreValue}>{scores.wellnessScore}/100</Text>
        </View>
        
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Finance</Text>
          <Text style={styles.scoreValue}>{scores.financeScore}/100</Text>
        </View>
      </View>
    </View>
  );
};
```

### **Detailed Scores Component**
```typescript
// DetailedScores.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getScoringSystem } from './scoringAPI';

export const DetailedScores = ({ moodEntries, transactions }) => {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const loadScores = async () => {
      const result = await getScoringSystem(moodEntries, transactions);
      setScores(result);
    };
    loadScores();
  }, [moodEntries, transactions]);

  if (!scores) return <Text>Loading detailed scores...</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Overall Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Summary</Text>
        <Text style={styles.overallScore}>{scores.overallScore}/100</Text>
        <Text style={styles.grade}>Grade: {scores.overallGrade}</Text>
        <Text style={styles.status}>Status: {scores.overallStatus}</Text>
      </View>

      {/* Wellness Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wellness Breakdown</Text>
        <Text>Overall: {scores.wellnessScore}/100</Text>
        <Text>Physical: {scores.wellnessBreakdown.physical}/100</Text>
        <Text>Mental: {scores.wellnessBreakdown.mental}/100</Text>
        <Text>Social: {scores.wellnessBreakdown.social}/100</Text>
      </View>

      {/* Finance Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finance Breakdown</Text>
        <Text>Overall: {scores.financeScore}/100</Text>
        <Text>Spending: {scores.financeBreakdown.spending}/100</Text>
        <Text>Budgeting: {scores.financeBreakdown.budgeting}/100</Text>
        <Text>Stability: {scores.financeBreakdown.stability}/100</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <Text>Correlation: {scores.keyMetrics.correlation.toFixed(3)}</Text>
        <Text>Spending Consistency: {scores.keyMetrics.spendingConsistency.toFixed(1)}/100</Text>
        <Text>Stress Level: {scores.keyMetrics.stressLevel.toFixed(1)}/10</Text>
        <Text>Social Connection: {scores.keyMetrics.socialConnection.toFixed(1)}/10</Text>
      </View>

      {/* Top Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Insights</Text>
        {scores.topInsights.map((insight, index) => (
          <Text key={index} style={styles.insight}>
            {index + 1}. {insight}
          </Text>
        ))}
      </View>

      {/* Top Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority Actions</Text>
        {scores.topActions.map((action, index) => (
          <Text key={index} style={styles.action}>
            {index + 1}. {action}
          </Text>
        ))}
      </View>

      {/* Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trends</Text>
        <Text style={styles.trendTitle}>Wellness:</Text>
        {scores.trends.wellness.improving.length > 0 && (
          <Text>✅ Improving: {scores.trends.wellness.improving.join(', ')}</Text>
        )}
        {scores.trends.wellness.declining.length > 0 && (
          <Text>⚠️ Declining: {scores.trends.wellness.declining.join(', ')}</Text>
        )}
        {scores.trends.wellness.stable.length > 0 && (
          <Text>📊 Stable: {scores.trends.wellness.stable.join(', ')}</Text>
        )}
        
        <Text style={styles.trendTitle}>Finance:</Text>
        {scores.trends.finance.improving.length > 0 && (
          <Text>✅ Improving: {scores.trends.finance.improving.join(', ')}</Text>
        )}
        {scores.trends.finance.declining.length > 0 && (
          <Text>⚠️ Declining: {scores.trends.finance.declining.join(', ')}</Text>
        )}
        {scores.trends.finance.stable.length > 0 && (
          <Text>📊 Stable: {scores.trends.finance.stable.join(', ')}</Text>
        )}
      </View>
    </ScrollView>
  );
};
```

## 🎯 **Key Features:**

### **Easy-to-Display Metrics:**
- ✅ **0-100 scores** for all categories
- ✅ **Letter grades** (A, B, C, D, F)
- ✅ **Status indicators** (excellent, good, fair, etc.)
- ✅ **Trend analysis** (improving, declining, stable)
- ✅ **Key insights** and **priority actions**

### **Flexible API:**
- ✅ **Complete system** - All metrics and insights
- ✅ **Quick scores** - Just the main scores for dashboard
- ✅ **Individual scores** - Wellness or finance only
- ✅ **Structured data** - Ready for UI components

### **AI-Powered Insights:**
- ✅ **Gemini AI analysis** of mood and spending patterns
- ✅ **Personalized recommendations** based on user data
- ✅ **Trend detection** and **correlation analysis**
- ✅ **Actionable insights** for improvement

## 🚀 **Ready to Use:**

**Just import the functions and start displaying scores in your React Native app!**

The system provides:
1. **Wellness scores** (0-100) with physical, mental, social breakdown
2. **Finance scores** (0-100) with spending, budgeting, stability breakdown  
3. **Overall scores** with grades and status
4. **Key insights** and **priority actions**
5. **Trend analysis** for both wellness and finance

**Your frontend team can easily integrate these scores into any UI component!** 🎯
