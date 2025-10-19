import { Router } from 'express';
import { EmotionalDataController } from '../controllers/emotionalDataController';
import { validateWellbeingData, validateWellbeingDataBatch, validateWellbeingDataPartial, validateQueryParams } from '../middleware/validation';

const router = Router();

// Lazy initialization to ensure environment variables are loaded first
const getController = () => {
  return new EmotionalDataController();
};

// Initialize database schema (admin endpoint)
router.post('/init', (req, res, next) => getController().initializeDatabase(req, res, next));

// Create new wellbeing data entry
router.post('/', validateWellbeingData, (req, res, next) => getController().createWellbeingData(req, res, next));

// Create multiple wellbeing data entries (batch)
router.post('/batch', validateWellbeingDataBatch, (req, res, next) => getController().createWellbeingDataBatch(req, res, next));

// Get all wellbeing data with optional filters and pagination
router.get('/', validateQueryParams, (req, res, next) => getController().getAllWellbeingData(req, res, next));

// Get wellbeing data by ID
router.get('/:id', (req, res, next) => getController().getWellbeingDataById(req, res, next));

// Get wellbeing data by user ID
router.get('/user/:userId', validateQueryParams, (req, res, next) => getController().getWellbeingDataByUserId(req, res, next));

// Get wellbeing data by user ID and date range
router.get('/user/:userId/range', validateQueryParams, (req, res, next) => getController().getWellbeingDataByDateRange(req, res, next));

// Update wellbeing data
router.put('/:id', validateWellbeingDataPartial, (req, res, next) => getController().updateWellbeingData(req, res, next));

// Delete wellbeing data
router.delete('/:id', (req, res, next) => getController().deleteWellbeingData(req, res, next));

export { router as emotionalDataRoutes };
