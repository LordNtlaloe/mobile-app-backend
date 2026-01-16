// routes/client-routes.ts
import express from 'express';
import * as clientController from '../controllers/client-controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All client routes require authentication
router.use(authenticate);

// Client profile management (only for clients)
router.post('/profile', authorize('CLIENT'), clientController.createClientProfile);
router.get('/profile', authorize('CLIENT'), clientController.getClientProfile);
router.put('/profile', authorize('CLIENT'), clientController.updateClientProfile);

// Client list for admin/trainer - Use spread syntax
router.get('/', authorize('ADMIN', 'TRAINER'), clientController.getAllClients);
router.get('/search', authorize('ADMIN', 'TRAINER'), clientController.searchClients);

export default router;