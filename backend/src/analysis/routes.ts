/**
 * API Routes for Financial-Wellbeing Impact Analysis
 * Provides endpoints for correlation analysis, predictive modeling, and AI insights
 */

import { Router, Request, Response } from 'express';
import { ImpactAnalyzer } from './impactAnalyzer';
import { Transaction } from '../gemini/index';
import { WellbeingData } from './correlationAnalyzer';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const router = Router();

// Initialize Impact Analyzer with Gemini API key
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const impactAnalyzer = new ImpactAnalyzer(geminiApiKey);

/**
 * GET /api/analysis/financial-wellbeing-impact
 * Performs comprehensive financial-wellbeing impact analysis
 */
router.get('/financial-wellbeing-impact', async (req: Request, res: Response) => {
  try {
    console.log('🧠 Financial-Wellbeing Impact Analysis requested');
    
    // Get user ID from query parameters or headers
    const userId = req.query.userId as string || req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        message: 'Please provide userId in query parameters or x-user-id header'
      });
    }

    // TODO: Fetch transactions and wellbeing data from database
    // For now, we'll use mock data or expect it to be provided
    const transactions: Transaction[] = req.body.transactions || [];
    const wellbeingData: WellbeingData[] = req.body.wellbeingData || [];

    if (transactions.length === 0 || wellbeingData.length === 0) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'Both transactions and wellbeing data are required for analysis'
      });
    }

    // Perform impact analysis
    const analysisResult = await impactAnalyzer.analyzeFinancialWellbeingImpact(
      transactions,
      wellbeingData
    );

    res.json({
      success: true,
      data: analysisResult,
      message: 'Financial-wellbeing impact analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ Financial-wellbeing impact analysis failed:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/analysis/financial-wellbeing-impact
 * Alternative endpoint that accepts data in request body
 */
router.post('/financial-wellbeing-impact', async (req: Request, res: Response) => {
  try {
    console.log('🧠 Financial-Wellbeing Impact Analysis (POST) requested');
    
    const { transactions, wellbeingData, userId } = req.body;

    if (!transactions || !wellbeingData) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'Both transactions and wellbeingData are required'
      });
    }

    if (!Array.isArray(transactions) || !Array.isArray(wellbeingData)) {
      return res.status(400).json({
        error: 'Invalid data format',
        message: 'transactions and wellbeingData must be arrays'
      });
    }

    // Perform impact analysis
    const analysisResult = await impactAnalyzer.analyzeFinancialWellbeingImpact(
      transactions,
      wellbeingData
    );

    res.json({
      success: true,
      data: analysisResult,
      message: 'Financial-wellbeing impact analysis completed successfully'
    });

  } catch (error) {
    console.error('❌ Financial-wellbeing impact analysis failed:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/analysis/quick-insight
 * Generates a quick, actionable insight for real-time analysis
 */
router.get('/quick-insight', async (req: Request, res: Response) => {
  try {
    console.log('⚡ Quick insight requested');
    
    const userId = req.query.userId as string || req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        message: 'Please provide userId in query parameters or x-user-id header'
      });
    }

    // TODO: Fetch recent data from database
    const transactions: Transaction[] = req.body.transactions || [];
    const wellbeingData: WellbeingData[] = req.body.wellbeingData || [];

    if (transactions.length === 0 || wellbeingData.length === 0) {
      return res.status(400).json({
        error: 'Insufficient data',
        message: 'Both transactions and wellbeing data are required for quick insight'
      });
    }

    // Generate quick insight
    const insight = await impactAnalyzer.generateQuickInsight(transactions, wellbeingData);

    res.json({
      success: true,
      data: insight,
      message: 'Quick insight generated successfully'
    });

  } catch (error) {
    console.error('❌ Quick insight generation failed:', error);
    res.status(500).json({
      error: 'Insight generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/analysis/quick-insight
 * Alternative endpoint for quick insight with data in request body
 */
router.post('/quick-insight', async (req: Request, res: Response) => {
  try {
    console.log('⚡ Quick insight (POST) requested');
    
    const { transactions, wellbeingData } = req.body;

    if (!transactions || !wellbeingData) {
      return res.status(400).json({
        error: 'Missing required data',
        message: 'Both transactions and wellbeingData are required'
      });
    }

    // Generate quick insight
    const insight = await impactAnalyzer.generateQuickInsight(transactions, wellbeingData);

    res.json({
      success: true,
      data: insight,
      message: 'Quick insight generated successfully'
    });

  } catch (error) {
    console.error('❌ Quick insight generation failed:', error);
    res.status(500).json({
      error: 'Insight generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/analysis/health-check
 * Health check endpoint for the analysis service
 */
router.get('/health-check', (req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'Financial-Wellbeing Impact Analysis',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: [
      'Correlation Analysis',
      'Predictive Modeling',
      'AI-Powered Insights',
      'What-If Scenarios',
      'Quick Insights'
    ]
  });
});

/**
 * GET /api/analysis/capabilities
 * Returns information about analysis capabilities
 */
router.get('/capabilities', (req: Request, res: Response) => {
  res.json({
    success: true,
    capabilities: {
      correlationAnalysis: {
        description: 'Finds statistical correlations between financial and wellbeing metrics',
        methods: ['Spearman correlation', 'Pearson correlation'],
        metrics: {
          financial: [
            'Total Spending',
            'Entertainment Spending',
            'Food & Dining Spending',
            'Shopping Spending',
            'Transportation Spending',
            'Self-Care Spending',
            'Savings Rate',
            'Unusual Spending Events'
          ],
          wellbeing: [
            'Overall Wellbeing',
            'Stress Levels',
            'Sleep Quality',
            'Energy Levels',
            'Mood'
          ]
        }
      },
      predictiveModeling: {
        description: 'Uses linear regression to predict wellbeing impact of financial decisions',
        methods: ['Multivariate Linear Regression', 'What-If Analysis'],
        features: ['Impact Prediction', 'Confidence Scoring', 'Factor Analysis']
      },
      aiInsights: {
        description: 'Generates personalized, actionable insights using Gemini 2.5 Pro',
        features: [
          'Personalized Recommendations',
          'Actionable Advice',
          'What-If Scenario Analysis',
          'Weekly Impact Summaries',
          'Quick Real-Time Insights'
        ]
      }
    },
    requirements: {
      minimumDataPoints: 3,
      recommendedDataPoints: 8,
      dataTypes: ['Transactions', 'Wellbeing Records'],
      timeRange: 'Weekly aggregation recommended'
    }
  });
});

export default router;
