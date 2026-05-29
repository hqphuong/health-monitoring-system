// ===========================================
// HOOK: useHeartRateDetail - Chi tiết nhịp tim
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export type TimeRange = 'day' | 'week' | 'month';

interface HeartRateData {
  data: number[];
  labels: string[];
  current: number;
  min: number;
  max: number;
  avg: number;
  resting: number;
}

interface Measurement {
  time: string;
  value: number;
  activity: string;
  device: string;
}

interface HeartRateDetailData {
  day: HeartRateData;
  week: HeartRateData;
  month: HeartRateData;
  measurements: Measurement[];
}

// Default data khi chưa có API hoặc lỗi
const DEFAULT_DATA: HeartRateDetailData = {
  day: {
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    labels: ['6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '0h', '2h', '4h'],
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    resting: 0,
  },
  week: {
    data: [0, 0, 0, 0, 0, 0, 0],
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    resting: 0,
  },
  month: {
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    labels: ['1', '5', '10', '15', '20', '25', '30'],
    current: 0,
    min: 0,
    max: 0,
    avg: 0,
    resting: 0,
  },
  measurements: [],
};

export function useHeartRateDetail() {
  const [data, setData] = useState<HeartRateDetailData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gọi API lấy dữ liệu chi tiết nhịp tim
      // TODO: Khi BE bổ sung endpoint, thay thế mock data
      const response = await api.getHealthData();
      
      // Transform data từ API response
      if (response.heartRate) {
        setData(prev => ({
          ...prev,
          day: {
            ...prev.day,
            current: response.heartRate.current,
            min: response.heartRate.min,
            max: response.heartRate.max,
            avg: response.heartRate.avg,
            resting: response.heartRate.resting,
          },
          week: {
            ...prev.week,
            current: response.heartRate.current,
            min: response.heartRate.min,
            max: response.heartRate.max,
            avg: response.heartRate.avg,
            resting: response.heartRate.resting,
          },
          month: {
            ...prev.month,
            current: response.heartRate.current,
            min: response.heartRate.min,
            max: response.heartRate.max,
            avg: response.heartRate.avg,
            resting: response.heartRate.resting,
          },
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      //console.warn('⚠️ [useHeartRateDetail] Lỗi:', message);
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

export default useHeartRateDetail;
