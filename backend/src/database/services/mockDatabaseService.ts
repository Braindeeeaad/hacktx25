import { WellbeingData, WellbeingDataRequest, WellbeingDataBatchRequest, QueryOptions } from '../types';

// Simple in-memory database for development
class MockDatabase {
  private data: WellbeingData[] = [];
  private nextId = 1;

  async create(data: WellbeingDataRequest): Promise<WellbeingData> {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    const dateParts = this.parseDate(data.date);
    
    const newRecord: WellbeingData = {
      id,
      ...data,
      year: dateParts.year,
      month: dateParts.month,
      day: dateParts.day,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.data.push(newRecord);
    return newRecord;
  }

  async findById(id: string): Promise<WellbeingData | null> {
    return this.data.find(record => record.id === id) || null;
  }

  async findByUserId(userId: string, options: QueryOptions = {}): Promise<WellbeingData[]> {
    let results = this.data.filter(record => record.userId === userId);

    // Apply date filters
    if (options.startDate) {
      results = results.filter(record => record.date >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter(record => record.date <= options.endDate!);
    }

    // Sort by date descending
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    if (options.limit) {
      const startIndex = options.page && options.page > 1 ? (options.page - 1) * options.limit : 0;
      results = results.slice(startIndex, startIndex + options.limit);
    }

    return results;
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<WellbeingData[]> {
    return this.data.filter(record => 
      record.userId === userId && 
      record.date >= startDate && 
      record.date <= endDate
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async findAll(options: QueryOptions = {}): Promise<{ data: WellbeingData[], total: number }> {
    let results = [...this.data];

    // Apply filters
    if (options.userId) {
      results = results.filter(record => record.userId === options.userId);
    }
    if (options.startDate) {
      results = results.filter(record => record.date >= options.startDate!);
    }
    if (options.endDate) {
      results = results.filter(record => record.date <= options.endDate!);
    }

    const total = results.length;

    // Sort by date descending
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination
    if (options.limit) {
      const startIndex = options.page && options.page > 1 ? (options.page - 1) * options.limit : 0;
      results = results.slice(startIndex, startIndex + options.limit);
    }

    return { data: results, total };
  }

  async update(id: string, data: Partial<WellbeingDataRequest>): Promise<WellbeingData | null> {
    const index = this.data.findIndex(record => record.id === id);
    if (index === -1) return null;

    const existing = this.data[index];
    const updated: WellbeingData = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.data[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex(record => record.id === id);
    if (index === -1) return false;

    this.data.splice(index, 1);
    return true;
  }

  private generateId(): string {
    return `mock_${this.nextId++}_${Date.now()}`;
  }

  private parseDate(dateString: string): { year: number; month: number; day: number } {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // JavaScript months are 0-indexed
      day: date.getDate()
    };
  }
}

export class MockDatabaseService {
  private static instance: MockDatabaseService;
  private database: MockDatabase;

  private constructor() {
    this.database = new MockDatabase();
  }

  public static getInstance(): MockDatabaseService {
    if (!MockDatabaseService.instance) {
      MockDatabaseService.instance = new MockDatabaseService();
    }
    return MockDatabaseService.instance;
  }

  // Create wellbeing data entry
  async createWellbeingData(data: WellbeingDataRequest): Promise<WellbeingData> {
    return this.database.create(data);
  }

  // Create multiple wellbeing data entries (batch insert)
  async createWellbeingDataBatch(batchData: WellbeingDataBatchRequest): Promise<WellbeingData[]> {
    const results: WellbeingData[] = [];
    
    for (const data of batchData.wellbeingData) {
      try {
        const result = await this.database.create(data);
        results.push(result);
      } catch (error) {
        console.error(`Failed to create wellbeing data for date ${data.date}:`, error);
        // Continue with other entries even if one fails
      }
    }
    
    return results;
  }

  // Get wellbeing data by ID
  async getWellbeingDataById(id: string): Promise<WellbeingData | null> {
    return this.database.findById(id);
  }

  // Get wellbeing data by user ID
  async getWellbeingDataByUserId(userId: string, options: QueryOptions = {}): Promise<WellbeingData[]> {
    return this.database.findByUserId(userId, options);
  }

  // Get wellbeing data by user ID and date range
  async getWellbeingDataByDateRange(userId: string, startDate: string, endDate: string): Promise<WellbeingData[]> {
    return this.database.findByDateRange(userId, startDate, endDate);
  }

  // Get all wellbeing data with pagination
  async getAllWellbeingData(options: QueryOptions = {}): Promise<{ data: WellbeingData[], total: number }> {
    return this.database.findAll(options);
  }

  // Update wellbeing data
  async updateWellbeingData(id: string, data: Partial<WellbeingDataRequest>): Promise<WellbeingData | null> {
    return this.database.update(id, data);
  }

  // Delete wellbeing data
  async deleteWellbeingData(id: string): Promise<boolean> {
    return this.database.delete(id);
  }

  // Initialize database schema (no-op for mock)
  async initializeSchema(): Promise<void> {
    console.log('Mock database initialized - no schema setup needed');
  }
}
