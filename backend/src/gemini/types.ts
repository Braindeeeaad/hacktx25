export interface Transaction {
  date: string;
  category: string;
  amount: number;
  // add where its from not use in gemini correlation analysis but to display in past transcations
}

export interface CategoryAnalysis {
  category: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  shortInsight: string;
  detailedAnalysis: string;
  wellnessAdvice?: string;
}

export interface Anomaly {
  id: string;
  date: string;
  category: string;
  amount: number;
  shortInsight: string;
  detailedReason: string;
}

export interface Summary {
  totalSpent: number;
  averageDaily: number;
  spanDays: number;
}

export interface Recommendation {
  shortInsight: string;
  detailedAdvice: string;
  linkedInsights: string[]; // AI insights that support this recommendation
  linkedAnomalies: string[]; // Anomaly IDs that triggered this recommendation
  category: 'financial' | 'wellness' | 'behavioral';
}

export interface WellnessTip {
  trigger: string;
  shortTip: string;
  detailedTip: string;
}

export interface AnalysisResult {
  summary: Summary;
  categories: CategoryAnalysis[];
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  wellnessTips: WellnessTip[];
}

export interface ProcessedData {
  totalSpent: number;
  averageDaily: number;
  spanDays: number;
  categoryTotals: Record<string, number>;
  categoryAverages: Record<string, number>;
  categoryChanges: Record<string, string>;
  weeklyData: Record<string, Record<string, number>>;
  anomalies: Anomaly[];
}
