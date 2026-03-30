/**
 * Health Tips Controller
 * Xử lý HTTP request/response cho các API mẹo sức khỏe.
 * Các endpoint đều công khai, không yêu cầu xác thực (Yêu cầu 7.2).
 * Response format nhất quán: { status: "success"|"error", data?, count?, message? }
 *
 * Endpoints:
 * - GET /api/v1/health-tips          — Lấy toàn bộ tips, hỗ trợ lọc theo category
 * - GET /api/v1/health-tips/random   — Lấy tips ngẫu nhiên, hỗ trợ count + category
 * - GET /api/v1/health-tips/categories — Lấy danh sách danh mục
 */

import {
  getAllTips,
  getRandomTips,
  getCategories,
  isValidCategory,
} from "../services/health-tips.service.js";

/**
 * GET /api/v1/health-tips
 * Lấy toàn bộ mẹo sức khỏe, hỗ trợ lọc theo danh mục.
 *
 * Query params:
 *   - category (string, tùy chọn): Lọc theo danh mục (sleep, heart, nutrition, exercise, stress, general)
 *
 * Response 200: { status: "success", count: number, data: HealthTip[] }
 * Response 400: { status: "error", message: string } — khi category không hợp lệ
 * Response 500: { status: "error", message: string } — lỗi server
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getAllHealthTips = async (req, res) => {
  try {
    const { category } = req.query;

    // Validate category nếu được truyền — trả 400 kèm danh sách danh mục hợp lệ (Yêu cầu 3.2)
    if (category && !isValidCategory(category)) {
      const validCategories = getCategories().map((c) => c.key);
      return res.status(400).json({
        status: "error",
        message: `Danh mục '${category}' không hợp lệ. Các danh mục hợp lệ: ${validCategories.join(", ")}`,
      });
    }

    // Lấy tips, lọc theo category nếu có (Yêu cầu 4.1, 4.2)
    const tips = getAllTips({ category });

    // Trả về kèm count (Yêu cầu 4.3)
    return res.status(200).json({
      status: "success",
      count: tips.length,
      data: tips,
    });
  } catch (error) {
    // Xử lý lỗi 500 nhất quán (Yêu cầu 7.1)
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * GET /api/v1/health-tips/random
 * Lấy mẹo sức khỏe ngẫu nhiên không trùng lặp.
 *
 * Query params:
 *   - count (integer, tùy chọn, mặc định 1): Số lượng tips ngẫu nhiên
 *   - category (string, tùy chọn): Lọc theo danh mục trước khi chọn ngẫu nhiên
 *
 * Response 200: { status: "success", data: HealthTip[] }
 * Response 400: { status: "error", message: string } — khi count/category không hợp lệ
 * Response 500: { status: "error", message: string } — lỗi server
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getRandomHealthTips = async (req, res) => {
  try {
    const { count, category } = req.query;

    // Validate count phải là số nguyên dương (Yêu cầu 2.4)
    if (count !== undefined) {
      const parsed = Number(count);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return res.status(400).json({
          status: "error",
          message: "Giá trị count phải là số nguyên dương",
        });
      }
    }

    // Validate category nếu được truyền (Yêu cầu 3.2)
    if (category && !isValidCategory(category)) {
      const validCategories = getCategories().map((c) => c.key);
      return res.status(400).json({
        status: "error",
        message: `Danh mục '${category}' không hợp lệ. Các danh mục hợp lệ: ${validCategories.join(", ")}`,
      });
    }

    // Lọc theo category trước, rồi chọn ngẫu nhiên (Yêu cầu 3.3)
    // Nếu count > số tips có sẵn, service trả về toàn bộ (Yêu cầu 2.3)
    const tips = getRandomTips({
      count: count ? Number(count) : 1,
      category,
    });

    return res.status(200).json({
      status: "success",
      data: tips,
    });
  } catch (error) {
    // Xử lý lỗi 500 nhất quán (Yêu cầu 7.1)
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * GET /api/v1/health-tips/categories
 * Lấy danh sách danh mục mẹo sức khỏe kèm tên tiếng Việt và số lượng.
 *
 * Response 200: { status: "success", data: Array<{key, name, count}> }
 * Response 500: { status: "error", message: string } — lỗi server
 *
 * @param {import('express').Request} _req - Không sử dụng (endpoint không có params)
 * @param {import('express').Response} res
 */
export const getHealthTipCategories = async (_req, res) => {
  try {
    // Trả về 6 danh mục kèm tên tiếng Việt và count (Yêu cầu 5.1, 5.2)
    const categories = getCategories();
    return res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    // Xử lý lỗi 500 nhất quán (Yêu cầu 7.1)
    return res.status(500).json({ status: "error", message: error.message });
  }
};
