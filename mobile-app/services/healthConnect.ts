// ===========================================
// HEALTH CONNECT SERVICE - HealthGuard Mobile App
// ===========================================
// Sử dụng react-native-health-connect để đọc dữ liệu từ Health Connect (Android)
// Health Connect là API của Android để truy cập dữ liệu sức khỏe từ các thiết bị/app
// 
// QUY TRÌNH:
// 1. Huawei Band → sync → Huawei Health app
// 2. Huawei Health → đẩy dữ liệu → Health Connect
// 3. App này → đọc từ Health Connect
// 4. App này → POST dữ liệu lên Server Render
// ===========================================

import { Platform } from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

// ===========================================
// TYPES
// ===========================================

export interface HealthConnectData {
  heartRate: {
    current: number;
    min: number;
    max: number;
    avg: number;
    samples: Array<{ time: string; bpm: number }>;
  };
  steps: {
    today: number;
    distance: number; // meters
    calories: number;
    history: Array<{ date: string; count: number }>;
  };
  sleep: {
    duration: number; // minutes
    startTime: string;
    endTime: string;
    stages: Array<{ stage: string; duration: number }>;
  };
  oxygen: {
    current: number;
    min: number;
    max: number;
  };
}

export type HealthConnectStatus = 
  | 'NOT_SUPPORTED'      // Không phải Android hoặc Android < 14
  | 'NOT_INSTALLED'      // Health Connect chưa cài
  | 'AVAILABLE'          // Sẵn sàng sử dụng
  | 'PERMISSION_DENIED'  // User từ chối quyền
  | 'ERROR';

// ===========================================
// PERMISSION TYPES
// ===========================================

const HEALTH_PERMISSIONS = [
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
] as any[];

// ===========================================
// INITIALIZATION
// ===========================================

let isInitialized = false;

/**
 * Kiểm tra và khởi tạo Health Connect
 */
export const initHealthConnect = async (): Promise<HealthConnectStatus> => {
  // Health Connect chỉ có trên Android
  if (Platform.OS !== 'android') {
    //console.log('ℹ️ [HealthConnect] Chỉ hỗ trợ Android');
    return 'NOT_SUPPORTED';
  }

  try {
    // Kiểm tra SDK status
    const status = await getSdkStatus();
    
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
      //console.log('⚠️ [HealthConnect] Health Connect không khả dụng trên thiết bị này');
      return 'NOT_SUPPORTED';
    }
    
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
      //console.log('⚠️ [HealthConnect] Cần cập nhật Health Connect app');
      return 'NOT_INSTALLED';
    }

    // Initialize
    const initialized = await initialize();
    if (!initialized) {
      //console.error('❌ [HealthConnect] Không thể khởi tạo');
      return 'ERROR';
    }

    isInitialized = true;
    //console.log('✅ [HealthConnect] Đã khởi tạo thành công');
    return 'AVAILABLE';
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi khởi tạo:', error);
    return 'ERROR';
  }
};

/**
 * Yêu cầu quyền truy cập Health Connect
 */
