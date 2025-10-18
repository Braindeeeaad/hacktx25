// Main exports for the AI analysis module
export { analyzeSpending } from './analyzeSpending';
export { 
  Transaction, 
  AnalysisResult, 
  CategoryAnalysis, 
  Anomaly, 
  Summary 
} from './types';

// API Integration exports
export { NessieAPIIntegration } from './nessieIntegration';
export { 
  PlaidIntegration, 
  YNABIntegration, 
  MintIntegration, 
  BankAPIIntegration, 
  CSVIntegration 
} from './apiExamples';
export { SpendingAnalysisService } from './apiIntegration';

// Testing exports
export { TestDataGenerator, LocalTestingSuite, runQuickTest } from './localTesting';
export { TestRunner, runTests } from './testRunner';

// Utility exports
export { processSpendingData, formatDataForGemini } from './utils/dataProcessor';
export { SPENDING_ANALYSIS_PROMPT } from './prompts/spendingAnalysisPrompt';
