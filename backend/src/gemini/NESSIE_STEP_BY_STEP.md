# 🏦 Nessie API Integration - Step by Step Guide

## 🎯 **Complete Walkthrough**

This guide will walk you through setting up Capital One's Nessie API integration with our AI spending analysis module.

## 📋 **Step 1: Get Nessie API Access**

### **1.1 Visit Nessie API Documentation**
- Go to: [http://api.nessieisreal.com/documentation](http://api.nessieisreal.com/documentation)
- Click "Sign in with GitHub" or create an account
- Request API access (this may require approval)

### **1.2 Get Your API Credentials**
1. **API Key**: Found in your Nessie dashboard
2. **Base URL**: `http://api.nessieisreal.com` (for development)
3. **Customer ID**: You'll need to create this first

## 🔧 **Step 2: Set Up Your Credentials**

### **2.1 Update Configuration File**
Open `src/ai/gemini/nessieConfig.ts` and replace:

```typescript
export const NESSIE_CONFIG = {
  API_KEY: 'your-nessie-api-key-here',        // Replace with your actual API key
  CUSTOMER_ID: 'your-customer-id-here',       // Replace with your customer ID
  BASE_URL: 'http://api.nessieisreal.com',
  DEFAULT_DAYS: 30
};
```

### **2.2 Test Your Configuration**
```bash
# Test your configuration
npx ts-node src/ai/gemini/nessieSetupTest.ts connection
```

## 📊 **Step 3: Create Test Data in Nessie**

### **3.1 Create a Customer**
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

**Response will include a customer ID like:**
```json
{
  "objectCreated": {
    "_id": "59d8f8f8f8f8f8f8f8f8f8f8",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### **3.2 Create an Account**
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

**Response will include an account ID like:**
```json
{
  "objectCreated": {
    "_id": "59d8f8f8f8f8f8f8f8f8f8f9",
    "type": "Checking",
    "nickname": "My Checking Account"
  }
}
```

### **3.3 Create Test Transactions**
```bash
# Transaction 1
curl -X POST http://api.nessieisreal.com/accounts/{accountId}/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "purchase",
    "amount": -25.50,
    "description": "STARBUCKS #1234",
    "date": "2025-09-29"
  }'

# Transaction 2
curl -X POST http://api.nessieisreal.com/accounts/{accountId}/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "purchase",
    "amount": -10.00,
    "description": "UBER RIDE",
    "date": "2025-09-29"
  }'

# Transaction 3
curl -X POST http://api.nessieisreal.com/accounts/{accountId}/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "type": "purchase",
    "amount": -35.50,
    "description": "GROCERY STORE",
    "date": "2025-09-30"
  }'
```

## 🧪 **Step 4: Test Your Integration**

### **4.1 Test Connection**
```bash
# Test if your API credentials work
npx ts-node src/ai/gemini/nessieSetupTest.ts connection
```

**Expected output:**
```
🏦 Testing Nessie API Connection
==================================================
1. Testing API connection...
✅ Connection successful! Found 1 accounts
📊 Account details:
   1. My Checking Account (Checking)
      Balance: $1000
      ID: 59d8f8f8f8f8f8f8f8f8f8f9
```

### **4.2 Test Transaction Fetching**
```bash
# Test fetching transactions
npx ts-node src/ai/gemini/nessieSetupTest.ts transactions
```

**Expected output:**
```
📊 Testing Transaction Fetching
==================================================
1. Fetching transactions for last 30 days...
✅ Found 3 transactions

📈 Sample transactions:
   1. 2025-09-29 - Food: $25.5
   2. 2025-09-29 - Transport: $10
   3. 2025-09-30 - Food: $35.5
```

### **4.3 Test AI Analysis**
```bash
# Test full AI analysis
npx ts-node src/ai/gemini/nessieSetupTest.ts analysis
```

**Expected output:**
```
🤖 Testing AI Analysis with Nessie Data
==================================================
1. Running AI analysis on Nessie data...
✅ AI Analysis completed successfully!

