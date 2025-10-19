// Well-being data types and interfaces

export interface WellbeingData {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  year: number;
  month: number;
  day: number;
  overall_wellbeing: number; // 1-10 scale
  sleep_quality: number; // 1-10 scale
  physical_activity: number; // 1-10 scale
  time_with_family_friends: number; // 1-10 scale
  diet_quality: number; // 1-10 scale
  stress_levels: number; // 1-10 scale (inverted - lower is better)
  createdAt?: string;
  updatedAt?: string;
}

export interface WellbeingDataRequest {
  userId: string;
  date: string; // YYYY-MM-DD format
  overall_wellbeing: number;
  sleep_quality: number;
  physical_activity: number;
  time_with_family_friends: number;
  diet_quality: number;
  stress_levels: number;
}

export interface WellbeingDataBatchRequest {
  userId: string;
  wellbeingData: WellbeingDataRequest[];
}

export interface WellbeingDataResponse {
  success: boolean;
  data?: WellbeingData;
  error?: string;
  message?: string;
}

export interface WellbeingDataListResponse {
  success: boolean;
  data?: WellbeingData[];
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Legacy interfaces for backward compatibility
export interface EmotionalData extends WellbeingData {}
export interface EmotionalDataRequest extends WellbeingDataRequest {}
export interface EmotionalDataResponse extends WellbeingDataResponse {}
export interface EmotionalDataListResponse extends WellbeingDataListResponse {}

export interface DatabaseConfig {
  databaseId: string;
  accountId: string;
  apiToken: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
}
