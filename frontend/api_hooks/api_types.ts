export interface FinanceScore {
  overall: number; // 0-100 overall finance score
  breakdown: {
    spending: number; // Spending control and patterns
    budgeting: number; // Budget adherence and planning
    stability: number; // Financial stability and consistency
  };
  trends: {
    improving: string[]; // Financial areas that are improving
    declining: string[]; // Financial areas that need attention
    stable: string[]; // Financial areas that are consistent
  };
  insights: string[]; // AI-generated insights about financial patterns
  recommendations: string[]; // Specific recommendations for improvement
}

export interface accountType {
    _id : string;
    balance : number;
    customer_id : string;
    nickname : string;
    rewards : number;
    type : string;
}

export interface purchaseType {
    _id: string;
    type: string;
    merchant_id: string;
    payer_id: string;
    purchase_date: string;
    amount: number;
    status: string;
    medium: string;
    description: string;
}

export interface Transaction {
  date: string;
  category: string;
  amount: number;
  product: string;
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
