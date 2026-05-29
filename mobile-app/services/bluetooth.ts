// ===========================================
// BLUETOOTH SERVICE - HealthGuard Mobile App
// ===========================================
// Sử dụng react-native-ble-plx để scan và kết nối thiết bị BLE
// Hỗ trợ: Mi Band, Galaxy Fit, Fitbit, Apple Watch, v.v.

import { BleManager, Device, BleError } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { decode as base64Decode } from 'base-64';

// Singleton BLE Manager
let bleManager: BleManager | null = null;
let connectedDeviceId: string | null = null;

const HEART_RATE_SERVICE_UUID = '180d';
const HEART_RATE_MEASUREMENT_CHAR_UUID = '2a37';
const CONNECTED_DEVICE_STORAGE_KEY = 'ble_connected_device_id';

export const getBleManager = (): BleManager => {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
};

// ===========================================
// TYPES
// ===========================================

export interface DiscoveredDevice {
  id: string;
  name: string;
  type: string;
  rssi: number;
  isConnectable: boolean;
}

export type BluetoothState = 'Unknown' | 'Resetting' | 'Unsupported' | 'Unauthorized' | 'PoweredOff' | 'PoweredOn';

// ===========================================
// PERMISSION FUNCTIONS
// ===========================================

/**
 * Yêu cầu quyền Bluetooth trên Android
 */
export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS tự động yêu cầu quyền khi cần
    return true;
  }

  if (Platform.OS === 'android') {
    const apiLevel = Platform.Version;

    if (apiLevel >= 31) {
      // Android 12+
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const allGranted = Object.values(results).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );

      return allGranted;
    } else {
      // Android 11 và thấp hơn
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  return false;
};

// ===========================================
// BLUETOOTH STATE
// ===========================================

/**
 * Lấy trạng thái Bluetooth hiện tại
 */
export const getBluetoothState = async (): Promise<BluetoothState> => {
  const manager = getBleManager();
  const state = await manager.state();
  return state as BluetoothState;
};

/**
 * Theo dõi thay đổi trạng thái Bluetooth
 */
export const onBluetoothStateChange = (
  callback: (state: BluetoothState) => void
): (() => void) => {
  const manager = getBleManager();
  const subscription = manager.onStateChange((state) => {
    callback(state as BluetoothState);
  }, true);

  return () => subscription.remove();
};

// ===========================================
// SCAN FUNCTIONS
// ===========================================

/**
 * Scan tìm thiết bị BLE
 * @param onDeviceFound Callback khi tìm thấy thiết bị
 * @param durationMs Thời gian scan (ms), mặc định 10 giây
 */
export const scanDevices = async (
  onDeviceFound: (device: DiscoveredDevice) => void,
  durationMs: number = 10000
): Promise<void> => {
  const manager = getBleManager();
  const foundDevices = new Set<string>();

  return new Promise((resolve, reject) => {
    // Set timeout để dừng scan
    const timeoutId = setTimeout(() => {
      manager.stopDeviceScan();
      resolve();
    }, durationMs);

    manager.startDeviceScan(
      null, // Scan tất cả services
      { allowDuplicates: false },
      (error: BleError | null, device: Device | null) => {
        if (error) {
          clearTimeout(timeoutId);
          manager.stopDeviceScan();
          reject(error);
          return;
        }

        if (device && !foundDevices.has(device.id)) {
          foundDevices.add(device.id);

          const displayName =
            device.name?.trim() ||
            device.localName?.trim() ||
            `BLE-${device.id.slice(-4)}`;

          // Xác định loại thiết bị dựa vào tên
          const deviceType = identifyDeviceType(device.name || device.localName || '');

          onDeviceFound({
            id: device.id,
            name: displayName,
            type: deviceType,
            rssi: device.rssi || -100,
            isConnectable: device.isConnectable ?? true,
          });
        }
      }
    );
  });
};

/**
 * Dừng scan
 */
export const stopScan = (): void => {
  const manager = getBleManager();
  manager.stopDeviceScan();
};

// ===========================================
// CONNECTION FUNCTIONS
// ===========================================

/**
 * Kết nối với thiết bị
 */
export const connectToDevice = async (deviceId: string): Promise<Device> => {
  const manager = getBleManager();
  
  const device = await manager.connectToDevice(deviceId, {
    timeout: 10000, // 10 giây timeout
  });

  // Discover services và characteristics
  await device.discoverAllServicesAndCharacteristics();
  connectedDeviceId = device.id;
  await persistConnectedDeviceId(device.id);

  //console.log(`✅ [BLE] Connected to ${device.name}`);
  return device;
};

/**
 * Ngắt kết nối thiết bị
 */
export const disconnectDevice = async (deviceId: string): Promise<void> => {
  const manager = getBleManager();
  await manager.cancelDeviceConnection(deviceId);
  if (connectedDeviceId === deviceId) {
    connectedDeviceId = null;
  }
  await clearPersistedConnectedDeviceId();
  //console.log(`✅ [BLE] Disconnected from ${deviceId}`);
};

/**
 * Kiểm tra thiết bị đã kết nối chưa
 */
export const isDeviceConnected = async (deviceId: string): Promise<boolean> => {
  const manager = getBleManager();
  return await manager.isDeviceConnected(deviceId);
};

