// routes/user-management-routes.ts
import express from 'express';
import * as userController from '../controllers/user-controller';

const router = express.Router();

// User management routes
router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/revoke-tokens', userController.revokeUserRefreshTokens);

export default router;