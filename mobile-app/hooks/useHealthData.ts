import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useHealthData(range: string = 'day') {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ SỬA: Gọi hàm getMetrics và truyền { range } vào
      // range sẽ là 'day', 'week', hoặc 'month'
      const response = await api.getMetrics({ range });
      
      //console.log(`📥 [Hook] Đã tải dữ liệu cho Tab: ${range.toUpperCase()}`);
      //console.log("- Status:", response.status);
      //console.log("- Records thô:", response.raw_data?.length || 0);
      //console.log("- Bản ghi summary:", response.daily_summary?.length || 0);
      
      setData(response);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      //console.error("❌ [Hook] Lỗi fetch:", err.message);
    } finally {
      setLoading(false);
    }
  }, [range]); // ✅ QUAN TRỌNG: Thêm range vào đây để hàm cập nhật khi Duy đổi tab

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return { data, loading, error, refresh: fetchHealthData };
}