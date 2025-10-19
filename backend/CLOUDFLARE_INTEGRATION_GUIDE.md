# 🎯 **Cloudflare Integration Guide**

## ✅ **Complete System Overview:**

**Firebase Login → Nessie API → Cloudflare D1 → Gemini Analysis**

### **Data Flow:**
1. **User logs in** with Firebase (gets Firebase UID)
2. **User inputs mood data** (0-10 scale) → Cloudflare D1
3. **Spending data** comes from Nessie API
4. **Gemini AI analyzes** mood + spending correlation
5. **Frontend displays** scores, insights, recommendations

## 🚀 **Frontend Integration:**

### **1. Add Mood Data (Frontend calls this):**
```typescript
import { CloudflareAPI } from './cloudflareAPI';

// When user submits mood data
const addMoodEntry = async (firebaseUserId: string, moodData: {
  date: string;
  overall_wellbeing: number;
  sleep_quality: number;
  physical_activity: number;
  time_with_family_friends: number;
  diet_quality: number;
  stress_levels: number;
}) => {
  const result = await CloudflareAPI.addMoodEntry(firebaseUserId, moodData);
  console.log('Mood entry added:', result.id);
};
```

### **2. Get Complete Analysis (Frontend calls this):**
```typescript
import { CloudflareAPI } from './cloudflareAPI';

// Get complete analysis for dashboard
const getCompleteAnalysis = async (firebaseUserId: string, startDate: string, endDate: string) => {
  const result = await CloudflareAPI.getCompleteAnalysis(firebaseUserId, startDate, endDate);
  
  // result.moodData - Array of mood entries from Cloudflare
  // result.spendingData - Array of transactions from Nessie
  // result.analysis - Gemini AI analysis with insights
  // result.scores - Wellness & finance scores (0-100)
  
  return result;
};
```

### **3. Get Quick Scores (Frontend calls this):**
```typescript
import { CloudflareAPI } from './cloudflareAPI';

// Get quick scores for dashboard
const getQuickScores = async (firebaseUserId: string, startDate: string, endDate: string) => {
  const scores = await CloudflareAPI.getQuickScores(firebaseUserId, startDate, endDate);
  
  // scores.overallScore - 0-100 overall score
  // scores.wellnessScore - 0-100 wellness score
  // scores.financeScore - 0-100 finance score
  // scores.overallGrade - 'A', 'B', 'C', 'D', 'F'
  // scores.overallStatus - 'excellent', 'good', 'fair', etc.
  
  return scores;
};
```

## 📱 **Frontend Component Examples:**

### **Mood Input Component:**
```typescript
// MoodInput.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CloudflareAPI } from './cloudflareAPI';
import { auth } from './firebaseConfig';

export const MoodInput = () => {
  const [overall_wellbeing, setOverallWellbeing] = useState(5);
  const [sleep_quality, setSleepQuality] = useState(5);
  const [physical_activity, setPhysicalActivity] = useState(5);
  const [time_with_family_friends, setTimeWithFamilyFriends] = useState(5);
  const [diet_quality, setDietQuality] = useState(5);
  const [stress_levels, setStressLevels] = useState(5);

  const handleSubmit = async () => {
    const firebaseUserId = auth.currentUser?.uid;
    if (!firebaseUserId) return;

    const moodData = {
      date: new Date().toISOString().split('T')[0],
      overall_wellbeing,
      sleep_quality,
      physical_activity,
      time_with_family_friends,
      diet_quality,
      stress_levels
    };

    try {
      await CloudflareAPI.addMoodEntry(firebaseUserId, moodData);
      console.log('Mood data saved to Cloudflare!');
    } catch (error) {
      console.error('Error saving mood data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>How are you feeling today?</Text>
      {/* Your 0-10 sliders here */}
      <TouchableOpacity onPress={handleSubmit}>
        <Text>Save Mood</Text>
      </TouchableOpacity>
    </View>
  );
};
```

### **Dashboard Component:**
```typescript
// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CloudflareAPI } from './cloudflareAPI';
import { auth } from './firebaseConfig';

export const Dashboard = () => {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const loadScores = async () => {
      const firebaseUserId = auth.currentUser?.uid;
      if (!firebaseUserId) return;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      try {
        const result = await CloudflareAPI.getQuickScores(
          firebaseUserId,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        setScores(result);
      } catch (error) {
        console.error('Error loading scores:', error);
      }
    };

    loadScores();
  }, []);

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

## 🔧 **Environment Variables Needed:**

```bash
# Backend .env file
GEMINI_API_KEY=your-gemini-api-key
NESSIE_API_KEY=your-nessie-api-key
NESSIE_CUSTOMER_ID=your-customer-id

# Cloudflare D1 (already configured in your database folder)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_D1_DATABASE_ID=your-database-id
```

## 🧪 **Testing the System:**

### **Test Complete Integration:**
```bash
npx ts-node --project backend/tsconfig.json backend/src/gemini/testCloudflareIntegration.ts
```

### **Test Individual Components:**
```bash
# Test Cloudflare D1
npx ts-node --project backend/tsconfig.json backend/src/database/examples/exampleUsage.ts

# Test Nessie API
npx ts-node --project backend/tsconfig.json backend/src/gemini/testSingleUserSystem.ts
```

## 🎯 **What Your Frontend Team Needs to Do:**

### **1. Add Mood Input Component:**
- ✅ **0-10 scale sliders** for all mood metrics
- ✅ **Save to Cloudflare** using `CloudflareAPI.addMoodEntry()`
- ✅ **Use Firebase UID** as the user identifier

### **2. Create Score Display Components:**
- ✅ **Dashboard** showing quick scores
- ✅ **Detailed analysis** showing insights and recommendations
- ✅ **Use CloudflareAPI functions** for data

### **3. Set Up Data Flow:**
- ✅ **Firebase login** → Get Firebase UID
- ✅ **Mood data** → Cloudflare D1
- ✅ **Spending data** → Nessie API
- ✅ **Analysis** → Gemini AI
- ✅ **Display** → React Native UI

## 🚀 **Ready to Use:**

**Your complete system will:**
- ✅ **Collect mood data** (0-10 scale) → Cloudflare D1
- ✅ **Get spending data** → Nessie API
- ✅ **Run AI analysis** → Gemini with mood correlation
- ✅ **Generate scores** → Wellness & finance scores (0-100)
- ✅ **Display insights** → Personalized recommendations

**Just add the frontend components and you're done!** 🎯
