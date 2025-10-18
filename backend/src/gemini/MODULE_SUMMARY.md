# AI Spending Analysis Module - Complete Implementation

## 🎯 Overview

This is a self-contained AI analysis module that uses Gemini 2.5 Pro to analyze user spending patterns across any arbitrary time range. The module automatically detects time spans and adjusts its comparisons dynamically.

## 📁 File Structure

```
src/ai/gemini/
├── analyzeSpending.ts          # Main analysis function
├── types.ts                    # TypeScript interfaces
├── index.ts                    # Module exports
├── README.md                   # Documentation
├── example.ts                  # Usage example
├── test.ts                     # Test suite
├── config.example.ts           # Configuration template
├── MODULE_SUMMARY.md           # This file
├── utils/
│   ├── dataProcessor.ts        # Data processing utilities
│   ├── errorHandler.ts         # Error handling utilities
│   └── validators.ts           # Input validation
└── prompts/
    └── spendingAnalysisPrompt.ts  # AI system prompt
```

## 🚀 Key Features

### ✅ Automatic Time Span Detection
- Detects days, weeks, or months automatically
- Adjusts analysis based on data range
- Handles any arbitrary time period

### ✅ Category Analysis
- Groups spending by category
- Calculates totals, averages, and percentage changes
- Identifies trends (up, down, stable)

### ✅ Anomaly Detection
- Uses statistical analysis (2+ standard deviations)
- Identifies unusual spikes or drops
- Provides contextual explanations

### ✅ AI-Powered Insights
- Uses Gemini 2.5 Pro for intelligent analysis
- Generates contextual recommendations
- Provides psychologically-aware insights

### ✅ Robust Error Handling
- Comprehensive input validation
- Graceful fallback when AI fails
- Detailed error logging and reporting

## 🔧 Usage

```typescript
import { analyzeSpending } from './src/ai/gemini';

const transactions = [
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  // ... more transactions
];

const analysis = await analyzeSpending(transactions);
```

## 📊 Input Format

```typescript
interface Transaction {
  date: string;        // ISO date string (YYYY-MM-DD)
  category: string;    // Spending category
  amount: number;      // Amount spent (positive number)
}
```

## 📈 Output Format

```typescript
interface AnalysisResult {
  summary: {
    totalSpent: number;
    averageDaily: number;
    spanDays: number;
  };
  categories: Array<{
    category: string;
    trend: 'up' | 'down' | 'stable';
    change: string;     // e.g., "+12.3%"
    note: string;      // AI-generated insight
  }>;
  anomalies: Array<{
    date: string;
    category: string;
    amount: number;
    reason: string;
  }>;
  recommendations: string[];
}
```

## 🛠️ Dependencies

- `@google/generative-ai`: Google's Generative AI SDK
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

## 🔐 API Key Setup

Set your Gemini API key directly in the code:

1. Open `src/ai/gemini/analyzeSpending.ts`
2. Find the line: `const GEMINI_API_KEY = 'your-gemini-api-key-here';`
3. Replace `'your-gemini-api-key-here'` with your actual API key
4. Get your API key from: https://makersuite.google.com/app/apikey

## 📋 Validation Rules

- Maximum 10,000 transactions per analysis
- Date range limited to 1 year
- Transactions cannot be more than 30 days in the future
- All amounts must be positive numbers
- Dates must be valid ISO format

## 🧪 Testing

Run the test suite:
```bash
npx ts-node src/ai/gemini/test.ts
```

Run the example:
```bash
npx ts-node src/ai/gemini/example.ts
```

## 🎯 Module Benefits

1. **Self-Contained**: No dependencies on existing frontend code
2. **Type-Safe**: Full TypeScript support with comprehensive interfaces
3. **Robust**: Comprehensive error handling and validation
4. **Flexible**: Works with any time range and transaction data
5. **Intelligent**: AI-powered insights and recommendations
6. **Production-Ready**: Includes logging, error handling, and fallbacks

## 🔄 Integration

The module is designed to be easily integrated into any backend or analytics dashboard. Simply import the `analyzeSpending` function and pass your transaction data.

## 📝 Next Steps

1. Set up your Gemini API key
2. Install dependencies: `npm install`
3. Import and use the module in your application
4. Customize the system prompt if needed
5. Add additional validation rules as required

The module is ready for production use and can be easily extended with additional features as needed.
