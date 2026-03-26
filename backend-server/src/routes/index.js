import express from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
// router.use('/relatives', relativeRoutes);
// router.use('/devices', deviceRoutes);

// router.use('/internal/alerts', internalRoutes); 

export default router;