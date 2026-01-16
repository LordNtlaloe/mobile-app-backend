// routes/auth-routes.ts
import express from 'express';
import * as authController from '../controllers/auth-controller';

const router = express.Router();

router.post('/register', authController.register);
router.post('/verify', authController.verify);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshAccessToken); // ✅ Match frontend
router.post('/reset-password', authController.requestPasswordReset);
router.post('/reset-password/confirm', authController.resetPassword);
router.get('/validate', authController.validateToken);

export default router;