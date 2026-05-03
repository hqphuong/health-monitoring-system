import express from 'express';
import { getAlerts } from '../controllers/alert.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getAlerts);

export default router;
