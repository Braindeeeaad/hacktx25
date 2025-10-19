import axios, { AxiosResponse } from 'axios';
import { getD1ApiBase, getD1Headers, validateD1Config } from '../config/d1';
import { WellbeingData, WellbeingDataRequest, WellbeingDataBatchRequest, QueryOptions } from '../types';

export class D1Service {
  private static instance: D1Service;

  private constructor() {
    if (!validateD1Config()) {
      throw new Error('Invalid D1 configuration. Please check your environment variables.');
    }
  }

  public static getInstance(): D1Service {
    if (!D1Service.instance) {
      D1Service.instance = new D1Service();
    }
    return D1Service.instance;
  }

  // Execute SQL query
  private async executeQuery(sql: string, params: any[] = []): Promise<any> {
    try {
      const response: AxiosResponse = await axios.post(
        `${getD1ApiBase()}/query`,
        {
          sql,
          params
        },
        {
          headers: getD1Headers()
        }
      );

      if (!response.data.success) {
        throw new Error(`D1 query failed: ${response.data.errors?.[0]?.message || 'Unknown error'}`);
      }

      // D1 API returns data in result[0] format
      const d1Result = response.data.result?.[0];
      if (!d1Result) {
        throw new Error('D1 query returned no result data');
      }

      return d1Result;
    } catch (error) {
      console.error('D1 query error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('D1 API Error Response:', axiosError.response.data);
        console.error('D1 API Error Status:', axiosError.response.status);
      }
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create wellbeing data entry
  async createWellbeingData(data: WellbeingDataRequest): Promise<WellbeingData> {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    const dateParts = this.parseDate(data.date);
    
    const sql = `
      INSERT INTO wellbeing_data (
        id, user_id, date, year, month, day,
        overall_wellbeing, sleep_quality, physical_activity,
        time_with_family_friends, diet_quality, stress_levels
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.userId,
      data.date,
      dateParts.year,
      dateParts.month,
      dateParts.day,
      data.overall_wellbeing,
      data.sleep_quality,
      data.physical_activity,
      data.time_with_family_friends,
      data.diet_quality,
      data.stress_levels
    ];

    await this.executeQuery(sql, params);

    return {
      id,
      ...data,
      year: dateParts.year,
      month: dateParts.month,
      day: dateParts.day,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  }

  // Create multiple wellbeing data entries (batch insert)
  async createWellbeingDataBatch(batchData: WellbeingDataBatchRequest): Promise<WellbeingData[]> {
    const results: WellbeingData[] = [];
    
    for (const data of batchData.wellbeingData) {
      try {
        const result = await this.createWellbeingData(data);
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
    const sql = 'SELECT * FROM wellbeing_data WHERE id = ?';
    const result = await this.executeQuery(sql, [id]);
    
    if (!result.results || result.results.length === 0) {
      return null;
    }

    return this.mapRowToWellbeingData(result.results[0]);
  }

  // Get wellbeing data by user ID
  async getWellbeingDataByUserId(userId: string, options: QueryOptions = {}): Promise<WellbeingData[]> {
    let sql = 'SELECT * FROM wellbeing_data WHERE user_id = ?';
    const params: any[] = [userId];

    // Add date filters
    if (options.startDate) {
      sql += ' AND date >= ?';
      params.push(options.startDate);
    }
    if (options.endDate) {
      sql += ' AND date <= ?';
      params.push(options.endDate);
    }

    // Add ordering and pagination
    sql += ' ORDER BY date DESC';
    
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.page && options.page > 1) {
        const offset = (options.page - 1) * options.limit;
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }

    const result = await this.executeQuery(sql, params);
    return (result.results || []).map((row: any) => this.mapRowToWellbeingData(row));
  }

  // Get wellbeing data by user ID and date range
  async getWellbeingDataByDateRange(userId: string, startDate: string, endDate: string): Promise<WellbeingData[]> {
    const sql = 'SELECT * FROM wellbeing_data WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC';
    const result = await this.executeQuery(sql, [userId, startDate, endDate]);
    return (result.results || []).map((row: any) => this.mapRowToWellbeingData(row));
  }

  // Get all wellbeing data with pagination
  async getAllWellbeingData(options: QueryOptions = {}): Promise<{ data: WellbeingData[], total: number }> {
    let sql = 'SELECT * FROM wellbeing_data';
    const params: any[] = [];
    const whereConditions: string[] = [];

    // Add filters
    if (options.userId) {
      whereConditions.push('user_id = ?');
      params.push(options.userId);
    }
    if (options.startDate) {
      whereConditions.push('date >= ?');
      params.push(options.startDate);
    }
    if (options.endDate) {
      whereConditions.push('date <= ?');
      params.push(options.endDate);
    }

    if (whereConditions.length > 0) {
      sql += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await this.executeQuery(countSql, params);
    const total = countResult.results?.[0]?.total || 0;

    // Add ordering and pagination
    sql += ' ORDER BY date DESC';
    
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.page && options.page > 1) {
        const offset = (options.page - 1) * options.limit;
        sql += ' OFFSET ?';
        params.push(offset);
      }
    }

    const result = await this.executeQuery(sql, params);
    const data = (result.results || []).map((row: any) => this.mapRowToWellbeingData(row));

    return { data, total };
  }

  // Update wellbeing data
  async updateWellbeingData(id: string, data: Partial<WellbeingDataRequest>): Promise<WellbeingData | null> {
    const existing = await this.getWellbeingDataById(id);
    if (!existing) {
      return null;
    }

    const updateFields: string[] = [];
    const params: any[] = [];

    if (data.overall_wellbeing !== undefined) {
      updateFields.push('overall_wellbeing = ?');
      params.push(data.overall_wellbeing);
    }
    if (data.sleep_quality !== undefined) {
      updateFields.push('sleep_quality = ?');
      params.push(data.sleep_quality);
    }
    if (data.physical_activity !== undefined) {
      updateFields.push('physical_activity = ?');
      params.push(data.physical_activity);
    }
    if (data.time_with_family_friends !== undefined) {
      updateFields.push('time_with_family_friends = ?');
      params.push(data.time_with_family_friends);
    }
    if (data.diet_quality !== undefined) {
      updateFields.push('diet_quality = ?');
      params.push(data.diet_quality);
    }
    if (data.stress_levels !== undefined) {
      updateFields.push('stress_levels = ?');
      params.push(data.stress_levels);
    }

    if (updateFields.length === 0) {
      return existing;
    }

    updateFields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const sql = `UPDATE wellbeing_data SET ${updateFields.join(', ')} WHERE id = ?`;
    await this.executeQuery(sql, params);

    return this.getWellbeingDataById(id);
  }

  // Delete wellbeing data
  async deleteWellbeingData(id: string): Promise<boolean> {
    const sql = 'DELETE FROM wellbeing_data WHERE id = ?';
    const result = await this.executeQuery(sql, [id]);
    return (result.meta?.changes || 0) > 0;
  }

  // Initialize database schema
  async initializeSchema(): Promise<void> {
    const { SCHEMA_QUERIES } = await import('../config/d1');
    
    // Create main table
    await this.executeQuery(SCHEMA_QUERIES.createWellbeingDataTable);
    
    // Create indexes
    for (const indexQuery of SCHEMA_QUERIES.createIndexes) {
      await this.executeQuery(indexQuery);
    }
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private parseDate(dateString: string): { year: number; month: number; day: number } {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // JavaScript months are 0-indexed
      day: date.getDate()
    };
  }

  private mapRowToWellbeingData(row: any): WellbeingData {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      year: row.year,
      month: row.month,
      day: row.day,
      overall_wellbeing: row.overall_wellbeing,
      sleep_quality: row.sleep_quality,
      physical_activity: row.physical_activity,
      time_with_family_friends: row.time_with_family_friends,
      diet_quality: row.diet_quality,
      stress_levels: row.stress_levels,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  // Legacy methods for backward compatibility
  async createEmotionalData(data: any): Promise<any> {
    return this.createWellbeingData(data);
  }

  async getEmotionalDataById(id: string): Promise<any> {
    return this.getWellbeingDataById(id);
  }

  async getEmotionalDataByUserId(userId: string, options: QueryOptions = {}): Promise<any[]> {
    return this.getWellbeingDataByUserId(userId, options);
  }

  async getAllEmotionalData(options: QueryOptions = {}): Promise<{ data: any[], total: number }> {
    return this.getAllWellbeingData(options);
  }

  async updateEmotionalData(id: string, data: any): Promise<any> {
    return this.updateWellbeingData(id, data);
  }

  async deleteEmotionalData(id: string): Promise<boolean> {
    return this.deleteWellbeingData(id);
  }
}
