import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AnalyticsController {
  /**
   * Retrieve core dashboard card counts
   */
  static async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const metrics = await AnalyticsService.getDashboardMetrics(userId);

      return res
        .status(200)
        .json(new ApiResponse(200, metrics, 'Dashboard metrics retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve chart historical datasets
   */
  static async getCharts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id.toString();
      const chartData = await AnalyticsService.getAnalyticsData(userId);

      return res
        .status(200)
        .json(new ApiResponse(200, chartData, 'Analytics chart data retrieved successfully'));
    } catch (error) {
      return next(error);
    }
  }
}
