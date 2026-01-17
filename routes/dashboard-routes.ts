// routes/dashboard-routes.ts
import { Router } from "express";
import { 
  getDashboardStats,
  getClientAnalytics,
  getTrainerAnalytics,
  exportDashboardData,
  getDashboardWidgets,
  getTimeSeriesData,
} from "../controllers/dashboard-controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Main dashboard stats
router.get("/stats", getDashboardStats);

// Analytics for specific entities
router.get("/client/:clientId", getClientAnalytics);
router.get("/trainer/:trainerId", getTrainerAnalytics);

// Export functionality
router.get("/export", exportDashboardData);

// Widget-based data (for modular dashboard)
router.get("/widgets", getDashboardWidgets);

// Time series data for charts
router.get("/timeseries", getTimeSeriesData);

export default router;