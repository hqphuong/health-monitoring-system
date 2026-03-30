import express from 'express';
import {
  getAllHealthTips,
  getRandomHealthTips,
  getHealthTipCategories,
} from '../controllers/health-tips.controller.js';

const router = express.Router();

router.get('/', getAllHealthTips);
router.get('/random', getRandomHealthTips);
router.get('/categories', getHealthTipCategories);

export default router;
