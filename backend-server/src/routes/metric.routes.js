import express from 'express';
import { syncHealthData, getHealthMetrics } from '../controllers/metric.controller.js';
import { verifyToken, checkProfileComplete } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, checkProfileComplete, syncHealthData);
router.get('/', verifyToken, checkProfileComplete, getHealthMetrics);

export default router;