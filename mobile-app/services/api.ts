// ===========================================
// API SERVICE - HealthGuard Mobile App
// ===========================================

import { API_CONFIG, ENDPOINTS } from '../config/api';

// ===========================================
// TYPES
// ===========================================

export interface HealthDataResponse {
  heartRate: {
    current: number;
    min: number;
    max: number;
    avg: number;
    resting: number;
    lastMeasured: string;
    device: string;
    trend: 'up' | 'down' | 'stable';
  };
  sleep: {
    duration: number;
    quality: number;
    deepSleep: number;
    lightSleep: number;
    remSleep: number;
    awake: number;
    bedTime: string;
    wakeTime: string;
    device: string;
  };
  steps: {
    current: number;
    goal: number;
    distance: number;
    calories: number;
  };
  water: {
    current: number;
    goal: number;
  };
}

export interface ProfileResponse {
  profile_id: string;
  user_id: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  height: number | null;
  weight: number | null;
  gender: string | null;
  birth: string | null;
  blood_type?: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  updated_at: string;
}

export interface RelativeResponse {
  id?: string;
  phone_num: string;
  contact_name: string;
  relationship: string | null;
  user_id: string;
}

export interface RelativePayload {
  phone_num: string;
  contact_name: string;
  relationship?: string;
}

export interface DeviceResponse {
  device_id: string;
  provider: string;
  status: string | null;
  last_sync_time: string | null;
  user_id: string;
}

// Auth Types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    email: string;
    name?: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password?: string;
  full_name?: string;
}

export interface RegisterResponse {
  message: string;
  user_id?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  otp_sent?: boolean;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

// Health Metrics Types (Dashboard & Sync)
export interface MetricRecord {
  metric_id?: string;
  record_time: string;
  heart_rate?: number;
  steps?: number;
  sleep_duration?: number;
  calories?: number;
  distance?: number;
  oxygen_saturation?: number;
  stress_level?: number;
  device_id?: string;
}

export interface MetricsResponse {
  metrics: MetricRecord[];
  summary?: {
    avg_heart_rate: number;
    min_heart_rate: number;
    max_heart_rate: number;
    total_steps: number;
    total_calories: number;
    total_sleep: number;
  };
}

export interface MetricsSyncPayload {
  device_id?: string;
  metrics: MetricRecord[];
}

export interface MetricsSyncResponse {
  message: string;
  synced_count: number;
}

// Health Tips Types
export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon?: string;
}

export interface HealthTipCategory {
  id: string;
  name: string;
  description?: string;
}

export interface AlertLogResponse {
  alert_id: string;
  user_id: string;
  work_id: string | null;
  type: string;
  trigger_heart_rate: number;
  alert_time: string;
  is_sos_sent: boolean;
}

// Legacy Types
export interface HealthDataPayload {
  user_id: string;
  device_id: string;
  metrics: Array<{
    record_time: string;
    heart_rate?: number;
    steps?: number;
    sleep_duration?: number;
    stress_level?: number;
  }>;
}

export interface SyncResponse {
  message: string;
  synced_records: number;
}

// ===========================================
// TOKEN MANAGEMENT
// ===========================================
import { getToken, getUserData } from './auth';

// Cache token trong memory để dùng sync
let cachedToken: string | null = null;

/**
 * Load token từ secure storage vào cache
 * Gọi hàm này khi app khởi động
 */
export const initializeAuth = async (): Promise<boolean> => {
  cachedToken = await getToken();
  return cachedToken !== null;
};

/**
 * Set token vào cache (sau khi login)
 */
export const setAuthToken = (token: string | null) => {
  cachedToken = token;
};

/**
 * Lấy token từ cache
 */
export const getAuthToken = () => cachedToken;

