// src/routes/index.js
import express from 'express';
import authRoutes from './auth.routes.js';
// import profileRoutes from './profile.routes.js';
// ... import các route khác

const router = express.Router();

router.use('/auth', authRoutes);
// router.use('/profile', profileRoutes);
// router.use('/relatives', relativeRoutes);
// // Lối đi riêng cho API nội bộ
// router.use('/internal/alerts', internalRoutes); 

export default router;