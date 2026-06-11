import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect as any); // Protect all analytics routes

router.get('/metrics', AnalyticsController.getMetrics as any);
router.get('/charts', AnalyticsController.getCharts as any);

export default router;
