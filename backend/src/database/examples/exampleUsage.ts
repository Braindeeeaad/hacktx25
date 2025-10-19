// Example usage of the Wellbeing Data API
// This file demonstrates how to use the API endpoints

import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/emotional-data';

// Example wellbeing data (single entry)
const exampleWellbeingData = {
  userId: 'user123',
  date: '2025-01-15',
  overall_wellbeing: 8,
  sleep_quality: 7,
  physical_activity: 6,
  time_with_family_friends: 8,
  diet_quality: 7,
  stress_levels: 3
};

// Example batch wellbeing data (multiple entries)
const exampleBatchWellbeingData = {
  userId: 'user123',
  wellbeingData: [
    {
      date: '2025-01-14',
      overall_wellbeing: 7,
      sleep_quality: 8,
      physical_activity: 6,
      time_with_family_friends: 7,
      diet_quality: 8,
      stress_levels: 4
    },
    {
      date: '2025-01-15',
      overall_wellbeing: 6,
      sleep_quality: 5,
      physical_activity: 4,
      time_with_family_friends: 6,
      diet_quality: 7,
      stress_levels: 6
    },
    {
      date: '2025-01-16',
      overall_wellbeing: 8,
      sleep_quality: 9,
      physical_activity: 7,
      time_with_family_friends: 8,
      diet_quality: 9,
      stress_levels: 3
    },
    {
      date: '2025-01-17',
      overall_wellbeing: 5,
      sleep_quality: 4,
      physical_activity: 5,
      time_with_family_friends: 5,
      diet_quality: 6,
      stress_levels: 7
    },
    {
      date: '2025-01-18',
      overall_wellbeing: 9,
      sleep_quality: 9,
      physical_activity: 8,
      time_with_family_friends: 9,
      diet_quality: 8,
      stress_levels: 2
    }
  ]
};

// Example API usage functions
export class WellbeingDataAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
  }

  // Create wellbeing data
  async createWellbeingData(data: typeof exampleWellbeingData) {
    try {
      const response = await axios.post(this.baseURL, data);
      console.log('✅ Created wellbeing data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating wellbeing data:', error);
      throw error;
    }
  }

  // Create batch wellbeing data
  async createWellbeingDataBatch(data: typeof exampleBatchWellbeingData) {
    try {
      const response = await axios.post(`${this.baseURL}/batch`, data);
      console.log('✅ Created batch wellbeing data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating batch wellbeing data:', error);
      throw error;
    }
  }

  // Get all wellbeing data
  async getAllWellbeingData(options: {
    page?: number;
    limit?: number;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const response = await axios.get(this.baseURL, { params: options });
      console.log('✅ Retrieved wellbeing data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error retrieving wellbeing data:', error);
      throw error;
    }
  }

  // Get wellbeing data by user ID
  async getWellbeingDataByUserId(userId: string, options: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/user/${userId}`, { params: options });
      console.log(`✅ Retrieved wellbeing data for user ${userId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error retrieving user wellbeing data:', error);
      throw error;
    }
  }

  // Get wellbeing data by user ID and date range
  async getWellbeingDataByDateRange(userId: string, startDate: string, endDate: string) {
    try {
      const response = await axios.get(`${this.baseURL}/user/${userId}/range`, { 
        params: { startDate, endDate } 
      });
      console.log(`✅ Retrieved wellbeing data for user ${userId} between ${startDate} and ${endDate}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error retrieving user wellbeing data by date range:', error);
      throw error;
    }
  }

  // Get wellbeing data by ID
  async getWellbeingDataById(id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      console.log('✅ Retrieved wellbeing data by ID:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error retrieving wellbeing data by ID:', error);
      throw error;
    }
  }

  // Update wellbeing data
  async updateWellbeingData(id: string, updateData: Partial<typeof exampleWellbeingData>) {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, updateData);
      console.log('✅ Updated wellbeing data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating wellbeing data:', error);
      throw error;
    }
  }

  // Delete wellbeing data
  async deleteWellbeingData(id: string) {
    try {
      const response = await axios.delete(`${this.baseURL}/${id}`);
      console.log('✅ Deleted wellbeing data:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting wellbeing data:', error);
      throw error;
    }
  }

  // Initialize database schema
  async initializeDatabase() {
    try {
      const response = await axios.post(`${this.baseURL}/init`);
      console.log('✅ Database initialized:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }
}

// Example usage function
export async function runExamples() {
  const api = new WellbeingDataAPI();

  try {
    console.log('🚀 Starting Wellbeing Data API Examples...\n');

    // Initialize database
    console.log('1. Initializing database schema...');
    await api.initializeDatabase();

    // Create single wellbeing data entry
    console.log('\n2. Creating single wellbeing data entry...');
    const createdData = await api.createWellbeingData(exampleWellbeingData);
    const dataId = createdData.data.id;

    // Create batch wellbeing data
    console.log('\n3. Creating batch wellbeing data...');
    await api.createWellbeingDataBatch(exampleBatchWellbeingData);

    // Get all wellbeing data
    console.log('\n4. Getting all wellbeing data...');
    await api.getAllWellbeingData({ limit: 5 });

    // Get wellbeing data by user ID
    console.log('\n5. Getting wellbeing data by user ID...');
    await api.getWellbeingDataByUserId('user123', { limit: 3 });

    // Get wellbeing data by date range
    console.log('\n6. Getting wellbeing data by date range...');
    await api.getWellbeingDataByDateRange('user123', '2025-01-14', '2025-01-18');

    // Get wellbeing data by ID
    console.log('\n7. Getting wellbeing data by ID...');
    await api.getWellbeingDataById(dataId);

    // Update wellbeing data
    console.log('\n8. Updating wellbeing data...');
    await api.updateWellbeingData(dataId, {
      overall_wellbeing: 9,
      sleep_quality: 8,
      stress_levels: 2
    });

    // Get updated data
    console.log('\n9. Getting updated wellbeing data...');
    await api.getWellbeingDataById(dataId);

    // Create more test data for different user
    console.log('\n10. Creating additional test data for user456...');
    await api.createWellbeingData({
      userId: 'user456',
      date: '2025-01-15',
      overall_wellbeing: 6,
      sleep_quality: 5,
      physical_activity: 4,
      time_with_family_friends: 6,
      diet_quality: 7,
      stress_levels: 6
    });

    // Get all data with pagination
    console.log('\n11. Getting all data with pagination...');
    await api.getAllWellbeingData({ page: 1, limit: 3 });

    // Get data with date filters
    console.log('\n12. Getting data with date filters...');
    await api.getAllWellbeingData({ 
      startDate: '2025-01-14', 
      endDate: '2025-01-18',
      limit: 10 
    });

    console.log('\n✅ All examples completed successfully!');

  } catch (error) {
    console.error('\n❌ Example failed:', error);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
