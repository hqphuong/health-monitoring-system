import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useHealthData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getHealthData();
      // Console ở đây để Duy thấy dữ liệu thực tế từ Server đổ về hook
      console.log("📥 [Hook] Data từ API:", Object.keys(response));
      setData(response);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("❌ [Hook] Lỗi fetch:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return { data, loading, error, refresh: fetchHealthData };
}