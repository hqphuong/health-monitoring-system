import express from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import relativeRoutes from './relative.routes.js';
import deviceRoutes from './device.routes.js';
import healthTipsRoutes from './health-tips.routes.js'; // Module C: Mẹo sức khỏe (công khai, không cần auth)
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/relatives', relativeRoutes);
router.use('/devices', deviceRoutes);
router.use('/health-tips', healthTipsRoutes); // Module C: /api/v1/health-tips/*

// router.use('/internal/alerts', internalRoutes); 

export default router;