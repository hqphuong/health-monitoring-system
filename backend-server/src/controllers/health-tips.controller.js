import {
  getAllTips,
  getRandomTips,
  getCategories,
  isValidCategory,
} from "../services/health-tips.service.js";

/**
 * GET /api/v1/health-tips
 * Lấy toàn bộ mẹo sức khỏe, hỗ trợ lọc theo danh mục.
 */
export const getAllHealthTips = async (req, res) => {
  try {
    const { category } = req.query;

    if (category && !isValidCategory(category)) {
      const validCategories = getCategories().map((c) => c.key);
      return res.status(400).json({
        status: "error",
        message: `Danh mục '${category}' không hợp lệ. Các danh mục hợp lệ: ${validCategories.join(", ")}`,
      });
    }

    const tips = getAllTips({ category });
    return res.status(200).json({
      status: "success",
      count: tips.length,
      data: tips,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * GET /api/v1/health-tips/random
 * Lấy mẹo sức khỏe ngẫu nhiên, hỗ trợ count và category.
 */
export const getRandomHealthTips = async (req, res) => {
  try {
    const { count, category } = req.query;

    if (count !== undefined) {
      const parsed = Number(count);
      if (!Number.isInteger(parsed) || parsed < 1) {
        return res.status(400).json({
          status: "error",
          message: "Giá trị count phải là số nguyên dương",
        });
      }
    }

    if (category && !isValidCategory(category)) {
      const validCategories = getCategories().map((c) => c.key);
      return res.status(400).json({
        status: "error",
        message: `Danh mục '${category}' không hợp lệ. Các danh mục hợp lệ: ${validCategories.join(", ")}`,
      });
    }

    const tips = getRandomTips({
      count: count ? Number(count) : 1,
      category,
    });

    return res.status(200).json({
      status: "success",
      data: tips,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * GET /api/v1/health-tips/categories
 * Lấy danh sách danh mục mẹo sức khỏe.
 */
export const getHealthTipCategories = async (req, res) => {
  try {
    const categories = getCategories();
    return res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
