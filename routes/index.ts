// routes/index.ts
import express from 'express';
import authRoutes from './auth-routes';
import userRoutes from "./user-routes"
import clientRoutes from './client-routes';
import staffRoutes from './staff-routes';
import measurementRoutes from './measurements-routes';
import medicalRoutes from './medical-routes';
import nutritionRoutes from './nutrition-routes';
import adminRoutes from './dashboard-routes';
import streamRoutes from "./stream-routes"

const router = express.Router();

// Mount all route files
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/staff', staffRoutes);
router.use('/measurements', measurementRoutes);
router.use('/medical', medicalRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/users', userRoutes);
router.use('/stream', streamRoutes)

export default router;