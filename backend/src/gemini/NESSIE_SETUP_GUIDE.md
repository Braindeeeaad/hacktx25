# 🏦 Complete Nessie API Setup Guide

## 🎯 **Overview**

This guide will walk you through setting up Capital One's Nessie API integration with our AI spending analysis module.

## 📋 **Step 1: Get Nessie API Access**

### **1.1 Visit Nessie API Documentation**
- Go to: [http://api.nessieisreal.com/documentation](http://api.nessieisreal.com/documentation)
- Sign up for an account
- Request API access (may require approval)

### **1.2 Get Your API Credentials**
1. **API Key**: Get from your Nessie dashboard
2. **Base URL**: `http://api.nessieisreal.com` (for development)
3. **Customer ID**: You'll need to create customers first

## 🔧 **Step 2: Set Up Your Nessie Integration**

### **2.1 Update Your API Credentials**

Open `src/ai/gemini/nessieIntegration.ts` and update:

```typescript
// Replace these with your actual credentials
const nessie = new NessieAPIIntegration(
  'your-actual-nessie-api-key',     // Your API key from Nessie
  'your-actual-customer-id',        // Customer ID from Nessie
  'http://api.nessieisreal.com'     // Base URL
);
```

### **2.2 Test Your Connection**

```bash
# Test Nessie API connection
npx ts-node src/ai/gemini/testRunner.ts nessie
```

## 📊 **Step 3: Understanding Nessie API Data Structure**

### **3.1 Nessie API Endpoints**

```typescript
// Get all customers
GET /customers

// Get customer accounts
GET /customers/{customerId}/accounts

// Get account transactions
GET /accounts/{accountId}/transactions

// Get transactions with date range
GET /accounts/{accountId}/transactions?start_date=2025-09-01&end_date=2025-10-01
```

### **3.2 Nessie Transaction Format**

```json
{
  "transactions": [
    {
      "_id": "transaction_id",
      "date": "2025-09-29",
      "amount": -21.75,
      "description": "STARBUCKS #1234",
      "category": ["Food and Drink"],
      "account_id": "account_id"
    }
  ]
}
```

### **3.3 Our Module Automatically Transforms This To:**

```json
{
  "date": "2025-09-29",
  "category": "Food",
  "amount": 21.75
}
```

## 🚀 **Step 4: Testing Your Integration**

### **4.1 Test with Real Nessie Data**

```typescript
import { NessieAPIIntegration } from './src/ai/gemini';

const nessie = new NessieAPIIntegration(
  'your-api-key',
  'your-customer-id',
  'http://api.nessieisreal.com'
);

// Test fetching transactions
const transactions = await nessie.getAllTransactions('2025-09-01', '2025-10-01');
console.log('Fetched transactions:', transactions);

// Test full analysis
const analysis = await nessie.analyzeSpending('2025-09-01', '2025-10-01');
console.log('AI Analysis:', analysis);
```

### **4.2 Run the Nessie Test**

```bash
# Test Nessie API integration
npx ts-node src/ai/gemini/testRunner.ts nessie
```

## 🔍 **Step 5: Understanding What You Need to Do Outside**

### **5.1 Create Test Data in Nessie**

Since Nessie is a **sandbox API**, you need to create test data:

#### **A. Create a Customer**
```bash
curl -X POST http://api.nessieisreal.com/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "address": {
      "street_number": "123",
      "street_name": "Main St",
      "city": "Anytown",
      "state": "NY",
      "zip": "12345"
    }
  }'
```

#### **B. Create an Account**
```bash
curl -X POST http://api.nessieisreal.com/customers/{customerId}/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "Checking",
    "nickname": "My Checking Account",
    "rewards": 0,
    "balance": 1000
  }'
```

#### **C. Create Test Transactions**
```bash
curl -X POST http://api.nessieisreal.com/accounts/{accountId}/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "purchase",
    "amount": -25.50,
    "description": "STARBUCKS #1234",
    "date": "2025-09-29"
  }'
```

### **5.2 Alternative: Use Nessie's Sample Data**

Nessie provides sample customers and accounts for testing:

```typescript
// Common test customer IDs in Nessie
const testCustomerIds = [
  '59d8f8f8f8f8f8f8f8f8f8f8',  // Sample customer 1
  '59d8f8f8f8f8f8f8f8f8f8f9',  // Sample customer 2
  '59d8f8f8f8f8f8f8f8f8f8fa'   // Sample customer 3
];
```

## 🛠️ **Step 6: Complete Integration Example**

### **6.1 Create a Complete Test Script**

```typescript
// testNessieIntegration.ts
import { NessieAPIIntegration } from './src/ai/gemini';

async function testCompleteNessieIntegration() {
  console.log('🏦 Testing Complete Nessie Integration');
  
  // Initialize with your credentials
  const nessie = new NessieAPIIntegration(
    'your-api-key',
    'your-customer-id',
    'http://api.nessieisreal.com'
  );
  
  try {
    // 1. Test connection
    console.log('1. Testing connection...');
    const accounts = await nessie.getAccounts();
    console.log(`✅ Found ${accounts.length} accounts`);
    
    // 2. Fetch transactions
    console.log('2. Fetching transactions...');
    const transactions = await nessie.getAllTransactions('2025-09-01', '2025-10-01');
    console.log(`✅ Found ${transactions.length} transactions`);
    
    // 3. Run AI analysis
    console.log('3. Running AI analysis...');
    const analysis = await nessie.analyzeSpending('2025-09-01', '2025-10-01');
    
    // 4. Display results
    console.log('4. Analysis Results:');
    console.log(`💰 Total Spent: $${analysis.summary.totalSpent.toFixed(2)}`);
    console.log(`📊 Categories: ${analysis.categories.length}`);
    console.log(`⚠️  Anomalies: ${analysis.anomalies.length}`);
    console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Integration failed:', error);
    return null;
  }
}

testCompleteNessieIntegration();
```

### **6.2 Run the Complete Test**

```bash
npx ts-node testNessieIntegration.ts
```

## 🔧 **Step 7: Troubleshooting Common Issues**

### **7.1 API Key Issues**
```bash
# Test your API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://api.nessieisreal.com/customers
```

### **7.2 Customer ID Issues**
```bash
# List all customers
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://api.nessieisreal.com/customers
```

### **7.3 Transaction Issues**
```bash
# List transactions for an account
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "http://api.nessieisreal.com/accounts/{accountId}/transactions"
```

## 📚 **Step 8: Understanding Nessie API Limits**

### **8.1 Rate Limits**
- **Requests per minute**: 100
- **Requests per day**: 1000
- **Data retention**: 30 days

### **8.2 Data Limits**
- **Max transactions per request**: 500
- **Date range**: 30 days maximum
- **Account types**: Checking, Savings, Credit Card

## 🎯 **Step 9: Production Considerations**

### **9.1 Environment Variables**
```bash
# Set environment variables
export NESSIE_API_KEY="your-api-key"
export NESSIE_CUSTOMER_ID="your-customer-id"
export NESSIE_BASE_URL="http://api.nessieisreal.com"
```

### **9.2 Error Handling**
```typescript
try {
  const analysis = await nessie.analyzeSpending(startDate, endDate);
  return analysis;
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('404')) {
    console.error('Customer not found');
  } else {
    console.error('API error:', error);
  }
}
```

## 🚀 **Step 10: Next Steps**

1. **Get your Nessie API credentials**
2. **Create test customers and accounts**
3. **Add sample transactions**
4. **Test the integration**
5. **Run AI analysis on real data**
6. **Integrate into your application**

## 📞 **Need Help?**

- **Nessie API Documentation**: [http://api.nessieisreal.com/documentation](http://api.nessieisreal.com/documentation)
- **Capital One Developer Support**: Check the documentation for support channels
- **Our Module Documentation**: See `README.md` and other guide files

The integration is designed to be **plug-and-play** once you have your Nessie API credentials! 🎉

