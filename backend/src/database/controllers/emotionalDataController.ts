import { Request, Response, NextFunction } from 'express';
import { D1Service } from '../services/d1Service';
import { WellbeingDataRequest, WellbeingDataBatchRequest, QueryOptions } from '../types';
import { createError } from '../middleware/errorHandler';

export class EmotionalDataController {
  private d1Service: D1Service;

  constructor() {
    this.d1Service = D1Service.getInstance();
  }

  // Create new wellbeing data entry
  createWellbeingData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wellbeingData: WellbeingDataRequest = req.body;
      
      const result = await this.d1Service.createWellbeingData(wellbeingData);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Wellbeing data created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Create multiple wellbeing data entries (batch)
  createWellbeingDataBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const batchData: WellbeingDataBatchRequest = req.body;
      
      const results = await this.d1Service.createWellbeingDataBatch(batchData);

      res.status(201).json({
        success: true,
        data: results,
        message: `Created ${results.length} wellbeing data entries`
      });
    } catch (error) {
      next(error);
    }
  };

  // Get wellbeing data by ID
  getWellbeingDataById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const result = await this.d1Service.getWellbeingDataById(id);
      
      if (!result) {
        return next(createError('Wellbeing data not found', 404));
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Get wellbeing data by user ID
  getWellbeingDataByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const options: QueryOptions = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const result = await this.d1Service.getWellbeingDataByUserId(userId, options);

      res.status(200).json({
        success: true,
        data: result,
        message: `Found ${result.length} wellbeing data entries for user ${userId}`
      });
    } catch (error) {
      next(error);
    }
  };

  // Get wellbeing data by user ID and date range
  getWellbeingDataByDateRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return next(createError('startDate and endDate are required', 400));
      }

      const result = await this.d1Service.getWellbeingDataByDateRange(
        userId, 
        startDate as string, 
        endDate as string
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `Found ${result.length} wellbeing data entries for user ${userId} between ${startDate} and ${endDate}`
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all wellbeing data with optional filters
  getAllWellbeingData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options: QueryOptions = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      const { data, total } = await this.d1Service.getAllWellbeingData(options);
      
      const totalPages = Math.ceil(total / (options.limit || 10));

      res.status(200).json({
        success: true,
        data,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          total,
          totalPages
        },
        message: `Found ${data.length} wellbeing data entries`
      });
    } catch (error) {
      next(error);
    }
  };

  // Update wellbeing data
  updateWellbeingData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await this.d1Service.updateWellbeingData(id, updateData);
      
      if (!result) {
        return next(createError('Wellbeing data not found', 404));
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Wellbeing data updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete wellbeing data
  deleteWellbeingData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const deleted = await this.d1Service.deleteWellbeingData(id);
      
      if (!deleted) {
        return next(createError('Wellbeing data not found', 404));
      }

      res.status(200).json({
        success: true,
        message: 'Wellbeing data deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Initialize database schema
  initializeDatabase = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.d1Service.initializeSchema();
      
      res.status(200).json({
        success: true,
        message: 'Database schema initialized successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
