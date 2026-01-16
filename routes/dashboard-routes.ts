// routes/dashboard-routes.ts
import express from 'express';
import * as dashboardController from '../controllers/dashboard-controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Main dashboard endpoint - automatically serves role-based dashboard
router.get('/', dashboardController.getDashboard);

// Role-specific dashboard endpoints
router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/trainer', authorize('ADMIN', 'TRAINER'), dashboardController.getTrainerDashboard);
router.get('/client', authorize('ADMIN', 'CLIENT'), dashboardController.getClientDashboard);

// Quick stats endpoint
router.get('/quick-stats', dashboardController.getQuickStats);

// Recent activity feed
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;