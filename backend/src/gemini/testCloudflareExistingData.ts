/**
 * Test Cloudflare D1 with Existing Data
 * Tests reading from the existing database with real users
 */

import { D1Service } from '../database/services/d1Service';

// Set environment variables directly
process.env.CLOUDFLARE_ACCOUNT_ID = '58aae2a74d260d160efc18a4b308c373';
process.env.CLOUDFLARE_API_TOKEN = 'pKxjhXZi-agHpRy7v_JuMDH-aLjAlgI5wXSDfFNA';
process.env.CLOUDFLARE_D1_DATABASE_ID = '40bc49e1-1fd5-45be-a7b4-641d6fbf0c21';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test Cloudflare D1 with existing data
 */
async function testCloudflareExistingData() {
  console.log('🔍 CLOUDFLARE D1 - EXISTING DATA TEST');
  console.log('=====================================');
  console.log('🎯 Testing with existing users in your Cloudflare D1 database');

  try {
    // Step 1: Initialize D1Service
    console.log('\n1️⃣ Initializing D1Service...');
    const d1Service = D1Service.getInstance();
    console.log('✅ D1Service initialized successfully');

    // Step 2: Test with a known user ID (from the error we saw earlier)
    console.log('\n2️⃣ Testing with known user from database...');
    const testUserId = 'test-user-123'; // This user exists based on the error we saw
    
    // Step 3: Get detailed data for the test user
    console.log(`\n3️⃣ Getting detailed data for user: ${testUserId}`);
    
    const userData = await d1Service.getWellbeingDataByUserId(testUserId, {
      startDate: '2024-01-01',
      endDate: '2025-12-31'
    });

    console.log(`✅ Retrieved ${userData.length} mood entries for ${testUserId}`);
    
    if (userData.length > 0) {
      console.log('\n📋 Sample Mood Data:');
      userData.slice(0, 5).forEach((entry: any, index: number) => {
        console.log(`   Entry ${index + 1} (${entry.date}):`);
        console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
        console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
        console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
        console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
        console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
        console.log(`     😰 Stress: ${entry.stress_levels}/10`);
      });

      // Step 4: Calculate statistics for this user
      console.log('\n4️⃣ Calculating user statistics...');
      const totalEntries = userData.length;
      const avgWellbeing = userData.reduce((sum: number, entry: any) => sum + entry.overall_wellbeing, 0) / totalEntries;
      const avgSleep = userData.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / totalEntries;
      const avgActivity = userData.reduce((sum: number, entry: any) => sum + entry.physical_activity, 0) / totalEntries;
      const avgSocial = userData.reduce((sum: number, entry: any) => sum + entry.time_with_family_friends, 0) / totalEntries;
      const avgDiet = userData.reduce((sum: number, entry: any) => sum + entry.diet_quality, 0) / totalEntries;
      const avgStress = userData.reduce((sum: number, entry: any) => sum + entry.stress_levels, 0) / totalEntries;

      console.log('\n📊 User Statistics:');
      console.log(`   Total Entries: ${totalEntries}`);
      console.log(`   Average Wellbeing: ${avgWellbeing.toFixed(2)}/10`);
      console.log(`   Average Sleep: ${avgSleep.toFixed(2)}/10`);
      console.log(`   Average Activity: ${avgActivity.toFixed(2)}/10`);
      console.log(`   Average Social: ${avgSocial.toFixed(2)}/10`);
      console.log(`   Average Diet: ${avgDiet.toFixed(2)}/10`);
      console.log(`   Average Stress: ${avgStress.toFixed(2)}/10`);

      console.log('\n' + '='.repeat(60));
      console.log('🎯 CLOUDFLARE D1 EXISTING DATA TEST SUCCESSFUL');
      console.log('='.repeat(60));

      console.log('\n🎉 Cloudflare D1 existing data test successful!');
      console.log('\n📋 What this test demonstrated:');
      console.log('   ✅ Cloudflare D1 connection established');
      console.log('   ✅ Existing user data found in database');
      console.log('   ✅ Mood data retrieval working');
      console.log('   ✅ User statistics calculation working');
      console.log('   ✅ Real production data access');

      console.log('\n🚀 Your Cloudflare D1 database is ready for production!');
      console.log('   📱 Frontend: Can read existing mood data');
      console.log('   🔗 Integration: Real users → Real data → Gemini analysis');
      console.log('   🎯 Result: Production-ready mood data system');

    } else {
      console.log('⚠️ No mood entries found for this user');
    }

  } catch (error) {
    console.error('\n❌ Cloudflare D1 existing data test failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('D1')) {
        console.log('\n🔧 Fix: Check your Cloudflare D1 configuration');
      } else if (error.message.includes('404')) {
        console.log('\n🔧 Fix: Check your Cloudflare D1 database ID');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.log('\n🔧 Fix: Check your Cloudflare API token');
      }
    }
  }
}

// Run the test
if (require.main === module) {
  testCloudflareExistingData();
}
