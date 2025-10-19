/**
 * Test Multi-Day Mood Analysis
 * Demonstrates how multiple days of wellness data provides nuanced insights
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
 * Generate multiple days of realistic mood data for testing
 */
function generateMultipleDaysMoodData(userId: string, numDays: number): any[] {
  const moodEntries: any[] = [];
  const today = new Date();
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const dayOfWeek = date.getDay();
    
    // Base values with realistic patterns
    let overall_wellbeing = 5 + Math.random() * 4; // 5-9 range
    let sleep_quality = 4 + Math.random() * 5;      // 4-9 range
    let physical_activity = 3 + Math.random() * 5; // 3-8 range
    let time_with_family_friends = 4 + Math.random() * 5; // 4-9 range
    let diet_quality = 4 + Math.random() * 5;     // 4-9 range
    let stress_levels = 2 + Math.random() * 6;    // 2-8 range
    
    // Weekend effects
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      overall_wellbeing += 1 + Math.random() * 2;
      time_with_family_friends += 1 + Math.random() * 2;
      stress_levels -= 1 + Math.random() * 2;
    } else if (dayOfWeek === 1) { // Monday blues
      overall_wellbeing -= 1 + Math.random() * 2;
      stress_levels += 1 + Math.random() * 2;
    }
    
    // Ensure values are within 0-10
    overall_wellbeing = Math.max(0, Math.min(10, Math.round(overall_wellbeing)));
    sleep_quality = Math.max(0, Math.min(10, Math.round(sleep_quality)));
    physical_activity = Math.max(0, Math.min(10, Math.round(physical_activity)));
    time_with_family_friends = Math.max(0, Math.min(10, Math.round(time_with_family_friends)));
    diet_quality = Math.max(0, Math.min(10, Math.round(diet_quality)));
    stress_levels = Math.max(0, Math.min(10, Math.round(stress_levels)));
    
    moodEntries.push({
      userId,
      date: dateString,
      overall_wellbeing,
      sleep_quality,
      physical_activity,
      time_with_family_friends,
      diet_quality,
      stress_levels
    });
  }
  
  return moodEntries.reverse(); // Oldest first
}

/**
 * Calculate comprehensive mood statistics from multiple days
 */
function calculateMoodStatistics(moodData: any[]): any {
  const totalEntries = moodData.length;
  
  // Calculate averages
  const averages = {
    overall_wellbeing: moodData.reduce((sum, entry) => sum + entry.overall_wellbeing, 0) / totalEntries,
    sleep_quality: moodData.reduce((sum, entry) => sum + entry.sleep_quality, 0) / totalEntries,
    physical_activity: moodData.reduce((sum, entry) => sum + entry.physical_activity, 0) / totalEntries,
    time_with_family_friends: moodData.reduce((sum, entry) => sum + entry.time_with_family_friends, 0) / totalEntries,
    diet_quality: moodData.reduce((sum, entry) => sum + entry.diet_quality, 0) / totalEntries,
    stress_levels: moodData.reduce((sum, entry) => sum + entry.stress_levels, 0) / totalEntries
  };

  // Calculate ranges (min/max)
  const ranges = {
    overall_wellbeing: {
      min: Math.min(...moodData.map(entry => entry.overall_wellbeing)),
      max: Math.max(...moodData.map(entry => entry.overall_wellbeing))
    },
    sleep_quality: {
      min: Math.min(...moodData.map(entry => entry.sleep_quality)),
      max: Math.max(...moodData.map(entry => entry.sleep_quality))
    },
    stress_levels: {
      min: Math.min(...moodData.map(entry => entry.stress_levels)),
      max: Math.max(...moodData.map(entry => entry.stress_levels))
    }
  };

  // Calculate consistency (standard deviation)
  const consistency = {
    overall_wellbeing: calculateStandardDeviation(moodData.map(entry => entry.overall_wellbeing)),
    sleep_quality: calculateStandardDeviation(moodData.map(entry => entry.sleep_quality)),
    stress_levels: calculateStandardDeviation(moodData.map(entry => entry.stress_levels))
  };

  return {
    totalEntries,
    averages,
    ranges,
    consistency,
    dateRange: {
      start: moodData[0]?.date,
      end: moodData[moodData.length - 1]?.date
    }
  };
}

/**
 * Identify trends in mood data over time
 */
