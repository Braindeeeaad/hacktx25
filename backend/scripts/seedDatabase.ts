import { D1Service } from '../src/database/services/d1Service';
import { WellbeingDataRequest } from '../src/database/types';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../src/.env') });

// Configuration
const USER_ID =  'g1@gmail.com';
const START_DATE = '2025-09-17';
const END_DATE =  '2025-10-16';

// Generate random wellbeing data within realistic ranges
const generateWellbeingData = (date: string): Omit<WellbeingDataRequest, 'userId'> => {
  // Generate realistic data with some variation
  const baseScore = 6 + Math.random() * 3; // Base score between 6-9
  
  return {
    date,
    overall_wellbeing: Math.round(baseScore + (Math.random() - 0.5) * 2), // 5-10 range
    sleep_quality: Math.round(5 + Math.random() * 4), // 5-9 range
    physical_activity: Math.round(4 + Math.random() * 5), // 4-9 range
    time_with_family_friends: Math.round(5 + Math.random() * 4), // 5-9 range
    diet_quality: Math.round(5 + Math.random() * 4), // 5-9 range
    stress_levels: Math.round(2 + Math.random() * 6) // 2-8 range (lower is better)
  };
};

// Generate dates between start and end date
const generateDates = (): string[] => {
  const dates: string[] = [];
  const startDate = new Date(START_DATE);
  const endDate = new Date(END_DATE);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  }
  
  return dates;
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize D1Service
    const d1Service = D1Service.getInstance();
    
    // Initialize database schema first
    console.log('📋 Initializing database schema...');
    await d1Service.initializeSchema();
    console.log('✅ Database schema initialized');
    
    // Generate dates
    const dates = generateDates();
    console.log(`📅 Generated ${dates.length} dates from ${dates[0]} to ${dates[dates.length - 1]}`);
    
    // Generate wellbeing data for each date
    const wellbeingDataArray: WellbeingDataRequest[] = dates.map(date => ({
      userId: USER_ID,
      ...generateWellbeingData(date)
    }));
    
    console.log('📊 Generated wellbeing data for all dates');
    
    // Insert data in batches to avoid overwhelming the API
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < wellbeingDataArray.length; i += batchSize) {
      const batch = wellbeingDataArray.slice(i, i + batchSize);
      const batchRequest = {
        userId: USER_ID,
        wellbeingData: batch
      };
      
      try {
        await d1Service.createWellbeingDataBatch(batchRequest);
        successCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(wellbeingDataArray.length / batchSize)} (${successCount}/${wellbeingDataArray.length} records)`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      }
    }
    
    console.log(`🎉 Seeding completed! Successfully inserted ${successCount} records for user ${USER_ID}`);
    
    // Verify the data was inserted
    console.log('🔍 Verifying inserted data...');
    const userData = await d1Service.getWellbeingDataByUserId(USER_ID);
    console.log(`📈 Found ${userData.length} records for ${USER_ID}`);
    
    if (userData.length > 0) {
      console.log('📊 Sample data:');
      console.log(`   Date range: ${userData[userData.length - 1].date} to ${userData[0].date}`);
      console.log(`   Average wellbeing: ${(userData.reduce((sum, d) => sum + d.overall_wellbeing, 0) / userData.length).toFixed(2)}`);
      console.log(`   Average sleep quality: ${(userData.reduce((sum, d) => sum + d.sleep_quality, 0) / userData.length).toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
