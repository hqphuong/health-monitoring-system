/**
 * Health Tips Service
 * Xử lý business logic cho module mẹo sức khỏe.
 * Tách biệt data access (import từ data store) khỏi business logic (Yêu cầu 6.1).
 * Sau này có thể thay thế nguồn dữ liệu mà không thay đổi controller.
 */

import { healthTips, categoryNames } from "../data/health-tips.data.js";

/**
 * Lấy toàn bộ mẹo sức khỏe, hỗ trợ lọc theo danh mục.
 * @param {Object} options
 * @param {string} [options.category] - Danh mục cần lọc
 * @returns {Array<Object>} Danh sách tips đã lọc
 */
export function getAllTips(options = {}) {
  // Lọc theo category nếu có, nếu không trả bản sao toàn bộ mảng
  const { category } = options;
  if (category) {
    return healthTips.filter((tip) => tip.category === category);
  }
  return [...healthTips]; // Spread để tránh mutation mảng gốc
}

/**
 * Lấy mẹo sức khỏe ngẫu nhiên không trùng lặp.
 * @param {Object} options
 * @param {number} [options.count=1] - Số lượng tips ngẫu nhiên
 * @param {string} [options.category] - Danh mục cần lọc
 * @returns {Array<Object>} Danh sách tips ngẫu nhiên không trùng lặp
 */
export function getRandomTips(options = {}) {
  const { count = 1, category } = options;

  // Lọc theo category trước nếu có (Yêu cầu 3.3)
  let pool = category
    ? healthTips.filter((tip) => tip.category === category)
    : [...healthTips];

  // Nếu count > số tips có sẵn, trả về toàn bộ (Yêu cầu 2.3)
  const actualCount = Math.min(count, pool.length);
  const result = [];

  // Fisher-Yates selection: chọn ngẫu nhiên không trùng lặp bằng cách
  // lấy phần tử random rồi xóa khỏi pool
  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    result.push(pool[randomIndex]);
    pool.splice(randomIndex, 1);
  }

  return result;
}

/**
 * Trả về danh sách danh mục kèm tên tiếng Việt và số lượng tips.
 * @returns {Array<{key: string, name: string, count: number}>}
 */
export function getCategories() {
  // Duyệt qua categoryNames, đếm số tips trong mỗi danh mục (Yêu cầu 5.2)
  return Object.entries(categoryNames).map(([key, name]) => ({
    key,
    name,
    count: healthTips.filter((tip) => tip.category === key).length,
  }));
}

/**
 * Kiểm tra danh mục có hợp lệ hay không.
 * @param {string} category
 * @returns {boolean}
 */
export function isValidCategory(category) {
  // Kiểm tra key có tồn tại trong categoryNames (6 danh mục hợp lệ)
  return Object.hasOwn(categoryNames, category);
}
