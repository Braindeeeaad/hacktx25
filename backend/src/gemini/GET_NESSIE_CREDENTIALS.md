# 🔑 How to Get Your Nessie API Credentials

## 🎯 **Why You're Getting 401 Unauthorized**

The error occurs because you haven't set up your Nessie API credentials yet. The test is using placeholder values like `'your-nessie-api-key'` instead of real credentials.

## 📋 **Step-by-Step Guide to Get Credentials**

### **Step 1: Visit Nessie API Documentation**
1. Go to: [http://api.nessieisreal.com/documentation](http://api.nessieisreal.com/documentation)
2. Click "Sign in with GitHub" or create an account
3. Request API access (this may require approval)

### **Step 2: Get Your API Key**
1. Once approved, log into your Nessie dashboard
2. Find your API key (it will look like: `AIzaSyC...` or similar)
3. Copy the API key

### **Step 3: Create a Customer**
You need to create a customer first. Use this command:

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

### **Step 4: Create an Account**
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

### **Step 5: Add Test Transactions**
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

## 🔧 **Step 6: Update Your Test File**

Once you have your credentials, update `src/ai/gemini/nessieTestWithCredentials.ts`:

```typescript
const API_KEY = 'your-actual-api-key-here';        // Replace with your real API key
const CUSTOMER_ID = 'your-actual-customer-id-here'; // Replace with your customer ID
```

## 🧪 **Step 7: Test Your Integration**

```bash
# Test with your real credentials
npx ts-node src/ai/gemini/nessieTestWithCredentials.ts
```

## 🔍 **Alternative: Use Sample Data**

If you can't get API access immediately, you can test with sample data:

```bash
# Test with generated data instead
npx ts-node src/ai/gemini/testRunner.ts custom
```

## 🚨 **Common Issues**

### **"401 Unauthorized"**
- Your API key is incorrect or expired
- You don't have API access yet
- The API key format is wrong

### **"404 Not Found"**
- Your customer ID is incorrect
- The customer doesn't exist
- You need to create a customer first

### **"403 Forbidden"**
- You don't have permission to access the customer
- Your API key doesn't have the right permissions

## 💡 **Quick Test Without Real API**

If you want to test the AI analysis without the Nessie API:

```bash
# Test with custom data
npx ts-node src/ai/gemini/testRunner.ts custom

# Test with generated data
npx ts-node src/ai/gemini/testRunner.ts generated

# See full analysis output
npx ts-node src/ai/gemini/fullAnalysisTest.ts custom
```

## 🎯 **Next Steps**

1. **Get your Nessie API credentials** (follow steps above)
2. **Update the test file** with your real credentials
3. **Run the test** to verify everything works
4. **Add more test data** to see richer analysis
5. **Integrate into your app** using the analysis results

The 401 error is expected until you get your real API credentials! 🚀