function identifyTrends(moodData: any[]): any {
  // Sort by date
  const sortedMoodData = [...moodData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate weekly averages
  const weeklyAverages = calculateWeeklyAverages(sortedMoodData);
  
  // Identify improving/declining trends
  const trends = {
    overall_wellbeing: calculateTrend(sortedMoodData.map(entry => entry.overall_wellbeing)),
    sleep_quality: calculateTrend(sortedMoodData.map(entry => entry.sleep_quality)),
    stress_levels: calculateTrend(sortedMoodData.map(entry => entry.stress_levels)),
    physical_activity: calculateTrend(sortedMoodData.map(entry => entry.physical_activity))
  };

  // Find best and worst days
  const bestDay = sortedMoodData.reduce((best, current) => 
    current.overall_wellbeing > best.overall_wellbeing ? current : best
  );
  const worstDay = sortedMoodData.reduce((worst, current) => 
    current.overall_wellbeing < worst.overall_wellbeing ? current : worst
  );

  return {
    weeklyAverages,
    trends,
    bestDay: {
      date: bestDay.date,
      wellbeing: bestDay.overall_wellbeing,
      sleep: bestDay.sleep_quality,
      stress: bestDay.stress_levels
    },
    worstDay: {
      date: worstDay.date,
      wellbeing: worstDay.overall_wellbeing,
      sleep: worstDay.sleep_quality,
      stress: worstDay.stress_levels
    }
  };
}

// Helper functions
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'insufficient_data';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

function calculateWeeklyAverages(moodData: any[]): any {
  const weeklyData: Record<string, any> = {};
  
  moodData.forEach(entry => {
    const date = new Date(entry.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = { entries: [], averages: {} };
    }
    weeklyData[weekKey].entries.push(entry);
  });
  
  Object.keys(weeklyData).forEach(week => {
    const entries = weeklyData[week].entries;
    weeklyData[week].averages = {
      wellbeing: entries.reduce((sum: number, e: any) => sum + e.overall_wellbeing, 0) / entries.length,
      sleep: entries.reduce((sum: number, e: any) => sum + e.sleep_quality, 0) / entries.length,
      stress: entries.reduce((sum: number, e: any) => sum + e.stress_levels, 0) / entries.length
    };
  });
  
  return weeklyData;
}

/**
 * Test multi-day mood analysis
 */
async function testMultiDayMoodAnalysis() {
  console.log('🎯 MULTI-DAY MOOD ANALYSIS TEST');
  console.log('==============================');
  console.log('🎯 Testing comprehensive analysis with multiple days of wellness data');

  try {
    // Step 1: Generate multiple days of mood data
    console.log('\n1️⃣ Generating multiple days of mood data...');
    const testUserId = 'multi-day-test-user';
    const numDays = 14; // 2 weeks of data
    const moodEntries = generateMultipleDaysMoodData(testUserId, numDays);
    
    console.log(`📊 Generated ${moodEntries.length} mood entries over ${numDays} days`);
    
    // Display sample data
    console.log('\n📋 Sample Mood Data:');
    moodEntries.slice(0, 5).forEach((entry, index) => {
      console.log(`   Day ${index + 1} (${entry.date}):`);
      console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
      console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
      console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
      console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
      console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
      console.log(`     😰 Stress: ${entry.stress_levels}/10`);
    });

    // Step 2: Save mood data to Cloudflare D1
    console.log('\n2️⃣ Saving mood data to Cloudflare D1...');
    const d1Service = D1Service.getInstance();
    
    for (const entry of moodEntries) {
      try {
        await d1Service.createWellbeingData(entry);
        console.log(`✅ Saved mood entry for ${entry.date}`);
      } catch (error) {
        console.log(`⚠️ Entry for ${entry.date} might already exist, continuing...`);
      }
    }

    // Step 3: Retrieve and analyze the data
    console.log('\n3️⃣ Retrieving and analyzing mood data...');
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date();
    startDate.setDate(new Date().getDate() - numDays);
    const startDateString = startDate.toISOString().split('T')[0];
    
    const retrievedMoodData = await d1Service.getWellbeingDataByDateRange(
      testUserId,
      startDateString,
      endDate
    );

    console.log(`📊 Retrieved ${retrievedMoodData.length} mood entries from database`);

    // Step 4: Calculate comprehensive statistics
    console.log('\n4️⃣ Calculating comprehensive mood statistics...');
    const moodStats = calculateMoodStatistics(retrievedMoodData);
    const trends = identifyTrends(retrievedMoodData);

    // Step 5: Display results
    console.log('\n' + '='.repeat(80));
    console.log('🎯 MULTI-DAY MOOD ANALYSIS RESULTS');
    console.log('='.repeat(80));

    console.log('\n📊 DATA SUMMARY:');
    console.log('-'.repeat(50));
    console.log(`📅 Date Range: ${startDateString} to ${endDate}`);
    console.log(`🧘 Mood Entries: ${retrievedMoodData.length}`);
    console.log(`📈 Data Period: ${moodStats.dateRange.start} to ${moodStats.dateRange.end}`);

    console.log('\n📈 AVERAGE WELLNESS SCORES:');
    console.log('-'.repeat(50));
    console.log(`😊 Overall Wellbeing: ${moodStats.averages.overall_wellbeing.toFixed(2)}/10`);
    console.log(`😴 Sleep Quality: ${moodStats.averages.sleep_quality.toFixed(2)}/10`);
    console.log(`🏃 Physical Activity: ${moodStats.averages.physical_activity.toFixed(2)}/10`);
    console.log(`👨‍👩‍👧‍👦 Social Time: ${moodStats.averages.time_with_family_friends.toFixed(2)}/10`);
    console.log(`🥗 Diet Quality: ${moodStats.averages.diet_quality.toFixed(2)}/10`);
    console.log(`😰 Stress Levels: ${moodStats.averages.stress_levels.toFixed(2)}/10`);

    console.log('\n📊 WELLNESS RANGES:');
    console.log('-'.repeat(50));
    console.log(`😊 Wellbeing: ${moodStats.ranges.overall_wellbeing.min}-${moodStats.ranges.overall_wellbeing.max}/10`);
    console.log(`😴 Sleep: ${moodStats.ranges.sleep_quality.min}-${moodStats.ranges.sleep_quality.max}/10`);
    console.log(`😰 Stress: ${moodStats.ranges.stress_levels.min}-${moodStats.ranges.stress_levels.max}/10`);

    console.log('\n📈 CONSISTENCY (Lower = More Consistent):');
    console.log('-'.repeat(50));
    console.log(`😊 Wellbeing Consistency: ${moodStats.consistency.overall_wellbeing.toFixed(2)}`);
    console.log(`😴 Sleep Consistency: ${moodStats.consistency.sleep_quality.toFixed(2)}`);
    console.log(`😰 Stress Consistency: ${moodStats.consistency.stress_levels.toFixed(2)}`);

    console.log('\n📈 TRENDS OVER TIME:');
    console.log('-'.repeat(50));
    console.log(`😊 Wellbeing Trend: ${trends.trends.overall_wellbeing}`);
    console.log(`😴 Sleep Trend: ${trends.trends.sleep_quality}`);
    console.log(`😰 Stress Trend: ${trends.trends.stress_levels}`);
    console.log(`🏃 Activity Trend: ${trends.trends.physical_activity}`);

    console.log('\n🏆 BEST AND WORST DAYS:');
    console.log('-'.repeat(50));
    console.log(`🌟 Best Day: ${trends.bestDay.date}`);
    console.log(`   Wellbeing: ${trends.bestDay.wellbeing}/10, Sleep: ${trends.bestDay.sleep}/10, Stress: ${trends.bestDay.stress}/10`);
    console.log(`😔 Worst Day: ${trends.worstDay.date}`);
    console.log(`   Wellbeing: ${trends.worstDay.wellbeing}/10, Sleep: ${trends.worstDay.sleep}/10, Stress: ${trends.worstDay.stress}/10`);

    console.log('\n📅 WEEKLY AVERAGES:');
    console.log('-'.repeat(50));
    Object.keys(trends.weeklyAverages).forEach(week => {
      const weekData = trends.weeklyAverages[week];
      console.log(`Week of ${week}:`);
      console.log(`  Wellbeing: ${weekData.averages.wellbeing.toFixed(2)}/10`);
      console.log(`  Sleep: ${weekData.averages.sleep.toFixed(2)}/10`);
      console.log(`  Stress: ${weekData.averages.stress.toFixed(2)}/10`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎯 MULTI-DAY ANALYSIS COMPLETE');
    console.log('='.repeat(80));

    console.log('\n🎉 Multi-day mood analysis successful!');
    console.log('\n📋 What this test demonstrated:');
    console.log('   ✅ Multiple days of mood data collection');
    console.log('   ✅ Comprehensive statistical analysis');
    console.log('   ✅ Trend identification over time');
    console.log('   ✅ Consistency measurement');
    console.log('   ✅ Best/worst day identification');
    console.log('   ✅ Weekly pattern analysis');

    console.log('\n🚀 Your enhanced system provides:');
    console.log('   📊 Multi-day pattern analysis');
    console.log('   📈 Trend identification and tracking');
    console.log('   📊 Consistency measurement');
    console.log('   🏆 Peak performance identification');
    console.log('   📅 Weekly pattern recognition');
    console.log('   💡 Data-driven insights for better recommendations');

    console.log('\n💡 Key Insights for Gemini Analysis:');
    console.log('   🔍 Multiple data points provide richer context');
    console.log('   📈 Trends show improvement or decline patterns');
    console.log('   📊 Consistency reveals stability vs. volatility');
    console.log('   🏆 Best days show optimal conditions');
    console.log('   📅 Weekly patterns reveal lifestyle rhythms');

  } catch (error) {
    console.error('\n❌ Multi-day mood analysis test failed:');
    console.error(error);
  }
}

// Run the test
if (require.main === module) {
  testMultiDayMoodAnalysis();
}
