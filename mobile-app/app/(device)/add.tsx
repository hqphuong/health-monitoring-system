import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { api } from '../../services/api';
import { saveDeviceName } from '../../services/deviceStorage';
import {
  requestBluetoothPermissions,
  getBluetoothState,
  scanDevices,
  stopScan,
  connectToDevice,
  getSignalStrength,
} from '../../services/bluetooth';

type ScanState = 'idle' | 'checking_bluetooth' | 'scanning' | 'found' | 'connecting' | 'connected' | 'error';

type DiscoveredDevice = {
  id: string;
  name: string;
  type: string;
  rssi: number;
  icon: keyof typeof Ionicons.glyphMap;
};

// Map device type to icon
const getDeviceIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type.toLowerCase()) {
    case 'xiaomi':
    case 'amazfit':
      return 'watch';
    case 'samsung':
    case 'fitbit':
      return 'fitness';
    case 'apple':
      return 'logo-apple';
    case 'garmin':
      return 'speedometer';
    default:
      return 'bluetooth';
  }
};

export default function AddDeviceScreen() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  // Pulse animation for scanning
  useEffect(() => {
    if (scanState === 'scanning') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [scanState, pulseAnim]);

  // Rotate animation for connecting
  useEffect(() => {
    if (scanState === 'connecting') {
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotate.start();
      return () => rotate.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [scanState, rotateAnim]);

  const startScan = async () => {
    setScanState('checking_bluetooth');

    try {
      const granted = await requestBluetoothPermissions();
      if (!granted) {
        setScanState('error');
        Alert.alert('Thiếu quyền Bluetooth', 'Vui lòng cấp quyền Bluetooth để quét thiết bị.');
        return;
      }

      const state = await getBluetoothState();
      const poweredOn = state === 'PoweredOn';

      if (!poweredOn) {
        setScanState('idle');
        Alert.alert(
          'Bluetooth đang tắt',
          'Vui lòng bật Bluetooth trong cài đặt thiết bị rồi thử lại.'
        );
        return;
      }

      stopScan();
      setScanState('scanning');
      setSelectedDevice(null);
      setDiscoveredDevices([]);

      await scanDevices(
        (device) => {
          const mappedDevice: DiscoveredDevice = {
            id: device.id,
            name: device.name,
            type: device.type,
            rssi: device.rssi,
            icon: getDeviceIcon(device.type),
          };

          setDiscoveredDevices((prev) => {
            const alreadyExists = prev.some((d) => d.id === mappedDevice.id);
            if (alreadyExists) {
              return prev.map((d) => (d.id === mappedDevice.id ? mappedDevice : d));
            }

            return [...prev, mappedDevice].sort((a, b) => b.rssi - a.rssi);
          });
        },
        10000
      );

      setScanState('found');
    } catch (error) {
      setScanState('error');
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      Alert.alert('Quét thiết bị thất bại', message);
    }
  };

  const handleSelectDevice = (device: DiscoveredDevice) => {
    setSelectedDevice(device);
  };

  const handleConnect = async () => {
    if (!selectedDevice) return;

    setScanState('connecting');
    
    try {
      await connectToDevice(selectedDevice.id);

      // Lưu tên thiết bị locally (vì backend không hỗ trợ device_name)
      await saveDeviceName(selectedDevice.id, selectedDevice.name);

      // Gọi API để đăng ký thiết bị lên server
      await api.addDevice({
        device_id: selectedDevice.id,
        device_name: selectedDevice.name,
        provider: selectedDevice.type,
      });
      
      setScanState('connected');
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      setScanState('error');
      const message = error instanceof Error ? error.message : 'Lỗi không xác định';
      Alert.alert(
        'Kết nối thất bại',
        `Không thể kết nối với thiết bị: ${message}`,
        [
          { text: 'Hủy', style: 'cancel', onPress: () => setScanState('found') },
          { text: 'Thử lại', onPress: handleConnect },
        ]
      );
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderDeviceItem = ({ item }: { item: DiscoveredDevice }) => {
    const signal = getSignalStrength(item.rssi);
    const isSelected = selectedDevice?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.deviceItem, isSelected && styles.deviceItemSelected]}
        onPress={() => handleSelectDevice(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.deviceItemIcon, isSelected && styles.deviceItemIconSelected]}>
          <Ionicons
            name={item.icon}
            size={24}
            color={isSelected ? Colors.neutral.white : Colors.primary.main}
          />
        </View>
        <View style={styles.deviceItemInfo}>
          <Text style={styles.deviceItemName}>{item.name}</Text>
          <Text style={styles.deviceItemType}>{item.type}</Text>
        </View>
        <View style={styles.signalContainer}>
          <View style={styles.signalBars}>
            {[1, 2, 3].map((level) => (
              <View
                key={level}
                style={[
                  styles.signalBar,
                  { height: 6 + level * 4 },
                  level <= signal.level && { backgroundColor: signal.color },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.signalText, { color: signal.color }]}>{signal.text}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary.main} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm thiết bị</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Scanning Animation */}
        {(scanState === 'idle' || scanState === 'checking_bluetooth' || scanState === 'scanning') && (
          <View style={styles.scanningContainer}>
            <View style={styles.radarContainer}>
              <Animated.View
                style={[
                  styles.radarPulse,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.5],
                      outputRange: [0.6, 0],
                    }),
                  },
                ]}
              />
              <View style={styles.radarCenter}>
                <Ionicons
                  name="bluetooth"
                  size={40}
                  color={scanState === 'scanning' ? Colors.primary.main : Colors.neutral.placeholder}
                />
              </View>
            </View>

            <Text style={styles.scanningTitle}>
              {scanState === 'idle' && 'Sẵn sàng tìm kiếm'}
              {scanState === 'checking_bluetooth' && 'Đang kiểm tra Bluetooth...'}
              {scanState === 'scanning' && 'Đang tìm thiết bị...'}
            </Text>
            <Text style={styles.scanningSubtitle}>
              {scanState === 'idle' && 'Nhấn nút bên dưới để bắt đầu tìm kiếm thiết bị gần bạn'}
              {scanState === 'scanning' && 'Đảm bảo thiết bị của bạn đang bật và ở gần'}
            </Text>

            {scanState === 'idle' && (
              <Button
                title="Bắt đầu tìm kiếm"
                onPress={startScan}
                size="lg"
                style={styles.scanButton}
                leftIcon={<Ionicons name="search" size={20} color={Colors.neutral.white} />}
              />
            )}
          </View>
        )}

        {/* Connecting State */}
        {scanState === 'connecting' && (
          <View style={styles.connectingContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="sync" size={48} color={Colors.primary.main} />
            </Animated.View>
            <Text style={styles.connectingTitle}>Đang kết nối...</Text>
            <Text style={styles.connectingSubtitle}>
              Kết nối với {selectedDevice?.name}
            </Text>
          </View>
        )}

        {/* Connected State */}
        {scanState === 'connected' && (
          <View style={styles.connectedContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.status.success} />
            </View>
            <Text style={styles.connectedTitle}>Kết nối thành công!</Text>
            <Text style={styles.connectedSubtitle}>
              {selectedDevice?.name} đã được thêm vào danh sách thiết bị
            </Text>
          </View>
        )}

        {/* Found Devices List */}
        {(scanState === 'found' || scanState === 'scanning') && discoveredDevices.length > 0 && (
          <View style={styles.foundContainer}>
            <Text style={styles.foundTitle}>
              Tìm thấy {discoveredDevices.length} thiết bị
            </Text>

            <FlatList
              data={discoveredDevices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              style={styles.deviceList}
              contentContainerStyle={styles.deviceListContent}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.foundActions}>
              <Button
                title="Tìm lại"
                variant="outline"
                onPress={startScan}
                style={styles.rescanButton}
              />
              <Button
                title="Kết nối"
                onPress={handleConnect}
                disabled={!selectedDevice}
                style={styles.connectButton}
              />
            </View>
          </View>
        )}

        {/* No Devices Found */}
        {scanState === 'found' && discoveredDevices.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bluetooth-outline" size={64} color={Colors.neutral.placeholder} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy thiết bị</Text>
            <Text style={styles.emptySubtitle}>
              Đảm bảo thiết bị của bạn đang bật Bluetooth và ở gần điện thoại
            </Text>
            <Text style={styles.emptyNote}>
              ⚠️ Tính năng scan Bluetooth thật cần tích hợp thư viện native
            </Text>
            <Button
              title="Thử lại"
              onPress={startScan}
              style={styles.retryButton}
              leftIcon={<Ionicons name="refresh" size={18} color={Colors.neutral.white} />}
            />
          </View>
        )}
      </View>

      {/* Tips */}
      {scanState !== 'connected' && scanState !== 'connecting' && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Mẹo kết nối</Text>
          <View style={styles.tipItem}>
            <Ionicons name="bluetooth" size={16} color={Colors.primary.light} />
            <Text style={styles.tipText}>Bật Bluetooth trên điện thoại</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="locate" size={16} color={Colors.primary.light} />
            <Text style={styles.tipText}>Đặt thiết bị gần điện thoại (&lt; 1m)</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="battery-charging" size={16} color={Colors.primary.light} />
            <Text style={styles.tipText}>Đảm bảo thiết bị được sạc đầy</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scanningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  radarContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  radarPulse: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary.light,
  },
  radarCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  scanningTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    textAlign: 'center',
  },
  scanningSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  scanButton: {
    marginTop: Spacing.xl,
    minWidth: 200,
  },
  connectingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectingTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    marginTop: Spacing.lg,
  },
  connectingSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.sm,
  },
  connectedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: Spacing.lg,
  },
  connectedTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.status.success,
  },
  connectedSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  foundContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  foundTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.md,
  },
  deviceList: {
    flex: 1,
  },
  deviceListContent: {
    gap: Spacing.sm,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  deviceItemSelected: {
    borderColor: Colors.primary.main,
  },
  deviceItemIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.status.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  deviceItemIconSelected: {
    backgroundColor: Colors.primary.main,
  },
  deviceItemInfo: {
    flex: 1,
  },
  deviceItemName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  deviceItemType: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  signalContainer: {
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginBottom: 2,
  },
  signalBar: {
    width: 4,
    backgroundColor: Colors.neutral.border,
    borderRadius: 2,
  },
  signalText: {
    fontSize: Typography.fontSizes.xs,
  },
  checkIcon: {
    marginLeft: Spacing.sm,
  },
  foundActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  rescanButton: {
    flex: 1,
  },
  connectButton: {
    flex: 2,
  },
  tipsContainer: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
  tipsTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptyNote: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.warning,
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontStyle: 'italic',
  },
  retryButton: {
    marginTop: Spacing.xl,
    minWidth: 160,
  },
});
