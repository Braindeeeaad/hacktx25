# 🚀 Complete Guide: AI Spending Analysis Module

## 🎯 **What This Module Does**

This is a **self-contained AI analysis module** that uses **Gemini 2.5 Pro** to analyze spending patterns. It automatically:

- ✅ **Detects time spans** (days, weeks, months)
- ✅ **Groups spending by category** 
- ✅ **Finds anomalies** (unusual spending)
- ✅ **Calculates trends** (percentage changes)
- ✅ **Generates AI insights** and recommendations

## 🏗️ **Module Architecture**

```
src/ai/gemini/
├── analyzeSpending.ts          # 🎯 Main function
├── types.ts                    # 📋 Data structures
├── utils/
│   ├── dataProcessor.ts        # 🔄 Data processing
│   ├── errorHandler.ts         # ⚠️ Error handling
│   └── validators.ts           # ✅ Input validation
├── prompts/
│   └── spendingAnalysisPrompt.ts  # 🤖 AI prompt
├── apiIntegration.ts           # 🔌 API integration
├── apiExamples.ts              # 📚 Real API examples
└── README.md, SETUP.md, etc.   # 📖 Documentation
```

## 🔧 **How It Works - Step by Step**

### **Step 1: Data Input**
```typescript
const transactions = [
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  // ... more transactions
];
```

### **Step 2: Data Processing**
The module automatically:
- **Validates** input data (dates, amounts, categories)
- **Groups** by category and time periods
- **Calculates** totals, averages, trends
- **Detects** anomalies (statistical outliers)

### **Step 3: AI Analysis**
- **Sends** processed data to Gemini 2.5 Pro
- **Uses** specialized financial wellness prompt
- **Receives** intelligent insights and recommendations

### **Step 4: Structured Output**
```typescript
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

## 🔌 **API Integration Examples**

### **Example 1: Basic Usage**
```typescript
import { analyzeSpending } from './src/ai/gemini';

// Your transaction data
const transactions = [
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  // ... more transactions
];

// Run analysis
const analysis = await analyzeSpending(transactions);
console.log(analysis);
```

### **Example 2: Plaid API Integration**
```typescript
import { PlaidIntegration } from './src/ai/gemini/apiExamples';

const plaid = new PlaidIntegration(
  'your-plaid-client-id',
  'your-plaid-secret', 
  'your-access-token'
);

// Fetch and analyze transactions
const analysis = await plaid.analyzeSpending('2025-09-01', '2025-10-01');
```

### **Example 3: YNAB API Integration**
```typescript
import { YNABIntegration } from './src/ai/gemini/apiExamples';

const ynab = new YNABIntegration(
  'your-ynab-api-key',
  'your-budget-id'
);

// Analyze current month
const analysis = await ynab.analyzeSpending('2025-09-01', '2025-10-01');
```

### **Example 4: Custom API Integration**
```typescript
import { SpendingAnalysisService } from './src/ai/gemini/apiIntegration';

const service = new SpendingAnalysisService(
  'https://your-api.com/api/v1',
  'your-api-key'
);

// Analyze last 30 days
const analysis = await service.analyzeRecentDays(30);
```

### **Example 5: CSV File Integration**
```typescript
import { CSVIntegration } from './src/ai/gemini/apiExamples';

const csvIntegration = new CSVIntegration();

const csvContent = `date,category,amount
2025-09-29,Food,21.75
2025-09-29,Transport,10.00`;

const analysis = await csvIntegration.analyzeFromCSV(csvContent);
```

## 🛠️ **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install @google/generative-ai typescript @types/node
```

### **2. Set Your API Key**
Open `src/ai/gemini/analyzeSpending.ts` and replace:
```typescript
const GEMINI_API_KEY = 'your-gemini-api-key-here';
```
With your actual API key:
```typescript
const GEMINI_API_KEY = 'AIzaSyC...your-actual-api-key';
```

### **3. Get Your Gemini API Key**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## 📊 **Data Format Requirements**

### **Input Format**
```typescript
interface Transaction {
  date: string;        // ISO date (YYYY-MM-DD)
  category: string;    // Spending category
  amount: number;      // Positive number
}
```

### **Output Format**
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
    note: string;       // AI insight
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

## 🚀 **Real-World Usage Scenarios**

### **Scenario 1: Personal Finance App**
```typescript
// In your React/Next.js app
import { analyzeSpending } from './src/ai/gemini';

export async function analyzeUserSpending(userId: string) {
  // Fetch user's transactions from your database
  const transactions = await fetchUserTransactions(userId);
  
  // Run AI analysis
  const analysis = await analyzeSpending(transactions);
  
  // Display results in your UI
  return analysis;
}
```

### **Scenario 2: Banking App Integration**
```typescript
// Connect with bank API
import { BankAPIIntegration } from './src/ai/gemini/apiExamples';

const bankAPI = new BankAPIIntegration(
  'your-bank-api-key',
  'https://api.yourbank.com'
);

// Analyze customer spending
const analysis = await bankAPI.analyzeSpending('2025-09-01', '2025-10-01');
```

### **Scenario 3: Financial Dashboard**
```typescript
// Create a spending insights dashboard
export async function createSpendingDashboard(userId: string) {
  const service = new SpendingAnalysisService(apiUrl, apiKey);
  
  // Get different time period analyses
  const weekly = await service.analyzeRecentDays(7);
  const monthly = await service.analyzeCurrentMonth();
  
  return {
    weekly,
    monthly,
    insights: {
      totalSpent: monthly.summary.totalSpent,
      topCategory: monthly.categories[0],
      anomalies: monthly.anomalies.length
    }
  };
}
```

## 🔧 **Advanced Features**

### **Error Handling**
```typescript
try {
  const analysis = await analyzeSpending(transactions);
  // Use analysis results
} catch (error) {
  if (error.message.includes('API key')) {
    // Handle API key issues
  } else if (error.message.includes('Invalid transaction')) {
    // Handle data validation issues
  } else {
    // Handle other errors
  }
}
```

### **Custom Validation**
```typescript
import { validateTransactionArray } from './src/ai/gemini/utils/validators';

// Validate before analysis
const validatedData = validateTransactionArray(rawTransactions);
const analysis = await analyzeSpending(validatedData);
```

### **Batch Processing**
```typescript
// Analyze multiple users
const userIds = ['user1', 'user2', 'user3'];
const analyses = await Promise.all(
  userIds.map(async (userId) => {
    const transactions = await fetchUserTransactions(userId);
    return await analyzeSpending(transactions);
  })
);
```

## 📈 **Performance & Limits**

- **Max transactions**: 10,000 per analysis
- **Date range**: Up to 1 year
- **API calls**: 1 per analysis (to Gemini)
- **Processing time**: ~2-5 seconds depending on data size
- **Memory usage**: Minimal (processes data in chunks)

## 🎯 **Key Benefits**

1. **Self-contained**: No external dependencies except Gemini API
2. **Type-safe**: Full TypeScript support
3. **Robust**: Comprehensive error handling
4. **Flexible**: Works with any time range
5. **Intelligent**: AI-powered insights
6. **Production-ready**: Includes logging and fallbacks

## 🚀 **Next Steps**

1. **Set your API key** in `analyzeSpending.ts`
2. **Choose your integration method** (direct data, API, CSV)
3. **Test with sample data** using the example files
4. **Integrate into your app** using the provided examples
5. **Customize the AI prompt** if needed for your use case

The module is ready to use and can be easily integrated into any application that needs intelligent spending analysis! 🎉
