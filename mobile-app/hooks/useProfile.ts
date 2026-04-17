// ===========================================
// HOOK: useProfile - Quản lý thông tin người dùng
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { api, ProfileResponse } from '../services/api';
import { getUserData, UserData } from '../services/auth';

export interface UserProfile {
  // Auth data
  user_id: string;
  email: string;
  name: string;
  
  // Profile data
  height: number | null;
  weight: number | null;
  gender: string | null;
  birth: string | null;
  age: number | null;
  bloodPressure: {
    systolic: number | null;
    diastolic: number | null;
  };
  
  // Computed
  bmi: number | null;
  bmiStatus: {
    text: string;
    color: string;
  } | null;
}

const DEFAULT_PROFILE: UserProfile = {
  user_id: '',
  email: '',
  name: '',
  height: null,
  weight: null,
  gender: null,
  birth: null,
  age: null,
  bloodPressure: {
    systolic: null,
    diastolic: null,
  },
  bmi: null,
  bmiStatus: null,
};

interface UseProfileReturn {
  profile: UserProfile;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<ProfileResponse>) => Promise<boolean>;
}

// Tính BMI
const calculateBMI = (weight: number | null, height: number | null): number | null => {
  if (!weight || !height || height === 0) return null;
  return weight / Math.pow(height / 100, 2);
};

// Đánh giá BMI
const getBMIStatus = (bmi: number | null): { text: string; color: string } | null => {
  if (bmi === null) return null;
  if (bmi < 18.5) return { text: 'Thiếu cân', color: '#F59E0B' };
  if (bmi < 25) return { text: 'Bình thường', color: '#22C55E' };
  if (bmi < 30) return { text: 'Thừa cân', color: '#F59E0B' };
  return { text: 'Béo phì', color: '#EF4444' };
};

// Tính tuổi từ ngày sinh
const calculateAge = (birth: string | null): number | null => {
  if (!birth) return null;
  const birthDate = new Date(birth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Lấy auth data từ local storage
      const authData = await getUserData();
      
      // Lấy profile từ API
      let profileData: ProfileResponse | null = null;
      try {
        profileData = await api.getProfile();
      } catch (e) {
        //console.warn('⚠️ [useProfile] Không thể lấy profile từ API');
      }

      // Tính toán các giá trị
      const bmi = calculateBMI(profileData?.weight ?? null, profileData?.height ?? null);
      const age = calculateAge(profileData?.birth ?? null);

      setProfile({
        user_id: authData?.user_id || profileData?.user_id || '',
        email: authData?.email || '',
        name: authData?.name || authData?.email?.split('@')[0] || '',
        height: profileData?.height ?? null,
        weight: profileData?.weight ?? null,
        gender: profileData?.gender ?? null,
        birth: profileData?.birth ?? null,
        age: age,
        bloodPressure: {
          systolic: profileData?.systolic_bp ?? null,
          diastolic: profileData?.diastolic_bp ?? null,
        },
        bmi: bmi ? parseFloat(bmi.toFixed(1)) : null,
        bmiStatus: getBMIStatus(bmi),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      //console.error('❌ [useProfile] Lỗi:', message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<ProfileResponse>): Promise<boolean> => {
    try {
      await api.updateProfile(data);
      await fetchProfile(); // Refresh data
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
      return false;
    }
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
    updateProfile,
  };
}

export default useProfile;
