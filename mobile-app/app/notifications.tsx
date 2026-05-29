import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/Colors';
import api, { AlertLogResponse } from '../services/api';

export default function NotificationsScreen() {
  const [alerts, setAlerts] = useState<AlertLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const res = await api.getAlerts();
      if (res.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      //console.error('Fetch alerts error:', err);
      setError('Không thể tải lịch sử cảnh báo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString('vi-VN')} lúc ${d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const getAlertIcon = (type: string) => {
    if (type.includes('SOS')) return 'warning';
    return 'alert-circle';
  };

  const getAlertColor = (type: string) => {
    if (type.includes('SOS')) return Colors.status.error;
    return Colors.status.warning;
  };

  const renderItem = ({ item }: { item: AlertLogResponse }) => {
    const isSOS = item.type.includes('SOS');
    const color = getAlertColor(item.type);

    return (
      <View style={styles.alertCard}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={getAlertIcon(item.type)} size={24} color={color} />
        </View>
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, { color }]}>
            {isSOS ? 'CẢNH BÁO SOS' : 'CẢNH BÁO BẤT THƯỜNG'}
          </Text>
          <Text style={styles.alertMessage}>
            Nhịp tim ghi nhận: <Text style={styles.boldText}>{item.trigger_heart_rate} BPM</Text>
          </Text>
          <Text style={styles.alertTime}>{formatDate(item.alert_time)}</Text>
          {item.is_sos_sent && (
            <View style={styles.sosSentBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.status.success} />
              <Text style={styles.sosSentText}>Đã gửi tin nhắn cho Người thân</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử cảnh báo</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.status.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAlerts}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : alerts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="shield-checkmark-outline" size={64} color={Colors.status.success} />
            <Text style={styles.emptyTitle}>Sức khỏe tuyệt vời!</Text>
            <Text style={styles.emptyText}>Chưa có dữ liệu cảnh báo bất thường nào được ghi nhận.</Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.alert_id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary.main]}
                tintColor={Colors.primary.main}
              />
            }
          />
        )}
      </View>
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
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.neutral.textSecondary,
    fontSize: Typography.fontSizes.sm,
  },
  errorText: {
    marginTop: Spacing.md,
    color: Colors.status.error,
    fontSize: Typography.fontSizes.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.neutral.white,
    fontWeight: Typography.fontWeights.semibold,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  emptyText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  listContainer: {
    padding: Spacing.md,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textPrimary,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: Typography.fontWeights.bold,
  },
  alertTime: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginBottom: 8,
  },
  sosSentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  sosSentText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.status.success,
    marginLeft: 4,
    fontWeight: Typography.fontWeights.medium,
  },
});
