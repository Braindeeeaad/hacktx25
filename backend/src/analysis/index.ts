/**
 * Financial-Wellbeing Impact Analysis Module
 * Main entry point for the analysis module
 */

// Export main classes and interfaces
export { CorrelationAnalyzer } from './correlationAnalyzer';
export { PredictiveModeling } from './predictiveModeling';
export { ImpactAnalyzer } from './impactAnalyzer';
export { GeminiPrompts } from './geminiPrompts';

// Export types
export type {
  WellbeingData,
  FinancialMetrics,
  CorrelationResult,
  WeeklyDataPoint
} from './correlationAnalyzer';

export type {
  RegressionCoefficients,
  RegressionModel,
  PredictionResult,
  WhatIfScenario
} from './predictiveModeling';

export type {
  ImpactInsight,
  FinancialWellbeingReport
} from './geminiPrompts';

export type {
  ImpactAnalysisResult,
  QuickInsightResult
} from './impactAnalyzer';

// Export routes
export { default as analysisRoutes } from './routes';
