export class EmotionDBIntegration {
    private baseUrl: string;
    private userId: string;

    constructor(baseUrl: string = 'http://localhost:8000/api/emotional-data', userId: string) {
        this.baseUrl = baseUrl;
        this.userId = userId;
    }

    async getWellbeingData() {
    try {
      const response = await fetch(`${this.baseUrl}/user/${this.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Emotion DB Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  }
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format (same as spending data)
  overall_wellbeing: number; // 0-10 scale
  sleep_quality: number; // 0-10 scale
  physical_activity: number; // 0-10 scale
  time_with_family_friends: number; // 0-10 scale
  diet_quality: number; // 0-10 scale
  stress_levels: number; // 0-10 scale
  notes?: string;
}