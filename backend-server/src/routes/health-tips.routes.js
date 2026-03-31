/**
 * Health Tips Routes
 * Định nghĩa các route công khai cho module mẹo sức khỏe.
 * Không sử dụng middleware verifyToken vì đây là thông tin công khai (Yêu cầu 7.2).
 *
 * Routes:
 *   GET /                → getAllHealthTips     — Lấy toàn bộ tips, hỗ trợ ?category=
 *   GET /random          → getRandomHealthTips  — Lấy tips ngẫu nhiên, hỗ trợ ?count=&category=
 *   GET /categories      → getHealthTipCategories — Lấy danh sách 6 danh mục
 *
 * Base path: /api/v1/health-tips (đăng ký trong routes/index.js)
 */

import express from 'express';
import {
  getAllHealthTips,
  getRandomHealthTips,
  getHealthTipCategories,
} from '../controllers/health-tips.controller.js';

const router = express.Router();

// GET /api/v1/health-tips — Lấy toàn bộ mẹo sức khỏe (Yêu cầu 4)
router.get('/', getAllHealthTips);

// GET /api/v1/health-tips/random — Lấy mẹo ngẫu nhiên (Yêu cầu 2, 3)
router.get('/random', getRandomHealthTips);

// GET /api/v1/health-tips/categories — Lấy danh sách danh mục (Yêu cầu 5)
router.get('/categories', getHealthTipCategories);

export default router;
