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
  note: string;
}

export interface Anomaly {
  date: string;
  category: string;
  amount: number;
  reason: string;
}

export interface Summary {
  totalSpent: number;
  averageDaily: number;
  spanDays: number;
}

export interface AnalysisResult {
  summary: Summary;
  categories: CategoryAnalysis[];
  anomalies: Anomaly[];
  recommendations: string[];
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
