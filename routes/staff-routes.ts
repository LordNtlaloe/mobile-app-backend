// routes/staff-routes.ts
import express from 'express';
import * as staffController from '../controllers/staff-controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All staff routes require authentication
router.use(authenticate);

// Staff management (admin only)
router.post('/', authorize('ADMIN'), staffController.createStaff);
router.get('/', authorize('ADMIN', 'TRAINER'), staffController.getAllStaff);
router.get('/:id', authorize('ADMIN', 'TRAINER'), staffController.getStaff);
router.put('/:id', authorize('ADMIN'), staffController.updateStaff);
router.put('/:id/deactivate', authorize('ADMIN'), staffController.deactivateStaff);

// Staff-specific endpoints
router.get('/:id/clients', authorize('ADMIN', 'TRAINER'), staffController.getStaffClients);

export default router;