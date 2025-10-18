# AI Spending Analysis Module

A self-contained AI analysis module that uses Gemini 2.5 Pro to analyze user spending patterns across any arbitrary time range.

## Features

- **Automatic Time Span Detection**: Automatically detects and adjusts analysis for days, weeks, or months
- **Category Analysis**: Groups spending by category with trend analysis and percentage changes
- **Anomaly Detection**: Identifies unusual spending spikes or drops
- **AI-Powered Insights**: Uses Gemini 2.5 Pro for intelligent analysis and recommendations
- **Robust Error Handling**: Graceful fallback when AI analysis fails
- **TypeScript Support**: Full type safety and IntelliSense support

## Installation

```bash
npm install @google/generative-ai
```

## API Key Setup

Set your Gemini API key directly in the code:

1. Open `src/ai/gemini/analyzeSpending.ts`
2. Find the line: `const GEMINI_API_KEY = 'your-gemini-api-key-here';`
3. Replace `'your-gemini-api-key-here'` with your actual API key
4. Get your API key from: https://makersuite.google.com/app/apikey

## Usage

```typescript
import { analyzeSpending, Transaction } from './src/ai/gemini';

const transactions: Transaction[] = [
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  { "date": "2025-10-10", "category": "Rent", "amount": 950.00 },
  // ... more transactions
];

try {
  const analysis = await analyzeSpending(transactions);
  console.log(analysis);
} catch (error) {
  console.error('Analysis failed:', error.message);
}
```

## Input Format

The module accepts an array of transaction objects with the following structure:

```typescript
interface Transaction {
  date: string;        // ISO date string (YYYY-MM-DD)
  category: string;    // Spending category
  amount: number;      // Amount spent (positive number)
}
```

## Output Format

The module returns a structured analysis result:

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

## Error Handling

The module includes comprehensive error handling:

- **ValidationError**: Invalid input data
- **GeminiAPIError**: Issues with the AI service
- **AnalysisError**: General analysis failures

All errors include fallback analysis when possible.

## Module Structure

```
src/ai/gemini/
├── analyzeSpending.ts      # Main analysis function
├── types.ts               # TypeScript interfaces
├── index.ts              # Module exports
├── utils/
│   ├── dataProcessor.ts   # Data processing utilities
│   ├── errorHandler.ts    # Error handling utilities
│   └── validators.ts      # Input validation
└── prompts/
    └── spendingAnalysisPrompt.ts  # AI system prompt
```

## Dependencies

- `@google/generative-ai`: Google's Generative AI SDK
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions

## Limitations

- Maximum 10,000 transactions per analysis
- Date range limited to 1 year
- Transactions cannot be more than 30 days in the future
- Requires valid Gemini API key

## Example Analysis Output

```json
{
  "summary": {
    "totalSpent": 4320.56,
    "averageDaily": 144.02,
    "spanDays": 30
  },
  "categories": [
    {
      "category": "Food",
      "trend": "up",
      "change": "+12.3%",
      "note": "Increasing dining frequency"
    },
    {
      "category": "Utilities",
      "trend": "down",
      "change": "-8.7%",
      "note": "Lower seasonal usage"
    }
  ],
  "anomalies": [
    {
      "date": "2025-10-03",
      "category": "Shopping",
      "amount": 500,
      "reason": "Unusually large single purchase"
    }
  ],
  "recommendations": [
    "Monitor weekly shopping habits for consistency.",
    "Set threshold alerts for high one-day spends."
  ]
}
```
