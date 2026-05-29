// ===========================================
// HOOK: useSleepDetail - Chi tiết giấc ngủ
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export type TimeRange = 'day' | 'week' | 'month';

interface SleepStage {
  start: string;
  end: string;
  type: 'deep' | 'light' | 'rem' | 'awake';
}

interface DaySleepData {
  duration: number;
  quality: number;
  deepSleep: number;
  lightSleep: number;
  remSleep: number;
  awake: number;
  bedTime: string;
  wakeTime: string;
  stages: SleepStage[];
}

interface PeriodSleepData {
  data: number[];
  labels: string[];
  avgDuration: number;
  avgQuality: number;
  avgDeep: number;
  avgLight: number;
  avgRem: number;
}

interface SleepDetailData {
  day: DaySleepData;
  week: PeriodSleepData;
  month: PeriodSleepData;
}

// Default data khi chưa có API hoặc lỗi
const DEFAULT_DATA: SleepDetailData = {
  day: {
    duration: 0,
    quality: 0,
    deepSleep: 0,
    lightSleep: 0,
    remSleep: 0,
    awake: 0,
    bedTime: '--:--',
    wakeTime: '--:--',
    stages: [],
  },
  week: {
    data: [0, 0, 0, 0, 0, 0, 0],
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    avgDuration: 0,
    avgQuality: 0,
    avgDeep: 0,
    avgLight: 0,
    avgRem: 0,
  },
  month: {
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    labels: ['1', '5', '10', '15', '20', '25', '30'],
    avgDuration: 0,
    avgQuality: 0,
    avgDeep: 0,
    avgLight: 0,
    avgRem: 0,
  },
};

export function useSleepDetail() {
  const [data, setData] = useState<SleepDetailData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gọi API lấy dữ liệu chi tiết giấc ngủ
      // TODO: Khi BE bổ sung endpoint chi tiết, thay thế mock data
      const response = await api.getHealthData();
      
      // Transform data từ API response
      if (response.sleep) {
        setData(prev => ({
          ...prev,
          day: {
            ...prev.day,
            duration: response.sleep.duration,
            quality: response.sleep.quality,
            deepSleep: response.sleep.deepSleep,
            lightSleep: response.sleep.lightSleep,
            remSleep: response.sleep.remSleep,
            awake: response.sleep.awake,
            bedTime: response.sleep.bedTime,
            wakeTime: response.sleep.wakeTime,
          },
          week: {
            ...prev.week,
            avgDuration: response.sleep.duration,
            avgQuality: response.sleep.quality,
            avgDeep: response.sleep.deepSleep,
            avgLight: response.sleep.lightSleep,
            avgRem: response.sleep.remSleep,
          },
          month: {
            ...prev.month,
            avgDuration: response.sleep.duration,
            avgQuality: response.sleep.quality,
            avgDeep: response.sleep.deepSleep,
            avgLight: response.sleep.lightSleep,
            avgRem: response.sleep.remSleep,
          },
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      //console.warn('⚠️ [useSleepDetail] Lỗi:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
}

export default useSleepDetail;
