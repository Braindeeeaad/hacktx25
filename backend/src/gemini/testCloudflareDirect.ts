/**
 * Direct Cloudflare D1 Test
 * Tests Cloudflare D1 connection directly without importing problematic files
 */

import { D1Service } from '../database/services/d1Service';

// Set environment variables directly (same as working tests)
process.env.CLOUDFLARE_ACCOUNT_ID = '58aae2a74d260d160efc18a4b308c373';
process.env.CLOUDFLARE_API_TOKEN = 'pKxjhXZi-agHpRy7v_JuMDH-aLjAlgI5wXSDfFNA';
process.env.CLOUDFLARE_D1_DATABASE_ID = '40bc49e1-1fd5-45be-a7b4-641d6fbf0c21';

// Verify environment variables are loaded
console.log('Environment variables:');
console.log('CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID);
console.log('CLOUDFLARE_API_TOKEN:', process.env.CLOUDFLARE_API_TOKEN ? 'SET' : 'NOT SET');
console.log('CLOUDFLARE_D1_DATABASE_ID:', process.env.CLOUDFLARE_D1_DATABASE_ID);

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test Cloudflare D1 connection directly
 */
async function testCloudflareDirect() {
  console.log('🚀 DIRECT CLOUDFLARE D1 TEST');
  console.log('============================');
  console.log('🎯 Testing Cloudflare D1 connection with real credentials');

  try {
    // Step 1: Initialize D1Service
    console.log('\n1️⃣ Initializing D1Service...');
    const d1Service = D1Service.getInstance();
    console.log('✅ D1Service initialized successfully');

    // Step 2: Test adding a mood entry
    console.log('\n2️⃣ Testing mood entry creation...');
    const testMoodData = {
      userId: 'test-user-123',
      date: new Date().toISOString().split('T')[0],
      overall_wellbeing: 7,
      sleep_quality: 8,
      physical_activity: 6,
      time_with_family_friends: 9,
      diet_quality: 7,
      stress_levels: 3
    };

    const result = await d1Service.createWellbeingData(testMoodData);
    console.log('✅ Mood entry created successfully');
    console.log(`📊 Entry ID: ${result.id}`);
    console.log(`📅 Date: ${result.date}`);
    console.log(`😊 Wellbeing: ${result.overall_wellbeing}/10`);

    // Step 3: Test retrieving mood data
    console.log('\n3️⃣ Testing mood data retrieval...');
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const moodEntries = await d1Service.getWellbeingDataByDateRange(
      'test-user-123',
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    console.log(`✅ Retrieved ${moodEntries.length} mood entries`);
    
    if (moodEntries.length > 0) {
      console.log('\n📋 Sample Mood Data:');
      moodEntries.slice(0, 3).forEach((entry, index) => {
        console.log(`   Entry ${index + 1} (${entry.date}):`);
        console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
        console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
        console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
        console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
        console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
        console.log(`     😰 Stress: ${entry.stress_levels}/10`);
      });
    }

    // Step 4: Test updating mood data
    console.log('\n4️⃣ Testing mood data update...');
    const updateResult = await d1Service.updateWellbeingData(result.id!, {
      overall_wellbeing: 8,
      sleep_quality: 9
    });

    if (updateResult) {
      console.log('✅ Mood entry updated successfully');
      console.log(`📊 Updated Wellbeing: ${updateResult.overall_wellbeing}/10`);
      console.log(`📊 Updated Sleep: ${updateResult.sleep_quality}/10`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 CLOUDFLARE D1 TEST SUCCESSFUL');
    console.log('='.repeat(60));

    console.log('\n🎉 Cloudflare D1 integration test successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Cloudflare D1 connection established');
    console.log('   ✅ Mood data creation working');
    console.log('   ✅ Mood data retrieval working');
    console.log('   ✅ Mood data update working');
    console.log('   ✅ Real Cloudflare D1 database integration');

    console.log('\n🚀 Your Cloudflare D1 integration is ready!');
    console.log('   📱 Frontend: Can now save mood data to Cloudflare D1');
    console.log('   🔗 Integration: Firebase UID → Cloudflare D1 → Gemini');
    console.log('   🎯 Result: Real mood data storage and retrieval');

  } catch (error) {
    console.error('\n❌ Cloudflare D1 test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('D1')) {
        console.log('\n🔧 Fix: Check your Cloudflare D1 configuration');
        console.log('   - CLOUDFLARE_ACCOUNT_ID');
        console.log('   - CLOUDFLARE_API_TOKEN');
        console.log('   - CLOUDFLARE_D1_DATABASE_ID');
      } else if (error.message.includes('404')) {
        console.log('\n🔧 Fix: Check your Cloudflare D1 database ID');
        console.log('   - Make sure the database exists in your Cloudflare account');
        console.log('   - Verify the database ID is correct');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.log('\n🔧 Fix: Check your Cloudflare API token');
        console.log('   - Make sure the API token has D1 permissions');
        console.log('   - Verify the API token is valid');
      } else {
        console.log('\n🔧 Fix: Check the error details above');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testCloudflareDirect();
}
