import { healthTips, categoryNames } from "../data/health-tips.data.js";

/**
 * Lấy toàn bộ mẹo sức khỏe, hỗ trợ lọc theo danh mục.
 * @param {Object} options
 * @param {string} [options.category] - Danh mục cần lọc
 * @returns {Array<Object>} Danh sách tips đã lọc
 */
export function getAllTips(options = {}) {
  const { category } = options;
  if (category) {
    return healthTips.filter((tip) => tip.category === category);
  }
  return [...healthTips];
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
  let pool = category
    ? healthTips.filter((tip) => tip.category === category)
    : [...healthTips];

  const actualCount = Math.min(count, pool.length);
  const result = [];

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
  return Object.hasOwn(categoryNames, category);
}
