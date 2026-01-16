// routes/measurement-routes.ts
import express from 'express';
import * as measurementController from '../controllers/measurement-controller';
import { authenticate, authorize, authorizeSelfOrAdmin } from '../middleware/auth';

const router = express.Router();

// All measurement routes require authentication
router.use(authenticate);

// Client-specific measurement routes
router.post('/:clientId', authorizeSelfOrAdmin('clientId'), measurementController.createMeasurement);
router.get('/:clientId', authorizeSelfOrAdmin('clientId'), measurementController.getClientMeasurements);
router.get('/:clientId/stats', authorizeSelfOrAdmin('clientId'), measurementController.getMeasurementStats);
router.get('/:clientId/trends', authorizeSelfOrAdmin('clientId'), measurementController.getMeasurementTrends);
router.get('/:clientId/latest', authorizeSelfOrAdmin('clientId'), measurementController.getLatestMeasurement);
router.get('/:clientId/body-composition', authorizeSelfOrAdmin('clientId'), measurementController.getBodyComposition);
router.get('/:clientId/dashboard', authorizeSelfOrAdmin('clientId'), measurementController.getDashboardMetrics);
router.get('/:clientId/compare', authorizeSelfOrAdmin('clientId'), measurementController.compareMeasurements);
router.post('/:clientId/bulk', authorizeSelfOrAdmin('clientId'), measurementController.bulkCreateMeasurements);
router.get('/:clientId/export', authorizeSelfOrAdmin('clientId'), measurementController.exportMeasurements);

// Specific measurement operations
router.get('/:clientId/:measurementId', authorizeSelfOrAdmin('clientId'), measurementController.getMeasurement);
router.put('/:clientId/:measurementId', authorizeSelfOrAdmin('clientId'), measurementController.updateMeasurement);
router.delete('/:clientId/:measurementId', authorizeSelfOrAdmin('clientId'), measurementController.deleteMeasurement);

export default router;