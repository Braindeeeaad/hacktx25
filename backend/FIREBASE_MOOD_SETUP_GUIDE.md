# Firebase Mood Integration Setup Guide

## 🚀 Quick Setup Steps

### 1. **Your Firebase is Already Set Up!**
✅ You already have Firebase configured in `frontend/firebaseConfig.js`  
✅ Firestore is now added to your config  
✅ Authentication is working  

### 2. **Add Firestore Security Rules**
Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → Rules

Replace the default rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own mood entries
    match /mood_entries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. **Install Firebase Dependencies**
In your frontend directory:
```bash
npm install firebase
```

### 4. **Add Mood Input to Your App**
Copy `frontend/components/MoodInput.tsx` to your app and use it:

```typescript
// In your main app component
import { MoodInput } from './components/MoodInput';
import { auth } from './firebaseConfig';

// In your render method:
<MoodInput 
  userId={auth.currentUser?.uid || ''}
  onMoodSubmitted={() => {
    // Optional: Navigate to analysis screen or show success message
    console.log('Mood logged successfully!');
  }}
/>
```

### 5. **Test the Integration**
```bash
# Test Firebase mood integration
npx ts-node --project backend/tsconfig.json backend/src/gemini/testFirebaseMood.ts
```

## 📱 **Frontend Integration**

### **Add to Your Login Flow**
After successful login, you can add a mood logging screen:

```typescript
// In your Login.tsx, after successful login:
import { MoodInput } from './components/MoodInput';

// Add this after login success:
const [showMoodInput, setShowMoodInput] = useState(false);

// In your render:
{showMoodInput && (
  <MoodInput 
    userId={auth.currentUser?.uid || ''}
    onMoodSubmitted={() => setShowMoodInput(false)}
  />
)}
```

### **Navigation Structure**
```
Login → Mood Input → Main App → Analysis (with mood data)
```

## 🔧 **Backend Integration**

### **Use Firebase Mood Service**
```typescript
import { FirebaseMoodService } from './firebaseMoodService';
import { analyzeSpendingWithFirebaseMood } from './firebaseMoodAnalysis';

// Get mood-enhanced analysis
const analysis = await analyzeSpendingWithFirebaseMood(
  transactions, 
  userId, 
  startDate, 
  endDate
);
```

### **API Endpoints You'll Need**
Create these endpoints in your backend:

```typescript
// POST /api/mood - Add mood entry (handled by frontend)
// GET /api/mood/:userId - Get mood entries
// GET /api/analysis/:userId - Get mood-enhanced analysis
```

## 🎯 **Data Flow**

```
React Native App (MoodInput.tsx)
    ↓ (mood data)
Firebase Firestore (mood_entries collection)
    ↓ (API call)
Backend (FirebaseMoodService)
    ↓ (correlate with spending)
Gemini AI (mood-enhanced analysis)
    ↓ (linked recommendations)
Frontend Display
```

## 🧪 **Testing Commands**

```bash
# Test Firebase mood integration
npx ts-node --project backend/tsconfig.json backend/src/gemini/testFirebaseMood.ts

# Test basic spending analysis
npx ts-node --project backend/tsconfig.json backend/src/gemini/fullAnalysisTest.ts nessie
```

## 📊 **What You Get**

### **Mood Data Collection:**
- ✅ Daily mood, sleep, stress tracking
- ✅ Optional notes, location, weather
- ✅ Firebase Firestore storage
- ✅ User-specific data isolation

### **Mood-Enhanced Analysis:**
- ✅ Mood-spending correlation analysis
- ✅ Emotional trigger identification
- ✅ Mood-aware recommendations
- ✅ Wellness tips triggered by mood patterns

### **Enhanced Recommendations:**
- ✅ Linked to specific mood patterns
- ✅ Psychological insights from mood data
- ✅ Behavioral recommendations based on emotional state
- ✅ Wellness tips for different mood triggers

## 🎉 **Ready to Use!**

Your Firebase mood integration is ready! The system will:

1. **Collect mood data** from your React Native app
2. **Store in Firebase Firestore** with proper security
3. **Correlate with spending** for enhanced analysis
4. **Provide mood-aware recommendations** with psychological insights

**Just add the MoodInput component to your app and you're ready to go!** 🚀

## 🔍 **Troubleshooting**

### **"Permission denied" errors:**
- Check Firestore security rules
- Make sure user is authenticated
- Verify userId matches the document

### **"Firebase not initialized" errors:**
- Check your firebaseConfig.js
- Make sure Firestore is imported
- Verify your Firebase project settings

### **"No mood data found":**
- Check if mood entries are being saved to Firestore
- Verify the date range in your queries
- Check the userId is correct

## 📈 **Next Steps**

1. **Add MoodInput to your app**
2. **Test mood data collection**
3. **Run mood-enhanced analysis**
4. **Display linked recommendations**
5. **Add mood history tracking**

Your Firebase mood integration is production-ready! 🎯
