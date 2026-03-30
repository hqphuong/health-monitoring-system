import express from 'express';
import { syncHealthData } from '../controllers/metric.controller.js';
import { verifyToken, checkProfileComplete } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/sync', verifyToken, checkProfileComplete, syncHealthData);

export default router;