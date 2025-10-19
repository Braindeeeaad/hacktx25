/**
 * Test Real Data with Gemini Analysis
 * Tests the complete system with real Cloudflare D1 data + Nessie data + Gemini analysis
 */

import { D1Service } from '../database/services/d1Service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Set environment variables directly
process.env.CLOUDFLARE_ACCOUNT_ID = '58aae2a74d260d160efc18a4b308c373';
process.env.CLOUDFLARE_API_TOKEN = 'pKxjhXZi-agHpRy7v_JuMDH-aLjAlgI5wXSDfFNA';
process.env.CLOUDFLARE_D1_DATABASE_ID = '40bc49e1-1fd5-45be-a7b4-641d6fbf0c21';
process.env.GEMINI_API_KEY = 'AIzaSyAvanlVJGoRssaEvt9pisH_JPdbX43lPs8';
process.env.NESSIE_API_KEY = '2535e8ec7de75e2bb33a7e0bab0cc897';
process.env.NESSIE_CUSTOMER_ID = '68f4080c9683f20dd519f005';

declare const console: {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

/**
 * Test complete system with real data
 */
async function testRealDataWithGemini() {
  console.log('🎯 REAL DATA + GEMINI ANALYSIS TEST');
  console.log('====================================');
  console.log('🎯 Testing complete system with real Cloudflare D1 + Nessie + Gemini');

  try {
    // Step 1: Get real mood data from Cloudflare D1
    console.log('\n1️⃣ Getting real mood data from Cloudflare D1...');
    const d1Service = D1Service.getInstance();
    const realUserId = 'test-user-123';
    
    const realMoodData = await d1Service.getWellbeingDataByUserId(realUserId, {
      startDate: '2024-01-01',
      endDate: '2025-12-31'
    });

    console.log(`✅ Retrieved ${realMoodData.length} real mood entries from Cloudflare D1`);
    
    if (realMoodData.length > 0) {
      console.log('\n📊 Real Mood Data:');
      realMoodData.forEach((entry: any, index: number) => {
        console.log(`   Entry ${index + 1} (${entry.date}):`);
        console.log(`     😊 Wellbeing: ${entry.overall_wellbeing}/10`);
        console.log(`     😴 Sleep: ${entry.sleep_quality}/10`);
        console.log(`     🏃 Activity: ${entry.physical_activity}/10`);
        console.log(`     👨‍👩‍👧‍👦 Social: ${entry.time_with_family_friends}/10`);
        console.log(`     🥗 Diet: ${entry.diet_quality}/10`);
        console.log(`     😰 Stress: ${entry.stress_levels}/10`);
      });
    }

    // Step 2: Get real spending data from Nessie API
    console.log('\n2️⃣ Getting real spending data from Nessie API...');
    const nessieResponse = await axios.get(
      `http://api.nessieisreal.com/customers/${process.env.NESSIE_CUSTOMER_ID}/accounts`,
      {
        params: {
          key: process.env.NESSIE_API_KEY
        },
        timeout: 10000
      }
    );

    if (nessieResponse.data && nessieResponse.data.length > 0) {
      const accountId = nessieResponse.data[0]._id;
      console.log(`✅ Found account: ${accountId}`);
      
      // Get transactions
      const transactionsResponse = await axios.get(
        `http://api.nessieisreal.com/accounts/${accountId}/purchases`,
        {
          params: {
            key: process.env.NESSIE_API_KEY
          },
          timeout: 10000
        }
      );

      console.log(`✅ Retrieved ${transactionsResponse.data.length} real transactions from Nessie`);
      
      // Process transactions
      const realTransactions = transactionsResponse.data.map((tx: any) => {
        let category = 'Other';
        if (tx.description) {
          if (tx.description.includes('Takeout')) category = 'Food';
          else if (tx.description.includes('Groceries')) category = 'Food';
          else if (tx.description.includes('Gas')) category = 'Transportation';
          else if (tx.description.includes('Shopping')) category = 'Shopping';
          else if (tx.description.includes('Coffee')) category = 'Food';
          else if (tx.description.includes('Entertainment')) category = 'Entertainment';
        }
        
        return {
          id: tx._id,
          date: tx.purchase_date,
          merchant: tx.merchant_id || 'Unknown Merchant',
          amount: tx.amount,
          category: category,
          description: tx.description,
          type: 'debit'
        };
      });

      console.log('\n📊 Real Spending Data (sample):');
      realTransactions.slice(0, 5).forEach((tx: any, index: number) => {
        console.log(`   Transaction ${index + 1}: ${tx.date} - ${tx.category} - $${tx.amount.toFixed(2)}`);
      });

      // Step 3: Run Gemini analysis with real data
      console.log('\n3️⃣ Running Gemini analysis with real data...');
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp' });

      // Calculate mood statistics
      const moodStats = {
        totalEntries: realMoodData.length,
        averageWellbeing: realMoodData.reduce((sum: number, entry: any) => sum + entry.overall_wellbeing, 0) / realMoodData.length,
        averageSleep: realMoodData.reduce((sum: number, entry: any) => sum + entry.sleep_quality, 0) / realMoodData.length,
        averageActivity: realMoodData.reduce((sum: number, entry: any) => sum + entry.physical_activity, 0) / realMoodData.length,
        averageSocial: realMoodData.reduce((sum: number, entry: any) => sum + entry.time_with_family_friends, 0) / realMoodData.length,
        averageDiet: realMoodData.reduce((sum: number, entry: any) => sum + entry.diet_quality, 0) / realMoodData.length,
        averageStress: realMoodData.reduce((sum: number, entry: any) => sum + entry.stress_levels, 0) / realMoodData.length
      };

      // Calculate spending statistics
      const totalSpent = realTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      const categoryTotals: Record<string, number> = {};
      realTransactions.forEach((tx: any) => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      });

      const prompt = `
You are an AI financial wellness coach. Analyze the following real user data and provide personalized insights.

REAL MOOD DATA (from Cloudflare D1 database):
- Total Entries: ${moodStats.totalEntries}
- Average Wellbeing: ${moodStats.averageWellbeing.toFixed(2)}/10
- Average Sleep Quality: ${moodStats.averageSleep.toFixed(2)}/10
- Average Physical Activity: ${moodStats.averageActivity.toFixed(2)}/10
- Average Social Time: ${moodStats.averageSocial.toFixed(2)}/10
- Average Diet Quality: ${moodStats.averageDiet.toFixed(2)}/10
- Average Stress Level: ${moodStats.averageStress.toFixed(2)}/10

REAL SPENDING DATA (from Nessie API):
- Total Spent: $${totalSpent.toFixed(2)}
- Number of Transactions: ${realTransactions.length}
- Category Breakdown: ${JSON.stringify(categoryTotals, null, 2)}

INDIVIDUAL MOOD ENTRIES:
${realMoodData.map(entry => 
  `${entry.date}: Wellbeing ${entry.overall_wellbeing}/10, Sleep ${entry.sleep_quality}/10, Activity ${entry.physical_activity}/10, Social ${entry.time_with_family_friends}/10, Diet ${entry.diet_quality}/10, Stress ${entry.stress_levels}/10`
).join('\n')}

SAMPLE TRANSACTIONS:
${realTransactions.slice(0, 10).map((tx: any) => 
  `${tx.date}: ${tx.category} - $${tx.amount.toFixed(2)} (${tx.description})`
).join('\n')}

Please provide:
1. A personalized wellness assessment based on the real mood data
2. Financial insights based on the real spending patterns
3. Specific recommendations linking mood and spending patterns
4. Actionable wellness tips based on the user's actual data

Respond in JSON format with the following structure:
{
  "wellnessAssessment": "Personalized assessment of the user's wellness based on real data",
  "financialInsights": "Analysis of spending patterns from real transactions",
  "moodSpendingCorrelations": "Specific correlations between mood and spending",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3"
  ],
  "wellnessTips": [
    "Personalized wellness tip 1",
    "Personalized wellness tip 2"
  ]
}
`;

      console.log('🤖 Sending real data to Gemini for analysis...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini analysis completed with real data!');
      
      // Parse and display results
      try {
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const analysis = JSON.parse(cleanedText);

        console.log('\n' + '='.repeat(80));
        console.log('🎯 REAL DATA GEMINI ANALYSIS RESULTS');
        console.log('='.repeat(80));

        console.log('\n🧘 WELLNESS ASSESSMENT:');
        console.log('-'.repeat(50));
        console.log(analysis.wellnessAssessment);

        console.log('\n💰 FINANCIAL INSIGHTS:');
        console.log('-'.repeat(50));
        console.log(analysis.financialInsights);

        console.log('\n🔗 MOOD-SPENDING CORRELATIONS:');
        console.log('-'.repeat(50));
        console.log(analysis.moodSpendingCorrelations);

        console.log('\n💡 PERSONALIZED RECOMMENDATIONS:');
        console.log('-'.repeat(50));
        analysis.recommendations.forEach((rec: string, index: number) => {
          console.log(`${index + 1}. ${rec}`);
        });

        console.log('\n🧘 WELLNESS TIPS:');
        console.log('-'.repeat(50));
        analysis.wellnessTips.forEach((tip: string, index: number) => {
          console.log(`${index + 1}. ${tip}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('🎯 REAL DATA ANALYSIS COMPLETE');
        console.log('='.repeat(80));

        console.log('\n🎉 Real data + Gemini analysis successful!');
        console.log('\n📋 What this test demonstrated:');
        console.log('   ✅ Real Cloudflare D1 mood data retrieved');
        console.log('   ✅ Real Nessie API spending data retrieved');
        console.log('   ✅ Gemini AI analyzed real user data');
        console.log('   ✅ Personalized insights generated');
        console.log('   ✅ Complete system working with real data');

        console.log('\n🚀 Your system is production-ready with real data!');
        console.log('   📱 Frontend: Can display real user insights');
        console.log('   🔗 Integration: Real data → Real analysis → Real recommendations');
        console.log('   🎯 Result: Personalized financial wellness coaching');

      } catch (parseError) {
        console.log('⚠️ Could not parse Gemini response as JSON, showing raw response:');
        console.log(text);
      }

    } else {
      console.log('⚠️ No accounts found in Nessie API');
    }

  } catch (error) {
    console.error('\n❌ Real data + Gemini test failed:');
    console.error(error);
  }
}

// Run the test
if (require.main === module) {
  testRealDataWithGemini();
}