📊 Analysis Results:
💰 Total Spent: $71.00
📅 Time Span: 2 days
📈 Average Daily: $35.50
📊 Categories: 2
⚠️  Anomalies: 0
💡 Recommendations: 4

📈 Category Trends:
   Food: up (+100.0%)
   Transport: stable (0.0%)

💡 AI Recommendations:
   1. Monitor food spending trends
   2. Consider meal planning
   3. Track transportation costs
   4. Set budget goals
```

## 🚀 **Step 5: Run Complete Test**

### **5.1 Run All Tests**
```bash
# Run complete integration test
npx ts-node src/ai/gemini/nessieSetupTest.ts all
```

### **5.2 Test with Different Date Ranges**
```typescript
import { NessieAPIIntegration } from './src/ai/gemini';

const nessie = new NessieAPIIntegration(
  'your-api-key',
  'your-customer-id',
  'http://api.nessieisreal.com'
);

// Analyze last 7 days
const weeklyAnalysis = await nessie.analyzeRecentDays(7);

// Analyze specific date range
const monthlyAnalysis = await nessie.analyzeSpending('2025-09-01', '2025-09-30');
```

## 🔧 **Step 6: Integration into Your App**

### **6.1 Basic Integration**
```typescript
import { NessieAPIIntegration } from './src/ai/gemini';

export async function analyzeUserSpending(customerId: string) {
  const nessie = new NessieAPIIntegration(
    process.env.NESSIE_API_KEY,
    customerId,
    'http://api.nessieisreal.com'
  );
  
  const analysis = await nessie.analyzeRecentDays(30);
  return analysis;
}
```

### **6.2 Error Handling**
```typescript
try {
  const analysis = await nessie.analyzeSpending('2025-09-01', '2025-09-30');
  return analysis;
} catch (error) {
  if (error.message.includes('401')) {
    throw new Error('Invalid Nessie API key');
  } else if (error.message.includes('404')) {
    throw new Error('Customer not found');
  } else {
    throw new Error(`Nessie API error: ${error.message}`);
  }
}
```

## 🎯 **Step 7: What You Need to Do Outside**

### **7.1 Get Nessie API Access**
1. **Visit**: [http://api.nessieisreal.com/documentation](http://api.nessieisreal.com/documentation)
2. **Sign up** for an account
3. **Request API access** (may require approval)
4. **Get your API key** from the dashboard

### **7.2 Create Test Data**
1. **Create customers** using the API
2. **Create accounts** for each customer
3. **Add transactions** to test the analysis
4. **Use sample data** if available

### **7.3 Understand Nessie API**
- **Rate limits**: 100 requests/minute, 1000/day
- **Data retention**: 30 days
- **Account types**: Checking, Savings, Credit Card
- **Transaction types**: Purchase, Transfer, Deposit

## 🔍 **Step 8: Troubleshooting**

### **8.1 Common Issues**

**"Invalid API key"**
- Check your API key is correct
- Ensure you have API access
- Verify the key is active

**"Customer not found"**
- Create a customer first
- Use the correct customer ID
- Check the customer exists

**"No transactions found"**
- Add test transactions
- Check the date range
- Verify the account has transactions

### **8.2 Debug Commands**
```bash
# Test API key
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://api.nessieisreal.com/customers

# List customers
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://api.nessieisreal.com/customers

# List transactions
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "http://api.nessieisreal.com/accounts/{accountId}/transactions"
```

## 🎉 **Step 9: Success!**

Once everything is working, you'll have:

✅ **Nessie API integration** with real financial data  
✅ **AI analysis** of spending patterns  
✅ **Anomaly detection** in transactions  
✅ **Intelligent recommendations** from Gemini AI  
✅ **Complete spending insights** for your users  

## 📚 **Next Steps**

1. **Test with more data**: Add more transactions to see richer analysis
2. **Integrate into your app**: Use the analysis results in your UI
3. **Customize the AI prompt**: Modify the analysis for your specific needs
4. **Add more features**: Extend the module with additional capabilities

The integration is designed to be **plug-and-play** once you have your Nessie API credentials! 🚀

