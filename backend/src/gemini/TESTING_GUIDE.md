# 🧪 Complete Testing Guide

## 🎯 **Testing Options Available**

I've created a comprehensive testing suite that allows you to test the AI spending analysis module in multiple ways:

### **1. Local Testing (No API Required)**
- ✅ **Custom Dataset Testing** - Use your own transaction data
- ✅ **Generated Data Testing** - Realistic synthetic data
- ✅ **Pattern Detection Testing** - Test trend analysis
- ✅ **Anomaly Detection Testing** - Test outlier detection

### **2. Nessie API Integration**
- ✅ **Real API Testing** - Connect to Capital One's Nessie API
- ✅ **Mock API Testing** - Test without real API calls
- ✅ **Data Transformation** - Convert Nessie format to our format

## 🚀 **Quick Start Testing**

### **Option 1: Quick Test (Recommended)**
```bash
# Run a quick test with generated data
npx ts-node src/ai/gemini/testRunner.ts quick
```

### **Option 2: Custom Data Test**
```bash
# Test with your own dataset
npx ts-node src/ai/gemini/testRunner.ts custom
```

### **Option 3: Comprehensive Testing**
```bash
# Run all tests
npx ts-node src/ai/gemini/testRunner.ts comprehensive
```

## 🔧 **Detailed Testing Options**

### **1. Test with Your Own Data**

Create a file `myTransactions.json`:
```json
[
  { "date": "2025-09-29", "category": "Food", "amount": 21.75 },
  { "date": "2025-09-29", "category": "Transport", "amount": 10.00 },
  { "date": "2025-09-30", "category": "Food", "amount": 35.50 },
  { "date": "2025-10-01", "category": "Shopping", "amount": 120.00 },
  { "date": "2025-10-02", "category": "Shopping", "amount": 500.00 }
]
```

Then run:
```typescript
import { analyzeSpending } from './src/ai/gemini';
import * as fs from 'fs';

const myData = JSON.parse(fs.readFileSync('myTransactions.json', 'utf8'));
const analysis = await analyzeSpending(myData);
console.log(analysis);
```

### **2. Test with Generated Realistic Data**

```typescript
import { TestDataGenerator, analyzeSpending } from './src/ai/gemini';

// Generate 100 transactions for September 2025
const transactions = TestDataGenerator.generateTransactions(
  '2025-09-01', 
  '2025-09-30', 
  100
);

const analysis = await analyzeSpending(transactions);
console.log(analysis);
```

### **3. Test Pattern Detection**

```typescript
import { TestDataGenerator, analyzeSpending } from './src/ai/gemini';

// Generate transactions with specific patterns
const transactions = TestDataGenerator.generatePatternedTransactions();
const analysis = await analyzeSpending(transactions);

// This will show trend analysis
console.log('Category Trends:');
analysis.categories.forEach(cat => {
  console.log(`${cat.category}: ${cat.trend} (${cat.change})`);
});
```

### **4. Test Anomaly Detection**

```typescript
import { TestDataGenerator, analyzeSpending } from './src/ai/gemini';

// Generate transactions with anomalies
const transactions = TestDataGenerator.generateAnomalyTransactions();
const analysis = await analyzeSpending(transactions);

// This will show detected anomalies
console.log('Anomalies Found:');
analysis.anomalies.forEach(anomaly => {
  console.log(`${anomaly.date} - ${anomaly.category}: $${anomaly.amount}`);
});
```

## 🏦 **Nessie API Integration Testing**

### **Setup Nessie API**

