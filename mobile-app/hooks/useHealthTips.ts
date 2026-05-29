// ===========================================
// HOOK: useHealthTips - Lấy mẹo sức khỏe từ API
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { api, HealthTip } from '../services/api';

interface UseHealthTipsReturn {
  // Data
  tips: HealthTip[];
  randomTip: HealthTip | null;
  categories: string[];
  
  // Status
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTips: (category?: string) => Promise<void>;
  fetchRandomTip: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useHealthTips(): UseHealthTipsReturn {
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [randomTip, setRandomTip] = useState<HealthTip | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getHealthTipCategories();
      setCategories(data);
    } catch (err) {
      //console.warn('Không thể lấy danh sách categories:', err);
    }
  }, []);

  // Lấy danh sách tips
  const fetchTips = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getHealthTips(category);
      setTips(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lấy mẹo sức khỏe';
      setError(message);
      //console.error('❌ [useHealthTips] Lỗi:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy tip ngẫu nhiên
  const fetchRandomTip = useCallback(async () => {
    try {
      const tip = await api.getRandomHealthTip();
      setRandomTip(tip);
    } catch (err) {
      //console.warn('Không thể lấy tip ngẫu nhiên:', err);
    }
  }, []);

  // Refresh tất cả
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchTips(),
      fetchRandomTip(),
      fetchCategories(),
    ]);
  }, [fetchTips, fetchRandomTip, fetchCategories]);

  // Auto-fetch khi mount
  useEffect(() => {
    fetchRandomTip();
    fetchCategories();
  }, [fetchRandomTip, fetchCategories]);

  return {
    tips,
    randomTip,
    categories,
    loading,
    error,
    fetchTips,
    fetchRandomTip,
    refresh,
  };
}

export default useHealthTips;