export const requestHealthPermissions = async (): Promise<boolean> => {
  if (!isInitialized) {
    const status = await initHealthConnect();
    if (status !== 'AVAILABLE') return false;
    // Chờ 500ms để Native Activity/Delegate thực sự sẵn sàng
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  try {
    const granted = await requestPermission(HEALTH_PERMISSIONS);
    //console.log('✅ [HealthConnect] Quyền được cấp:', granted);
    return granted.length > 0;
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi yêu cầu quyền:', error);
    return false;
  }
};

// ===========================================
// READ DATA FUNCTIONS
// ===========================================

/**
 * Đọc dữ liệu nhịp tim từ Health Connect
 * @param startDate Ngày bắt đầu
 * @param endDate Ngày kết thúc
 */
export const readHeartRateData = async (
  startDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h trước
  endDate: Date = new Date()
): Promise<HealthConnectData['heartRate'] | null> => {
  if (!isInitialized) {
    await initHealthConnect();
  }

  try {
    const result = await readRecords('HeartRate', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      //console.log('ℹ️ [HealthConnect] Không có dữ liệu nhịp tim');
      return null;
    }

    // Xử lý dữ liệu
    const samples: Array<{ time: string; bpm: number }> = [];
    let totalBpm = 0;
    let minBpm = Infinity;
    let maxBpm = 0;

    result.records.forEach((record: any) => {
      record.samples?.forEach((sample: any) => {
        const bpm = sample.beatsPerMinute;
        samples.push({
          time: sample.time,
          bpm: bpm,
        });
        totalBpm += bpm;
        minBpm = Math.min(minBpm, bpm);
        maxBpm = Math.max(maxBpm, bpm);
      });
    });

    const avgBpm = samples.length > 0 ? Math.round(totalBpm / samples.length) : 0;
    const currentBpm = samples.length > 0 ? samples[samples.length - 1].bpm : 0;

    return {
      current: currentBpm,
      min: minBpm === Infinity ? 0 : minBpm,
      max: maxBpm,
      avg: avgBpm,
      samples: samples.slice(-50), // Giữ 50 mẫu gần nhất
    };
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi đọc nhịp tim:', error);
    return null;
  }
};

/**
 * Đọc dữ liệu bước chân từ Health Connect
 */
export const readStepsData = async (
  startDate: Date = new Date(new Date().setHours(0, 0, 0, 0)), // Đầu ngày hôm nay
  endDate: Date = new Date()
): Promise<HealthConnectData['steps'] | null> => {
  if (!isInitialized) {
    await initHealthConnect();
  }

  try {
    // Đọc steps
    const stepsRecords = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    // Đọc distance
    const distanceRecords = await readRecords('Distance', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    // Đọc calories
    const caloriesRecords = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    // Tính tổng steps
    let totalSteps = 0;
    stepsRecords.records?.forEach((record: any) => {
      totalSteps += record.count || 0;
    });

    // Tính tổng distance (meters)
    let totalDistance = 0;
    distanceRecords.records?.forEach((record: any) => {
      totalDistance += record.distance?.inMeters || 0;
    });

    // Tính tổng calories
    let totalCalories = 0;
    caloriesRecords.records?.forEach((record: any) => {
      totalCalories += record.energy?.inKilocalories || 0;
    });

    return {
      today: totalSteps,
      distance: Math.round(totalDistance),
      calories: Math.round(totalCalories),
      history: [], // Có thể thêm logic lấy lịch sử 7 ngày
    };
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi đọc bước chân:', error);
    return null;
  }
};

/**
 * Đọc dữ liệu giấc ngủ từ Health Connect
 */
export const readSleepData = async (
  startDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<HealthConnectData['sleep'] | null> => {
  if (!isInitialized) {
    await initHealthConnect();
  }

  try {
    const result = await readRecords('SleepSession', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      //console.log('ℹ️ [HealthConnect] Không có dữ liệu giấc ngủ');
      return null;
    }

    // Lấy session gần nhất
    const latestSession = result.records[result.records.length - 1] as any;
    
    const startTime = new Date(latestSession.startTime);
    const endTime = new Date(latestSession.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    // Xử lý các giai đoạn giấc ngủ
    const stages: Array<{ stage: string; duration: number }> = [];
    latestSession.stages?.forEach((stage: any) => {
      stages.push({
        stage: stage.stage,
        duration: stage.endTime && stage.startTime 
          ? Math.round((new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) / (1000 * 60))
          : 0,
      });
    });

    return {
      duration: durationMinutes,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      stages,
    };
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi đọc giấc ngủ:', error);
    return null;
  }
};

/**
 * Đọc dữ liệu SpO2 từ Health Connect
 */
export const readOxygenData = async (
  startDate: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<HealthConnectData['oxygen'] | null> => {
  if (!isInitialized) {
    await initHealthConnect();
  }

  try {
    const result = await readRecords('OxygenSaturation', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    if (!result.records || result.records.length === 0) {
      return null;
    }

    let minOxygen = 100;
    let maxOxygen = 0;
    let currentOxygen = 0;

    result.records.forEach((record: any) => {
      const percentage = record.percentage || 0;
      minOxygen = Math.min(minOxygen, percentage);
      maxOxygen = Math.max(maxOxygen, percentage);
      currentOxygen = percentage; // Lấy giá trị cuối cùng
    });

    return {
      current: currentOxygen,
      min: minOxygen,
      max: maxOxygen,
    };
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi đọc SpO2:', error);
    return null;
  }
};

// ===========================================
// AGGREGATE FUNCTION
// ===========================================

/**
 * Đọc tất cả dữ liệu sức khỏe từ Health Connect
 */
export const readAllHealthData = async (): Promise<HealthConnectData | null> => {
  const status = await initHealthConnect();
  
  if (status !== 'AVAILABLE') {
    //console.log('⚠️ [HealthConnect] Không khả dụng:', status);
    return null;
  }

  const hasPermission = await requestHealthPermissions();
  if (!hasPermission) {
    //console.log('⚠️ [HealthConnect] Chưa có quyền truy cập');
    return null;
  }

  // Đọc song song tất cả dữ liệu
  const [heartRate, steps, sleep, oxygen] = await Promise.all([
    readHeartRateData(),
    readStepsData(),
    readSleepData(),
    readOxygenData(),
  ]);

  return {
    heartRate: heartRate || {
      current: 0,
      min: 0,
      max: 0,
      avg: 0,
      samples: [],
    },
    steps: steps || {
      today: 0,
      distance: 0,
      calories: 0,
      history: [],
    },
    sleep: sleep || {
      duration: 0,
      startTime: '',
      endTime: '',
      stages: [],
    },
    oxygen: oxygen || {
      current: 0,
      min: 0,
      max: 0,
    },
  };
};

// ===========================================
// SYNC TO SERVER
// ===========================================

/**
 * Đồng bộ dữ liệu từ Health Connect lên Server
 */
export const syncHealthDataToServer = async (
  apiSyncFunction: (data: HealthConnectData) => Promise<void>
): Promise<boolean> => {
  try {
    const data = await readAllHealthData();
    
    if (!data) {
      //console.log('⚠️ [HealthConnect] Không có dữ liệu để đồng bộ');
      return false;
    }

    await apiSyncFunction(data);
    //console.log('✅ [HealthConnect] Đã đồng bộ dữ liệu lên server');
    return true;
  } catch (error) {
    //console.error('❌ [HealthConnect] Lỗi đồng bộ:', error);
    return false;
  }
};
