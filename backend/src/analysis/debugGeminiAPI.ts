/**
 * Debug Gemini API Issues
 * This will help identify exactly what's causing the 400 Bad Request errors
 */

import { ImpactAnalyzer } from './index';

// Console declarations for Node.js environment
declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test Gemini API with different configurations
 */
async function debugGeminiAPI() {
  console.log('🔍 DEBUGGING GEMINI API ISSUES');
  console.log('='.repeat(50));
  
  // Test 1: Check environment variables
  console.log('\n1. Environment Variables:');
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
  
  // Test 2: Test with invalid API key
  console.log('\n2. Testing with invalid API key (demo-key):');
  const analyzerInvalid = new ImpactAnalyzer('demo-key');
  
  try {
    await analyzerInvalid.generateQuickInsight([], []);
  } catch (error) {
    console.log(`   ✅ Expected error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Test 3: Test with empty API key
  console.log('\n3. Testing with empty API key:');
  const analyzerEmpty = new ImpactAnalyzer('');
  
  try {
    await analyzerEmpty.generateQuickInsight([], []);
  } catch (error) {
    console.log(`   ✅ Expected error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Test 4: Test with undefined API key
  console.log('\n4. Testing with undefined API key:');
  const analyzerUndefined = new ImpactAnalyzer(undefined as any);
  
  try {
    await analyzerUndefined.generateQuickInsight([], []);
  } catch (error) {
    console.log(`   ✅ Expected error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Test 5: Test API URL format
  console.log('\n5. Testing API URL format:');
  const testUrls = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  ];
  
  testUrls.forEach((url, index) => {
    console.log(`   URL ${index + 1}: ${url}`);
  });
  
  // Test 6: Test request format
  console.log('\n6. Testing request format:');
  const sampleRequest = {
    contents: [{
      parts: [{
        text: "Hello, this is a test prompt."
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };
  
  console.log('   Sample request structure:');
  console.log(JSON.stringify(sampleRequest, null, 2));
  
  // Test 7: Manual API call test (if API key is available)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key') {
    console.log('\n7. Testing with real API key:');
    const analyzerReal = new ImpactAnalyzer(process.env.GEMINI_API_KEY);
    
    try {
      const result = await analyzerReal.generateQuickInsight([], []);
      console.log('   ✅ API call successful!');
      console.log(`   Result: ${result.insight}`);
    } catch (error) {
      console.log(`   ❌ API call failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Try to parse the error for more details
      if (error instanceof Error && error.message.includes('400')) {
        console.log('\n   🔍 400 Bad Request Analysis:');
        console.log('   Common causes:');
        console.log('   • Invalid API key format');
        console.log('   • Incorrect model name');
        console.log('   • Malformed request body');
        console.log('   • Missing required parameters');
        console.log('   • API quota exceeded');
        console.log('   • Invalid safety settings');
      }
    }
  } else {
    console.log('\n7. Skipping real API test (no valid API key)');
  }
  
  console.log('\n\n💡 SOLUTIONS:');
  console.log('='.repeat(50));
  console.log('1. Set a valid Gemini API key:');
  console.log('   export GEMINI_API_KEY="your-actual-api-key-here"');
  console.log('');
  console.log('2. Get a Gemini API key from:');
  console.log('   https://makersuite.google.com/app/apikey');
  console.log('');
  console.log('3. Verify the API key works:');
  console.log('   curl -H "Content-Type: application/json" \\');
  console.log('     -d \'{"contents":[{"parts":[{"text":"Hello"}]}]}\' \\');
  console.log('     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"');
  console.log('');
  console.log('4. Check API quotas and billing:');
  console.log('   https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com');
}

// Run debug if this file is executed directly
declare const require: { main: any; };
declare const module: { exports: any; };

if (require.main === module) {
  debugGeminiAPI().catch(console.error);
}

export { debugGeminiAPI };

