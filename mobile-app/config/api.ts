// ===========================================
// CẤU HÌNH API - HealthGuard Mobile App
// ===========================================

// Base URL của API trên Render
export const API_CONFIG = {
  //BASE_URL: 'https://healthguard-api-42q2.onrender.com/api/v1',
  BASE_URL: 'http://192.168.31.188:3000/api/v1',
  TIMEOUT: 60000,
};

// Các endpoints (theo Swagger documentation)
export const ENDPOINTS = {
  // Auth - Xác thực người dùng
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/registerUser',
  AUTH_GOOGLE: '/auth/google',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Profile - Hồ sơ sức khỏe
  PROFILE: '/profile',

  // Devices - Thiết bị
  DEVICES: '/devices',

  // Relatives - Người thân khẩn cấp
  RELATIVES: '/relatives',

  // Health Metrics - Dữ liệu sức khỏe (Dashboard & Sync)
  METRICS: '/metrics',

  // Alerts - Nhật ký cảnh báo
  ALERTS: '/alerts',

  // Health Tips - Mẹo sức khỏe
  HEALTH_TIPS: '/health-tips',
  HEALTH_TIPS_RANDOM: '/health-tips/random',
  HEALTH_TIPS_CATEGORIES: '/health-tips/categories',
};
