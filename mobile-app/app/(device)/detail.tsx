import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

type DataType = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
  description: string;
};

const DATA_TYPES: DataType[] = [
  { id: 'heart_rate', name: 'Nhịp tim', icon: 'heart', enabled: true, description: 'Theo dõi nhịp tim liên tục' },
  { id: 'steps', name: 'Bước chân', icon: 'footsteps', enabled: true, description: 'Đếm số bước đi mỗi ngày' },
  { id: 'sleep', name: 'Giấc ngủ', icon: 'moon', enabled: true, description: 'Phân tích chất lượng giấc ngủ' },
  { id: 'calories', name: 'Calories', icon: 'flame', enabled: false, description: 'Tính toán năng lượng tiêu thụ' },
  { id: 'stress', name: 'Căng thẳng', icon: 'pulse', enabled: false, description: 'Đo lường mức độ stress' },
  { id: 'oxygen', name: 'SpO2', icon: 'water', enabled: true, description: 'Đo nồng độ oxy trong máu' },
];

export default function DeviceDetailScreen() {
  const params = useLocalSearchParams<{
    deviceId: string;
    deviceName: string;
    deviceType: string;
    deviceProvider: string;
    deviceStatus: string;
    deviceBattery: string;
  }>();

  const [dataTypes, setDataTypes] = useState(DATA_TYPES);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(15);
  const [syncing, setSyncing] = useState(false);

  const battery = parseInt(params.deviceBattery || '0');
  const isConnected = params.deviceStatus === 'connected';

  const handleToggleDataType = (id: string) => {
    setDataTypes((prev) =>
      prev.map((dt) => (dt.id === id ? { ...dt, enabled: !dt.enabled } : dt))
    );
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncing(false);
    Alert.alert('Thành công', 'Dữ liệu đã được đồng bộ');
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Hủy kết nối?',
      `Bạn có chắc muốn hủy kết nối với ${params.deviceName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleForget = () => {
    Alert.alert(
      'Quên thiết bị?',
      `Thiết bị sẽ bị xóa khỏi danh sách và bạn cần ghép nối lại để sử dụng.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Quên thiết bị',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getBatteryColor = () => {
    if (battery > 50) return Colors.status.success;
    if (battery > 20) return Colors.status.warning;
    return Colors.status.error;
  };

  const getBatteryIcon = (): keyof typeof Ionicons.glyphMap => {
    if (battery > 75) return 'battery-full';
    if (battery > 50) return 'battery-half';
    if (battery > 25) return 'battery-half';
    return 'battery-dead';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.neutral.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thiết bị</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Device Info Card */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceIconContainer}>
            <Ionicons name="watch" size={40} color={Colors.primary.main} />
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isConnected ? Colors.status.success : Colors.neutral.placeholder },
              ]}
            />
          </View>
          <Text style={styles.deviceName}>{params.deviceName}</Text>
          <Text style={styles.deviceProvider}>{params.deviceProvider}</Text>

          <View style={styles.deviceStats}>
            <View style={styles.statItem}>
              <Ionicons name={getBatteryIcon()} size={20} color={getBatteryColor()} />
              <Text style={[styles.statValue, { color: getBatteryColor() }]}>{battery}%</Text>
              <Text style={styles.statLabel}>Pin</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="ellipse"
                size={12}
                color={isConnected ? Colors.status.success : Colors.neutral.placeholder}
              />
              <Text style={styles.statValue}>{isConnected ? 'Đã kết nối' : 'Ngắt kết nối'}</Text>
              <Text style={styles.statLabel}>Trạng thái</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color={Colors.primary.light} />
              <Text style={styles.statValue}>5 phút</Text>
              <Text style={styles.statLabel}>Lần đồng bộ</Text>
            </View>
          </View>
        </View>

        {/* Sync Button */}
        <Button
          title={syncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
          onPress={handleSync}
          loading={syncing}
          disabled={!isConnected}
          variant="outline"
          leftIcon={<Ionicons name="sync" size={18} color={Colors.primary.main} />}
          style={styles.syncButton}
        />

        {/* Sync Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt đồng bộ</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Tự động đồng bộ</Text>
                <Text style={styles.settingDescription}>
                  Tự động cập nhật dữ liệu định kỳ
                </Text>
              </View>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: Colors.neutral.border, true: Colors.primary.light }}
                thumbColor={autoSync ? Colors.primary.main : Colors.neutral.white}
              />
            </View>

            {autoSync && (
              <View style={styles.intervalSelector}>
                <Text style={styles.intervalLabel}>Chu kỳ đồng bộ</Text>
                <View style={styles.intervalOptions}>
                  {[5, 15, 30, 60].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      style={[
                        styles.intervalOption,
                        syncInterval === mins && styles.intervalOptionSelected,
                      ]}
                      onPress={() => setSyncInterval(mins)}
                    >
                      <Text
                        style={[
                          styles.intervalText,
                          syncInterval === mins && styles.intervalTextSelected,
                        ]}
                      >
                        {mins} phút
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Data Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại dữ liệu</Text>
          <Text style={styles.sectionSubtitle}>
            Chọn loại dữ liệu muốn đồng bộ từ thiết bị
          </Text>

          <View style={styles.dataTypesCard}>
            {dataTypes.map((dataType, index) => (
              <View key={dataType.id}>
                <View style={styles.dataTypeRow}>
                  <View style={[styles.dataTypeIcon, { backgroundColor: dataType.enabled ? Colors.status.infoLight : Colors.neutral.border }]}>
                    <Ionicons
                      name={dataType.icon}
                      size={20}
                      color={dataType.enabled ? Colors.primary.main : Colors.neutral.placeholder}
                    />
                  </View>
                  <View style={styles.dataTypeInfo}>
                    <Text style={styles.dataTypeName}>{dataType.name}</Text>
                    <Text style={styles.dataTypeDescription}>{dataType.description}</Text>
                  </View>
                  <Switch
                    value={dataType.enabled}
                    onValueChange={() => handleToggleDataType(dataType.id)}
                    trackColor={{ false: Colors.neutral.border, true: Colors.primary.light }}
                    thumbColor={dataType.enabled ? Colors.primary.main : Colors.neutral.white}
                  />
                </View>
                {index < dataTypes.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Device Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý thiết bị</Text>

          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionRow} onPress={handleDisconnect}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.status.warningLight }]}>
                <Ionicons name="link" size={20} color={Colors.status.warning} />
              </View>
              <Text style={styles.actionText}>
                {isConnected ? 'Ngắt kết nối' : 'Kết nối lại'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral.placeholder} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow} onPress={handleForget}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.status.errorLight }]}>
                <Ionicons name="trash" size={20} color={Colors.status.error} />
              </View>
              <Text style={[styles.actionText, { color: Colors.status.error }]}>
                Quên thiết bị
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral.placeholder} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Info */}
        <View style={styles.deviceInfoSection}>
          <Text style={styles.deviceInfoTitle}>Thông tin thiết bị</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID thiết bị</Text>
            <Text style={styles.infoValue}>{params.deviceId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loại</Text>
            <Text style={styles.infoValue}>Vòng tay sức khỏe</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Firmware</Text>
            <Text style={styles.infoValue}>v2.1.5</Text>
          </View>
        </View>
      </ScrollView>
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
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  deviceCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  deviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.status.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: Colors.neutral.white,
  },
  deviceName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  deviceProvider: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  deviceStats: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral.border,
    marginHorizontal: Spacing.md,
  },
  syncButton: {
    marginTop: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.md,
  },
  settingCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
  },
  settingDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  intervalSelector: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
  intervalLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.sm,
  },
  intervalOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  intervalOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral.background,
    alignItems: 'center',
  },
  intervalOptionSelected: {
    backgroundColor: Colors.primary.main,
  },
  intervalText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  intervalTextSelected: {
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeights.medium,
  },
  dataTypesCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  dataTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  dataTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dataTypeInfo: {
    flex: 1,
  },
  dataTypeName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
  },
  dataTypeDescription: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.border,
    marginVertical: Spacing.xs,
  },
  actionsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.textPrimary,
  },
  deviceInfoSection: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
  },
  deviceInfoTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  infoValue: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
});