// ===========================================
// FETCH WRAPPER
// ===========================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  // Thêm token nếu có
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (cachedToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${cachedToken}`;
  }

  try {
    console.log(`🌐 [API] ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ [API] Response:`, data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('⏱️ [API] Timeout - Server có thể đang khởi động...');
        throw new Error('Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.');
      }
      console.error(`❌ [API] Error:`, error.message);
    }
    throw error;
  }
}

// ===========================================
// API FUNCTIONS
// ===========================================

export const api = {
  // ==================
  // AUTH
  // ==================
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    fetchAPI<LoginResponse>(ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    fetchAPI<RegisterResponse>(ENDPOINTS.AUTH_REGISTER, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  forgotPassword: (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> =>
    fetchAPI<ForgotPasswordResponse>(ENDPOINTS.AUTH_FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> =>
    fetchAPI<ResetPasswordResponse>(ENDPOINTS.AUTH_RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  googleAuth: (idToken: string): Promise<LoginResponse> =>
    fetchAPI<LoginResponse>(ENDPOINTS.AUTH_GOOGLE, {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    }),

  // ==================
  // PROFILE
  // ==================
  getProfile: (): Promise<ProfileResponse> =>
    fetchAPI<ProfileResponse>(ENDPOINTS.PROFILE),

  updateProfile: (data: Partial<ProfileResponse>): Promise<ProfileResponse> =>
    fetchAPI<ProfileResponse>(ENDPOINTS.PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // ==================
  // HEALTH METRICS (Dashboard & Sync)
  // ==================

  /**
   * Lấy lịch sử dữ liệu sức khỏe cho Dashboard
   * @param params - startDate, endDate (optional)
   */
  getMetrics: (params?: { startDate?: string; endDate?: string }): Promise<MetricsResponse> => {
    let endpoint = ENDPOINTS.METRICS;
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('start_date', params.startDate);
      if (params.endDate) queryParams.append('end_date', params.endDate);
      if (queryParams.toString()) endpoint += `?${queryParams.toString()}`;
    }
    return fetchAPI<MetricsResponse>(endpoint);
  },

  /**
   * Đồng bộ dữ liệu sức khỏe từ thiết bị lên server (Bulk Insert)
   */
  syncMetrics: (payload: MetricsSyncPayload): Promise<MetricsSyncResponse> =>
    fetchAPI<MetricsSyncResponse>(ENDPOINTS.METRICS, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ==================
  // HEALTH DATA (Legacy - Fallback)
  // ==================
  getHealthData: async (): Promise<HealthDataResponse> => {
    try {
      // Thử dùng metrics API mới
      const metricsResponse = await api.getMetrics();

      if (metricsResponse.metrics && metricsResponse.metrics.length > 0) {
        const latestMetric = metricsResponse.metrics[0];
        const summary = metricsResponse.summary;

        return {
          heartRate: {
            current: latestMetric.heart_rate || 0,
            min: summary?.min_heart_rate || 0,
            max: summary?.max_heart_rate || 0,
            avg: summary?.avg_heart_rate || 0,
            resting: 0,
            lastMeasured: latestMetric.record_time || 'Chưa có dữ liệu',
            device: latestMetric.device_id || 'Chưa kết nối',
            trend: 'stable' as const,
          },
          sleep: {
            duration: summary?.total_sleep ? summary.total_sleep / 60 : 0,
            quality: 0,
            deepSleep: 0,
            lightSleep: 0,
            remSleep: 0,
            awake: 0,
            bedTime: '--:--',
            wakeTime: '--:--',
            device: 'Chưa kết nối',
          },
          steps: {
            current: summary?.total_steps || 0,
            goal: 10000,
            distance: 0,
            calories: summary?.total_calories || 0,
          },
          water: {
            current: 0,
            goal: 2500,
          },
        };
      }

      throw new Error('No metrics data');
    } catch {
      // Fallback: thử Legacy health-data API
      try {
        const userData = await getUserData();
        const userId = userData?.user_id || 'me';
        const legacyData = await fetchAPI<HealthDataResponse>(`/health-data/${userId}`);
        if (legacyData && legacyData.heartRate) {
          return legacyData;
        }
      } catch {
        console.log('ℹ️ [API] Legacy health-data cũng chưa có dữ liệu');
      }

      // Cuối cùng: trả default (tất cả = 0, không hardcode data giả)
      return {
        heartRate: {
          current: 0,
          min: 0,
          max: 0,
          avg: 0,
          resting: 0,
          lastMeasured: 'Chưa có dữ liệu',
          device: 'Chưa kết nối',
          trend: 'stable' as const,
        },
        sleep: {
          duration: 0,
          quality: 0,
          deepSleep: 0,
          lightSleep: 0,
          remSleep: 0,
          awake: 0,
          bedTime: '--:--',
          wakeTime: '--:--',
          device: 'Chưa kết nối',
        },
        steps: {
          current: 0,
          goal: 10000,
          distance: 0,
          calories: 0,
        },
        water: {
          current: 0,
          goal: 2500,
        },
      };
    }
  },

  // ==================
  // DEVICES
  // ==================
  getDevices: (): Promise<DeviceResponse[]> =>
    fetchAPI<DeviceResponse[]>(ENDPOINTS.DEVICES),

  addDevice: (data: { device_id: string; device_name?: string; provider: string }): Promise<DeviceResponse> =>
    fetchAPI<DeviceResponse>(ENDPOINTS.DEVICES, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteDevice: (deviceId: string): Promise<void> =>
    fetchAPI<void>(`${ENDPOINTS.DEVICES}/${deviceId}`, {
      method: 'DELETE',
    }),

  updateDeviceStatus: (deviceId: string, status: string): Promise<DeviceResponse> =>
    fetchAPI<DeviceResponse>(`${ENDPOINTS.DEVICES}/${deviceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ==================
  // RELATIVES (Liên hệ khẩn cấp)
  // ==================
  getRelatives: (): Promise<RelativeResponse[]> =>
    fetchAPI<RelativeResponse[]>(ENDPOINTS.RELATIVES),

  addRelative: (data: RelativePayload): Promise<RelativeResponse> =>
    fetchAPI<RelativeResponse>(ENDPOINTS.RELATIVES, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRelative: (id: string, data: Partial<RelativePayload>): Promise<RelativeResponse> =>
    fetchAPI<RelativeResponse>(`${ENDPOINTS.RELATIVES}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRelative: (id: string): Promise<void> =>
    fetchAPI<void>(`${ENDPOINTS.RELATIVES}/${id}`, {
      method: 'DELETE',
    }),

  // ==================
  // ALERTS (Lịch sử cảnh báo)
  // ==================
  getAlerts: (): Promise<{ status: string; message: string; data: AlertLogResponse[] }> =>
    fetchAPI<{ status: string; message: string; data: AlertLogResponse[] }>(ENDPOINTS.ALERTS),

  // ==================
  // HEALTH TIPS (Mẹo sức khỏe)
  // ==================
  getHealthTips: (category?: string): Promise<HealthTip[]> => {
    let endpoint = ENDPOINTS.HEALTH_TIPS;
    if (category) {
      endpoint += `?category=${encodeURIComponent(category)}`;
    }
    return fetchAPI<HealthTip[]>(endpoint);
  },

  getRandomHealthTip: (): Promise<HealthTip> =>
    fetchAPI<HealthTip>(ENDPOINTS.HEALTH_TIPS_RANDOM),

  getHealthTipCategories: (): Promise<string[]> =>
    fetchAPI<string[]>(ENDPOINTS.HEALTH_TIPS_CATEGORIES),
};

export default api;
