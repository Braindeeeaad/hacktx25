# Mood Integration Guide

## Overview
This guide shows how to seamlessly integrate mood data from your frontend with the existing spending analysis system. The integration maintains the same date format (YYYY-MM-DD) and enhances your financial wellness coaching with emotional insights.

## 🏗️ Architecture

### Current System
- ✅ Spending analysis with Gemini 2.5 Pro
- ✅ Nessie API integration
- ✅ Financial insights and recommendations

### New Mood Integration
- 🧠 Mood data storage in Cloudflare D1
- 🔗 Mood-spending correlation analysis
- 🎯 Predictive emotional spending alerts
- 💡 Mood-based wellness recommendations

## 📊 Data Flow

```
Frontend Mood Input → Cloudflare D1 → Mood Analysis → Enhanced Spending Analysis
```

## 🔧 Setup Instructions

### 1. Cloudflare D1 Setup
1. Create a Cloudflare D1 database
2. Get your Account ID, API Token, and Database ID
3. Add to your `.env` file:
```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_D1_DATABASE_ID=your-database-id
```

### 2. Database Schema
The system automatically creates the mood_entries table with:
- `id`: Unique identifier
- `user_id`: User identifier
- `date`: YYYY-MM-DD format (same as spending data)
- `mood`: very_happy, happy, neutral, sad, very_sad
- `energy`: very_high, high, medium, low, very_low
- `stress`: very_low, low, medium, high, very_high
- `notes`: Optional text notes
- `tags`: JSON array of tags
- `location`: Optional location
- `weather`: Optional weather data

## 🚀 Usage Examples

### Basic Mood-Enhanced Analysis
```typescript
import { MoodEnhancedAnalyzer } from './moodEnhancedAnalysis';

const analyzer = new MoodEnhancedAnalyzer();

// Analyze spending with mood data
const analysis = await analyzer.analyzeWithMood(
  transactions,      // Your existing transaction data
  userId,            // User ID
  startDate,         // YYYY-MM-DD format
  endDate            // YYYY-MM-DD format
);
```

### Adding Mood Data
```typescript
// Add a mood entry
const moodEntry = await analyzer.addMoodEntry({
  userId: 'user-123',
  date: '2025-10-18',        // Same format as spending data
  mood: 'happy',
  energy: 'high',
  stress: 'low',
  notes: 'Great day at work',
  tags: ['work', 'productive']
});
```

### Getting Mood Data
```typescript
// Get mood entries for a date range
const moodEntries = await analyzer.getMoodEntries(
  userId,
  startDate,
  endDate
);
```

## 🧠 Enhanced Analysis Features

### 1. Mood-Spending Correlations
- Detects correlation between mood and spending
- Identifies emotional spending triggers
- Provides daily correlation scores

### 2. Emotional Spending Patterns
- **Low Mood Spending**: Spending more when feeling down
- **High Mood Spending**: Celebratory spending when feeling good
- **Weekend Mood Patterns**: Mood-based weekend spending
- **Stress Spending**: Spending during high-stress periods

### 3. Predictive Alerts
- **Mood-Spending Alerts**: Warns about emotional spending patterns
- **Emotional Triggers**: Identifies potential spending triggers
- **Wellness Reminders**: Suggests mood-boosting activities

### 4. Mood-Based Recommendations
- Alternative activities for emotional spending
- Stress management techniques
- Mood-boosting suggestions
- Budget adjustments based on emotional patterns

## 🎯 Integration with Frontend

### Frontend Mood Input
Your frontend should collect:
```typescript
interface MoodInput {
  mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
  energy: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  stress: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  notes?: string;
  tags?: string[];
  location?: string;
  weather?: string;
}
```

### API Endpoints
Create these endpoints in your backend:
```typescript
// POST /api/mood
app.post('/api/mood', async (req, res) => {
  const { userId, date, mood, energy, stress, notes, tags, location, weather } = req.body;
  
  const analyzer = new MoodEnhancedAnalyzer();
  const moodEntry = await analyzer.addMoodEntry({
    userId,
    date,
    mood,
    energy,
    stress,
    notes,
    tags,
    location,
    weather
  });
  
  res.json(moodEntry);
});

// GET /api/mood/:userId/:startDate/:endDate
app.get('/api/mood/:userId/:startDate/:endDate', async (req, res) => {
  const { userId, startDate, endDate } = req.params;
  
  const analyzer = new MoodEnhancedAnalyzer();
  const moodEntries = await analyzer.getMoodEntries(userId, startDate, endDate);
  
  res.json(moodEntries);
});

// POST /api/analysis/mood-enhanced
app.post('/api/analysis/mood-enhanced', async (req, res) => {
  const { transactions, userId, startDate, endDate } = req.body;
  
  const analyzer = new MoodEnhancedAnalyzer();
  const analysis = await analyzer.analyzeWithMood(transactions, userId, startDate, endDate);
  
  res.json(analysis);
});
```

## 🧪 Testing

### Run Mood-Enhanced Test
```bash
npx ts-node --project backend/tsconfig.json backend/src/gemini/moodEnhancedTest.ts
```

This will:
1. Initialize the mood database
2. Add sample mood data
3. Perform mood-enhanced analysis
4. Display comprehensive results

### Test Results Include
- Financial summary with mood correlations
- Emotional insights from Gemini AI
- Mood-based recommendations
- Emotional spending patterns
- Predictive alerts

## 🔄 Seamless Integration

### Existing Code Changes
**Minimal changes required!** Your existing code continues to work:

```typescript
// Your existing analysis (still works)
const analysis = await analyzeSpending(transactions);

// New mood-enhanced analysis (enhanced version)
const moodAnalysis = await analyzer.analyzeWithMood(transactions, userId, startDate, endDate);
```

### Backward Compatibility
- ✅ All existing functions work unchanged
- ✅ Same date format (YYYY-MM-DD)
- ✅ Same transaction format
- ✅ Same analysis structure (enhanced with mood data)

## 🎯 Key Benefits

### 1. Emotional Spending Detection
- Identifies when mood affects spending
- Warns about emotional spending triggers
- Suggests alternative mood-boosting activities

### 2. Predictive Wellness Coaching
- Detects stress patterns before they affect spending
- Suggests wellness activities (meditation, exercise)
- Provides emotional support recommendations

### 3. Personalized Insights
- Mood-based spending recommendations
- Emotional pattern recognition
- Personalized wellness coaching

### 4. Proactive Alerts
- Warns about potential emotional spending
- Suggests mood-boosting activities
- Provides stress management recommendations

## 🚀 Next Steps

1. **Set up Cloudflare D1** with your credentials
2. **Test the integration** with the provided test file
3. **Add mood input** to your frontend
4. **Create API endpoints** for mood data
5. **Deploy and monitor** the enhanced analysis

The system is designed to work seamlessly with your existing spending analysis while adding powerful emotional wellness insights! 🎉
