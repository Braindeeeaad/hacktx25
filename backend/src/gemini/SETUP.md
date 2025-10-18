# 🚀 Quick Setup Guide

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Step 2: Set Your API Key in the Code

1. Open `src/ai/gemini/analyzeSpending.ts`
2. Find this line near the top:
   ```typescript
   const GEMINI_API_KEY = 'your-gemini-api-key-here';
   ```
3. Replace `'your-gemini-api-key-here'` with your actual API key:
   ```typescript
   const GEMINI_API_KEY = 'AIzaSyC...your-actual-api-key-here';
   ```

## Step 3: Install Dependencies

```bash
npm install @google/generative-ai typescript @types/node
```

## Step 4: Test the Module

```bash
# Run the example
npx ts-node src/ai/gemini/example.ts

# Or run the tests
npx ts-node src/ai/gemini/test.ts
```

## Step 5: Use in Your Code

```typescript
import { analyzeSpending } from './src/ai/gemini';

const transactions = [
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  // ... more transactions
];

const analysis = await analyzeSpending(transactions);
console.log(analysis);
```

## ✅ That's it! 

Your AI spending analysis module is ready to use. The module will automatically:
- Detect time spans (days, weeks, months)
- Analyze spending patterns by category
- Identify anomalies and trends
- Generate AI-powered insights and recommendations

## 🔧 Troubleshooting

**Error: "Please set your Gemini API key"**
- Make sure you've replaced the placeholder API key with your actual key

**Error: "API key appears to be invalid"**
- Check that your API key is correct and active
- Ensure it's properly formatted as a string

**Error: "Invalid transaction data"**
- Make sure your transaction data follows the correct format
- Check that dates are in YYYY-MM-DD format
- Ensure amounts are positive numbers
