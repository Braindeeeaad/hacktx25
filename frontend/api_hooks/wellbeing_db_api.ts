import { WellbeingData } from './api_types';

// API service functions
const API_BASE_URL = 'https://webless-lustreless-adeline.ngrok-free.dev/api/emotional-data';

export const fetchUserWellbeingData = async (userId: string): Promise<WellbeingData[]> => {
  try {
    console.log('🔍 Attempting to fetch data for user:', userId);
    console.log('🌐 API URL:', `${API_BASE_URL}/user/${userId}?limit=7`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}?limit=7`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ API Success:', result);
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching wellbeing data:', error);
    console.error('❌ Error type:', typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
};

export const calculateWellnessScore = (data: WellbeingData[]): number => {
  if (data.length === 0) return 0;
  
  const latest = data[0]; // Most recent entry
  const weights = {
    overall_wellbeing: 0.3,
    sleep_quality: 0.2,
    physical_activity: 0.15,
    time_with_family_friends: 0.1,
    diet_quality: 0.15,
    stress_levels: 0.1 // Lower stress is better, so we'll invert this
  };
  
  const score = (
    latest.overall_wellbeing * weights.overall_wellbeing +
    latest.sleep_quality * weights.sleep_quality +
    latest.physical_activity * weights.physical_activity +
    latest.time_with_family_friends * weights.time_with_family_friends +
    latest.diet_quality * weights.diet_quality +
    (11 - latest.stress_levels) * weights.stress_levels // Invert stress (lower is better)
  ) * 10; // Scale to 0-100
  
  return Math.round(score);
};