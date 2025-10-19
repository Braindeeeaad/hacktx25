import { Request, Response, NextFunction } from 'express';
import { WellbeingDataRequest, WellbeingDataBatchRequest } from '../types';
import { createError } from './errorHandler';

export const validateWellbeingData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { userId, date, overall_wellbeing, sleep_quality, physical_activity, time_with_family_friends, diet_quality, stress_levels } = req.body as WellbeingDataRequest;

  // Validate required fields
  if (!userId || typeof userId !== 'string') {
    return next(createError('userId is required and must be a string', 400));
  }

  if (!date || typeof date !== 'string') {
    return next(createError('date is required and must be a string in YYYY-MM-DD format', 400));
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return next(createError('date must be in YYYY-MM-DD format', 400));
  }

  // Validate date is valid
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return next(createError('date must be a valid date', 400));
  }

  // Validate wellbeing scores (1-10 scale)
  const validateScore = (value: any, fieldName: string) => {
    if (typeof value !== 'number' || value < 1 || value > 10 || !Number.isInteger(value)) {
      return next(createError(`${fieldName} must be an integer between 1 and 10`, 400));
    }
  };

  validateScore(overall_wellbeing, 'overall_wellbeing');
  validateScore(sleep_quality, 'sleep_quality');
  validateScore(physical_activity, 'physical_activity');
  validateScore(time_with_family_friends, 'time_with_family_friends');
  validateScore(diet_quality, 'diet_quality');
  validateScore(stress_levels, 'stress_levels');

  next();
};

export const validateWellbeingDataBatch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { userId, wellbeingData } = req.body as WellbeingDataBatchRequest;

  // Validate required fields
  if (!userId || typeof userId !== 'string') {
    return next(createError('userId is required and must be a string', 400));
  }

  if (!wellbeingData || !Array.isArray(wellbeingData) || wellbeingData.length === 0) {
    return next(createError('wellbeingData is required and must be a non-empty array', 400));
  }

  // Validate each wellbeing data entry
  for (let i = 0; i < wellbeingData.length; i++) {
    const entry = wellbeingData[i];
    
    // Create a mock request object for validation
    const mockReq = {
      //body: { userId, ...entry }
      body: { ...entry, userId }
    } as Request;

    // Validate each entry using the single entry validator
    validateWellbeingData(mockReq, res, (error) => {
      if (error) {
        return next(createError(`Invalid data at index ${i}: ${error.message}`, 400));
      }
    });
  }

  next();
};

// Partial validation for updates (only validates fields that are present)
export const validateWellbeingDataPartial = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const data = req.body as Partial<WellbeingDataRequest>;

  // Validate date format if present
  if (data.date !== undefined) {
    if (typeof data.date !== 'string') {
      return next(createError('date must be a string', 400));
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      return next(createError('date must be in YYYY-MM-DD format', 400));
    }

    const parsedDate = new Date(data.date);
    if (isNaN(parsedDate.getTime())) {
      return next(createError('date must be a valid date', 400));
    }
  }

  // Validate numeric fields if present (1-10 range)
  const numericFields = ['overall_wellbeing', 'sleep_quality', 'physical_activity', 'time_with_family_friends', 'diet_quality', 'stress_levels'];
  
  for (const field of numericFields) {
    const value = data[field as keyof typeof data];
    if (value !== undefined) {
      if (typeof value !== 'number' || value < 1 || value > 10) {
        return next(createError(`${field} must be a number between 1 and 10`, 400));
      }
    }
  }

  next();
};

// Legacy validation for backward compatibility
export const validateEmotionalData = validateWellbeingData;

export const validateQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit, startDate, endDate, userId } = req.query;

  // Validate pagination
  if (page !== undefined) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(createError('page must be a positive integer', 400));
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return next(createError('limit must be a positive integer between 1 and 100', 400));
    }
  }

  // Validate dates
  if (startDate !== undefined) {
    const start = new Date(startDate as string);
    if (isNaN(start.getTime())) {
      return next(createError('startDate must be a valid ISO date string', 400));
    }
  }

  if (endDate !== undefined) {
    const end = new Date(endDate as string);
    if (isNaN(end.getTime())) {
      return next(createError('endDate must be a valid ISO date string', 400));
    }
  }

  // Validate userId
  if (userId !== undefined && typeof userId !== 'string') {
    return next(createError('userId must be a string', 400));
  }

  next();
};
