// ===========================================
// DEVICE STORAGE SERVICE
// ===========================================
// Lưu trữ thông tin thiết bị locally vì backend không hỗ trợ device_name

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_NAMES_KEY = 'healthguard_device_names';

// Cache trong memory
let deviceNamesCache: Record<string, string> = {};

/**
 * Lưu tên thiết bị theo device_id
 */
export const saveDeviceName = async (deviceId: string, deviceName: string): Promise<void> => {
  try {
    // Cập nhật cache
    deviceNamesCache[deviceId] = deviceName;
    
    // Lưu vào storage
    const jsonData = JSON.stringify(deviceNamesCache);
    if (Platform.OS === 'web') {
      localStorage.setItem(DEVICE_NAMES_KEY, jsonData);
    } else {
      await SecureStore.setItemAsync(DEVICE_NAMES_KEY, jsonData);
    }
    //console.log(`✅ [DeviceStorage] Đã lưu tên thiết bị: ${deviceId} -> ${deviceName}`);
  } catch (error) {
    //console.error('❌ [DeviceStorage] Lỗi lưu tên thiết bị:', error);
  }
};

/**
 * Lấy tên thiết bị theo device_id
 */
export const getDeviceName = async (deviceId: string): Promise<string | null> => {
  // Kiểm tra cache trước
  if (deviceNamesCache[deviceId]) {
    return deviceNamesCache[deviceId];
  }
  
  try {
    let jsonData: string | null = null;
    if (Platform.OS === 'web') {
      jsonData = localStorage.getItem(DEVICE_NAMES_KEY);
    } else {
      jsonData = await SecureStore.getItemAsync(DEVICE_NAMES_KEY);
    }
    
    if (jsonData) {
      deviceNamesCache = JSON.parse(jsonData);
      return deviceNamesCache[deviceId] || null;
    }
  } catch (error) {
    //console.error('❌ [DeviceStorage] Lỗi đọc tên thiết bị:', error);
  }
  
  return null;
};

/**
 * Lấy tất cả tên thiết bị đã lưu
 */
export const getAllDeviceNames = async (): Promise<Record<string, string>> => {
  try {
    let jsonData: string | null = null;
    if (Platform.OS === 'web') {
      jsonData = localStorage.getItem(DEVICE_NAMES_KEY);
    } else {
      jsonData = await SecureStore.getItemAsync(DEVICE_NAMES_KEY);
    }
    
    if (jsonData) {
      deviceNamesCache = JSON.parse(jsonData);
      return deviceNamesCache;
    }
  } catch (error) {
    //console.error('❌ [DeviceStorage] Lỗi đọc danh sách thiết bị:', error);
  }
  
  return {};
};

/**
 * Xóa tên thiết bị
 */
export const removeDeviceName = async (deviceId: string): Promise<void> => {
  try {
    delete deviceNamesCache[deviceId];
    
    const jsonData = JSON.stringify(deviceNamesCache);
    if (Platform.OS === 'web') {
      localStorage.setItem(DEVICE_NAMES_KEY, jsonData);
    } else {
      await SecureStore.setItemAsync(DEVICE_NAMES_KEY, jsonData);
    }
    //console.log(`✅ [DeviceStorage] Đã xóa tên thiết bị: ${deviceId}`);
  } catch (error) {
    //console.error('❌ [DeviceStorage] Lỗi xóa tên thiết bị:', error);
  }
};