1. **Get API Access**: Visit [Nessie API Documentation](http://api.nessieisreal.com/documentation)
2. **Get API Key**: Follow the documentation to get your API key
3. **Get Customer ID**: Create a customer and get the customer ID

### **Test with Real Nessie API**

```typescript
import { NessieAPIIntegration } from './src/ai/gemini';

const nessie = new NessieAPIIntegration(
  'your-nessie-api-key',        // From Nessie API
  'your-customer-id',           // Customer ID from Nessie
  'http://api.nessieisreal.com' // Base URL
);

// Analyze last 30 days
const analysis = await nessie.analyzeRecentDays(30);
console.log(analysis);
```

### **Test Nessie Integration Locally**

```typescript
import { NessieAPIIntegration, TestDataGenerator } from './src/ai/gemini';

// Mock Nessie integration for testing
const mockNessie = {
  getAllTransactions: async () => {
    return TestDataGenerator.generateTransactions('2025-09-01', '2025-09-30', 50);
  }
};

// Test without real API calls
const transactions = await mockNessie.getAllTransactions();
const analysis = await analyzeSpending(transactions);
```

## 📊 **Test Scenarios**

### **Scenario 1: Personal Finance App**
```typescript
// Simulate a user's spending data
const userTransactions = [
  { "date": "2025-09-01", "category": "Food", "amount": 25.50 },
  { "date": "2025-09-01", "category": "Transport", "amount": 12.00 },
  { "date": "2025-09-02", "category": "Food", "amount": 18.75 },
  // ... more transactions
];

const analysis = await analyzeSpending(userTransactions);
// Display results in your app UI
```

### **Scenario 2: Banking App Integration**
```typescript
// Connect with bank API
const bankAPI = new BankAPIIntegration('api-key', 'https://api.bank.com');
const analysis = await bankAPI.analyzeSpending('2025-09-01', '2025-09-30');
```

### **Scenario 3: CSV Data Import**
```typescript
// Import from CSV file
const csvIntegration = new CSVIntegration();
const csvContent = `date,category,amount
2025-09-29,Food,21.75
2025-09-29,Transport,10.00`;

const analysis = await csvIntegration.analyzeFromCSV(csvContent);
```

## 🧪 **Running Test Suites**

### **Local Test Suite**
```bash
# Run all local tests
npx ts-node src/ai/gemini/testRunner.ts local
```

### **Custom Data Test**
```bash
# Test with your own data
npx ts-node src/ai/gemini/testRunner.ts custom
```

### **Generated Data Test**
```bash
# Test with realistic generated data
npx ts-node src/ai/gemini/testRunner.ts generated
```

### **Nessie API Test**
```bash
# Test Nessie API integration
npx ts-node src/ai/gemini/testRunner.ts nessie
```

### **Comprehensive Test**
```bash
# Run all tests
npx ts-node src/ai/gemini/testRunner.ts comprehensive
```

## 📈 **Expected Test Results**

### **Successful Test Output**
```
🚀 Starting Comprehensive Test Suite
============================================================

🎯 Testing with Custom Dataset
========================================
📊 Analyzing 32 custom transactions...
📈 Analysis Results:
💰 Total Spent: $2,847.25
📅 Time Span: 16 days
📊 Average Daily: $177.95

📊 Category Analysis:
  Food: up (+15.2%) - Increasing dining frequency
  Transport: stable (0.0%) - Consistent transportation costs
  Shopping: up (+45.8%) - Higher shopping activity
  Entertainment: up (+22.1%) - More entertainment spending

⚠️  Anomalies Detected:
  2025-10-03 - Shopping: $500.00 (Unusually large single purchase)

💡 Recommendations:
  1. Monitor weekly shopping habits for consistency.
  2. Set threshold alerts for high one-day spends.
  3. Consider meal planning to reduce food spending.

✅ Custom Data Test: PASSED
✅ Generated Data Test: PASSED
✅ Nessie API Test: PASSED
✅ Local Test Suite: PASSED
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Please set your Gemini API key"**
   - Make sure you've set your API key in `analyzeSpending.ts`

2. **"No transactions found"**
   - Check your data format (date, category, amount)
   - Ensure dates are in YYYY-MM-DD format

3. **"Invalid transaction data"**
   - Verify all required fields are present
   - Check that amounts are positive numbers

4. **"API Error"**
   - Verify your Nessie API credentials
   - Check network connectivity

### **Debug Mode**

Enable debug logging:
```typescript
// Add to your test file
process.env.DEBUG = 'true';
```

## 🎯 **Next Steps**

1. **Start with Quick Test**: `npx ts-node src/ai/gemini/testRunner.ts quick`
2. **Test with Your Data**: Create your own transaction dataset
3. **Set up Nessie API**: Get credentials from [Nessie API Documentation](http://api.nessieisreal.com/documentation)
4. **Integrate into Your App**: Use the analysis results in your application

The testing suite is designed to be flexible and comprehensive, allowing you to test every aspect of the AI spending analysis module! 🎉