/**
 * Lấy ID thiết bị BLE đang được app giữ kết nối gần nhất.
 */
export const getConnectedDeviceId = (): string | null => connectedDeviceId;

/**
 * Lấy deviceId BLE gần nhất đã kết nối từ bộ nhớ cục bộ.
 */
export const getLastConnectedDeviceId = async (): Promise<string | null> => {
  if (connectedDeviceId) {
    return connectedDeviceId;
  }

  try {
    const stored = await SecureStore.getItemAsync(CONNECTED_DEVICE_STORAGE_KEY);
    if (stored) {
      connectedDeviceId = stored;
    }
    return stored;
  } catch {
    return null;
  }
};

export interface HeartRateReading {
  bpm: number;
  timestamp: number;
  deviceId: string;
}

/**
 * Theo dõi dữ liệu nhịp tim realtime từ đặc tả BLE chuẩn (0x180D/0x2A37).
 * Trả về hàm unsubscribe để dừng stream.
 */
export const monitorHeartRate = async (
  deviceId: string,
  onReading: (reading: HeartRateReading) => void,
  onError?: (error: Error) => void
): Promise<() => void> => {
  const manager = getBleManager();

  const connected = await manager.isDeviceConnected(deviceId);
  let device: Device;

  if (connected) {
    const knownDevices = await manager.devices([deviceId]);
    device = knownDevices[0] || (await connectToDevice(deviceId));
  } else {
    device = await connectToDevice(deviceId);
  }

  await device.discoverAllServicesAndCharacteristics();

  const subscription = device.monitorCharacteristicForService(
    HEART_RATE_SERVICE_UUID,
    HEART_RATE_MEASUREMENT_CHAR_UUID,
    (bleError, characteristic) => {
      if (bleError) {
        onError?.(new Error(bleError.message));
        return;
      }

      const raw = characteristic?.value;
      if (!raw) {
        return;
      }

      const bpm = parseHeartRateMeasurement(raw);
      if (bpm === null) {
        return;
      }

      onReading({
        bpm,
        timestamp: Date.now(),
        deviceId,
      });
    }
  );

  connectedDeviceId = deviceId;
  await persistConnectedDeviceId(deviceId);

  return () => {
    subscription.remove();
  };
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Xác định loại thiết bị từ tên
 */
const identifyDeviceType = (name: string): string => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('mi band') || lowerName.includes('xiaomi')) {
    return 'Xiaomi';
  }
  if (lowerName.includes('galaxy') || lowerName.includes('samsung')) {
    return 'Samsung';
  }
  if (lowerName.includes('fitbit')) {
    return 'Fitbit';
  }
  if (lowerName.includes('apple') || lowerName.includes('watch')) {
    return 'Apple';
  }
  if (lowerName.includes('huawei') || lowerName.includes('honor')) {
    return 'Huawei';
  }
  if (lowerName.includes('garmin')) {
    return 'Garmin';
  }
  if (lowerName.includes('amazfit')) {
    return 'Amazfit';
  }
  if (lowerName.includes('sporty')) {
    return 'BEu';
  }

  return 'Unknown';
};

/**
 * Parse Heart Rate Measurement characteristic (0x2A37).
 * - Bit 0 của flags: 0 = uint8, 1 = uint16 cho trường nhịp tim.
 */
const parseHeartRateMeasurement = (base64Value: string): number | null => {
  const bytes = decodeBase64ToBytes(base64Value);
  if (bytes.length < 2) {
    return null;
  }

  const flags = bytes[0];
  const isUint16 = (flags & 0x01) === 0x01;

  if (isUint16) {
    if (bytes.length < 3) {
      return null;
    }
    return bytes[1] | (bytes[2] << 8);
  }

  return bytes[1];
};

const decodeBase64ToBytes = (base64Value: string): Uint8Array => {
  const chars = base64Decode(base64Value);
  const bytes = new Uint8Array(chars.length);

  for (let i = 0; i < chars.length; i += 1) {
    bytes[i] = chars.charCodeAt(i);
  }

  return bytes;
};

const persistConnectedDeviceId = async (deviceId: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(CONNECTED_DEVICE_STORAGE_KEY, deviceId);
  } catch {
    // Persistence thất bại không nên chặn luồng BLE chính.
  }
};

const clearPersistedConnectedDeviceId = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CONNECTED_DEVICE_STORAGE_KEY);
  } catch {
    // Ignore cleanup errors.
  }
};

/**
 * Đánh giá cường độ tín hiệu
 */
export const getSignalStrength = (rssi: number): {
  level: 1 | 2 | 3;
  text: string;
  color: string;
} => {
  if (rssi > -50) {
    return { level: 3, text: 'Mạnh', color: '#22C55E' };
  }
  if (rssi > -70) {
    return { level: 2, text: 'Trung bình', color: '#F59E0B' };
  }
  return { level: 1, text: 'Yếu', color: '#EF4444' };
};

// ===========================================
// CLEANUP
// ===========================================

/**
 * Hủy BLE Manager khi không dùng nữa
 */
export const destroyBleManager = (): void => {
  if (bleManager) {
    bleManager.destroy();
    bleManager = null;
    connectedDeviceId = null;
    void clearPersistedConnectedDeviceId();
  }
};
