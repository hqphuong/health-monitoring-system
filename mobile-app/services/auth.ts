// ===========================================
// AUTH SERVICE - Token Management
// ===========================================
// Sử dụng expo-secure-store để lưu trữ token an toàn
// Token được mã hóa và lưu trong Keychain (iOS) / Keystore (Android)

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'healthguard_auth_token';
const USER_KEY = 'healthguard_user_data';

// Cache token trong memory để tránh đọc từ storage mỗi request
let cachedToken: string | null = null;

// ===========================================
// TOKEN FUNCTIONS
// ===========================================

/**
 * Lưu token vào secure storage
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('[Auth] Invalid token: expected non-empty string');
    }

    if (Platform.OS === 'web') {
      // Web không hỗ trợ SecureStore, dùng localStorage
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    cachedToken = token;
    //console.log('✅ [Auth] Token saved successfully');
  } catch (error) {
    //console.error('❌ [Auth] Failed to save token:', error);
    throw error;
  }
};

/**
 * Lấy token từ secure storage
 */
export const getToken = async (): Promise<string | null> => {
  // Trả về cache nếu có
  if (cachedToken) {
    return cachedToken;
  }

  try {
    let token: string | null = null;
    
    if (Platform.OS === 'web') {
      token = localStorage.getItem(TOKEN_KEY);
    } else {
      token = await SecureStore.getItemAsync(TOKEN_KEY);
    }
    
    cachedToken = token;
    return token;
  } catch (error) {
    //console.error('❌ [Auth] Failed to get token:', error);
    return null;
  }
};

/**
 * Xóa token (logout)
 */
export const removeToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
    cachedToken = null;
    //console.log('✅ [Auth] Token removed (logged out)');
  } catch (error) {
    //console.error('❌ [Auth] Failed to remove token:', error);
    throw error;
  }
};

/**
 * Kiểm tra đã đăng nhập chưa
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};

// ===========================================
// USER DATA FUNCTIONS
// ===========================================

export interface UserData {
  user_id: string;
  email: string;
  name?: string;
}

/**
 * Lưu thông tin user
 */
export const saveUserData = async (userData: UserData): Promise<void> => {
  try {
    const jsonData = JSON.stringify(userData);
    
    if (Platform.OS === 'web') {
      localStorage.setItem(USER_KEY, jsonData);
    } else {
      await SecureStore.setItemAsync(USER_KEY, jsonData);
    }
    //console.log('✅ [Auth] User data saved');
  } catch (error) {
    //console.error('❌ [Auth] Failed to save user data:', error);
    throw error;
  }
};

/**
 * Lấy thông tin user
 */
export const getUserData = async (): Promise<UserData | null> => {
  try {
    let jsonData: string | null = null;
    
    if (Platform.OS === 'web') {
      jsonData = localStorage.getItem(USER_KEY);
    } else {
      jsonData = await SecureStore.getItemAsync(USER_KEY);
    }
    
    if (jsonData) {
      return JSON.parse(jsonData) as UserData;
    }
    return null;
  } catch (error) {
    //console.error('❌ [Auth] Failed to get user data:', error);
    return null;
  }
};

// ===========================================
// COMBINED FUNCTIONS
// ===========================================

/**
 * Đăng nhập - lưu cả token và user data
 */
export const loginSuccess = async (token: string, user: UserData): Promise<void> => {
  await saveToken(token);
  await saveUserData(user);
};

/**
 * Đăng xuất - xóa tất cả
 */
export const logout = async (): Promise<void> => {
  await removeToken();
};
