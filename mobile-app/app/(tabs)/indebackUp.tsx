import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { useHealthData, DEFAULT_CHART_DATA } from '../../hooks/useHealthData';
import { getUserData } from '../../services/auth';
import { useHealthTips } from '../../hooks/useHealthTips';

type TimeRange = 'day' | 'week' | 'month';

export default function HomeScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [userName, setUserName] = useState<string>('');
  // Get data from API (không cần userId vì API dùng token xác thực)
  const { data: HEALTH_DATA, chartData, loading, error, refresh, isConnected } = useHealthData();
  const { randomTip } = useHealthTips();

  // Tính health score từ dữ liệu thực
  const healthScore = useMemo(() => {
    let score = 50; // Base score
    const hr = HEALTH_DATA.heartRate;
    const sl = HEALTH_DATA.sleep;
    const st = HEALTH_DATA.steps;

    // Nhịp tim (max +20): 60-100 BPM là tốt
    if (hr.current > 0) {
      if (hr.current >= 60 && hr.current <= 100) score += 20;
      else if (hr.current >= 50 && hr.current <= 110) score += 10;
    }

    // Giấc ngủ (max +15): 7-9h là tốt
    if (sl.duration > 0) {
      if (sl.duration >= 7 && sl.duration <= 9) score += 15;
      else if (sl.duration >= 6) score += 8;
    }

    // Bước chân (max +15): đạt 100% goal
    if (st.current > 0 && st.goal > 0) {
      const ratio = Math.min(st.current / st.goal, 1);
      score += Math.round(ratio * 15);
    }

    return Math.min(100, Math.max(0, score));
  }, [HEALTH_DATA]);

  const healthScoreStatus = useMemo(() => {
    if (healthScore >= 80) return 'Tốt';
    if (healthScore >= 60) return 'Khá';
    if (healthScore >= 40) return 'Trung bình';
    return 'Cần cải thiện';
  }, [healthScore]);

  // Lấy tên user từ storage
  useEffect(() => {
    const loadUserName = async () => {
      const userData = await getUserData();
      if (userData?.name) {
        setUserName(userData.name);
      } else if (userData?.email) {
        // Fallback: lấy phần trước @ của email
        setUserName(userData.email.split('@')[0]);
      }
    };
    loadUserName();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const renderMiniChart = (data: number[], color: string, height: number = 40) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <View style={styles.miniChart}>
        {data.map((value, index) => {
          const barHeight = ((value - min) / range) * height + 8;
          const isLast = index === data.length - 1;
          return (
            <View
              key={index}
              style={[
                styles.miniChartBar,
                {
                  height: barHeight,
                  backgroundColor: isLast ? color : color + '60',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return { icon: 'trending-up', color: Colors.status.error };
      case 'down':
        return { icon: 'trending-down', color: Colors.status.success };
      default:
        return { icon: 'remove', color: Colors.neutral.textSecondary };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.main} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName || 'Người dùng'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.neutral.white} />
            {isConnected && HEALTH_DATA.heartRate.current > 0 && (
              <View style={styles.notificationBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['day', 'week', 'month'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === 'day' ? 'Hôm nay' : range === 'week' ? 'Tuần' : 'Tháng'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        {/* Info Banner - Khi chưa có dữ liệu từ thiết bị */}
        {!isConnected && !loading && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary.main} />
            <Text style={styles.infoText}>Kết nối thiết bị để xem dữ liệu sức khỏe của bạn.</Text>
          </View>
        )}

        {/* Connection Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={Colors.status.error} />
            <Text style={styles.errorText}>Không thể kết nối server. Kéo xuống để thử lại.</Text>
          </View>
        )}

        {/* Loading State */}
        {loading && !HEALTH_DATA.heartRate.current && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {/* Health Score Card */}
        <View style={styles.healthScoreCard}>
          <View style={styles.healthScoreLeft}>
            <Text style={styles.healthScoreLabel}>Điểm sức khỏe</Text>
            <View style={styles.healthScoreRow}>
              <Text style={styles.healthScoreValue}>{healthScore}</Text>
              <Text style={styles.healthScoreUnit}>/100</Text>
            </View>
            <Text style={styles.healthScoreStatus}>{healthScoreStatus}</Text>
          </View>
          <View style={styles.healthScoreRight}>
            <View style={styles.scoreCircle}>
              <View style={styles.scoreCircleInner}>
                <Ionicons name="heart" size={24} color={Colors.primary.main} />
              </View>
            </View>
          </View>
        </View>

        {/* Heart Rate Card */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(health)/heart-rate-detail')}
          activeOpacity={0.7}
        >
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="heart" size={20} color={Colors.health.heartRate} />
            </View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>Nhịp tim</Text>
              <View style={styles.deviceInfo}>
                <Ionicons name="watch-outline" size={12} color={Colors.neutral.textSecondary} />
                <Text style={styles.deviceText}>{HEALTH_DATA.heartRate.device}</Text>
                <Text style={styles.timeText}>• {HEALTH_DATA.heartRate.lastMeasured}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral.placeholder} />
          </View>

          <View style={styles.metricBody}>
            <View style={styles.metricMainValue}>
              <Text style={styles.mainValueText}>{HEALTH_DATA.heartRate.current}</Text>
              <Text style={styles.mainValueUnit}>BPM</Text>
              <View style={styles.trendBadge}>
                <Ionicons
                  name={getTrendIcon(HEALTH_DATA.heartRate.trend).icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={getTrendIcon(HEALTH_DATA.heartRate.trend).color}
                />
              </View>
            </View>

            <View style={styles.metricChart}>
              {renderMiniChart(chartData.heartRate, Colors.health.heartRate)}
            </View>
          </View>

          <View style={styles.metricFooter}>
            <View style={styles.metricStat}>
              <Text style={styles.statLabel}>Thấp nhất</Text>
              <Text style={styles.statValue}>{HEALTH_DATA.heartRate.min}</Text>
            </View>
            <View style={styles.metricStatDivider} />
            <View style={styles.metricStat}>
              <Text style={styles.statLabel}>Trung bình</Text>
              <Text style={styles.statValue}>{HEALTH_DATA.heartRate.avg}</Text>
            </View>
            <View style={styles.metricStatDivider} />
            <View style={styles.metricStat}>
              <Text style={styles.statLabel}>Cao nhất</Text>
              <Text style={styles.statValue}>{HEALTH_DATA.heartRate.max}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => router.push('/(health)/sleep-detail')}
          activeOpacity={0.7}
        >
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: Colors.health.sleep + '20' }]}>
              <Ionicons name="moon" size={20} color={Colors.health.sleep} />
            </View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>Giấc ngủ</Text>
              <View style={styles.deviceInfo}>
                <Ionicons name="watch-outline" size={12} color={Colors.neutral.textSecondary} />
                <Text style={styles.deviceText}>{HEALTH_DATA.sleep.device}</Text>
                <Text style={styles.timeText}>• Đêm qua</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.neutral.placeholder} />
          </View>

          <View style={styles.metricBody}>
            <View style={styles.metricMainValue}>
              <Text style={styles.mainValueText}>{HEALTH_DATA.sleep.duration}</Text>
              <Text style={styles.mainValueUnit}>giờ</Text>
              <View style={[styles.qualityBadge, { backgroundColor: Colors.status.successLight }]}>
                <Text style={[styles.qualityText, { color: Colors.status.success }]}>
                  {HEALTH_DATA.sleep.quality}%
                </Text>
              </View>
            </View>

            <View style={styles.metricChart}>
              {renderMiniChart(chartData.sleep, Colors.health.sleep)}
            </View>
          </View>

          {/* Sleep Stages */}
          <View style={styles.sleepStages}>
            <View style={styles.sleepStageBar}>
              <View
                style={[
                  styles.sleepStageSegment,
                  { flex: HEALTH_DATA.sleep.deepSleep, backgroundColor: '#5B21B6' },
                ]}
              />
              <View
                style={[
                  styles.sleepStageSegment,
                  { flex: HEALTH_DATA.sleep.lightSleep, backgroundColor: '#8B5CF6' },
                ]}
              />
              <View
                style={[
                  styles.sleepStageSegment,
                  { flex: HEALTH_DATA.sleep.remSleep, backgroundColor: '#A78BFA' },
                ]}
              />
              <View
                style={[
                  styles.sleepStageSegment,
                  { flex: HEALTH_DATA.sleep.awake, backgroundColor: Colors.neutral.border },
                ]}
              />
            </View>
          </View>

          <View style={styles.metricFooter}>
            <View style={styles.metricStat}>
              <View style={[styles.stageDot, { backgroundColor: '#5B21B6' }]} />
              <Text style={styles.statLabel}>Sâu</Text>
              <Text style={styles.statValue}>{HEALTH_DATA.sleep.deepSleep}h</Text>
            </View>
            <View style={styles.metricStat}>
              <View style={[styles.stageDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.statLabel}>Nhẹ</Text>
              <Text style={styles.statValue}>{HEALTH_DATA.sleep.lightSleep}h</Text>
            </View>
            <View style={styles.metricStat}>
              <View style={[styles.stageDot, { backgroundColor: '#A78BFA' }]} />
              <Text style={styles.statLabel}>REM</Text>
              <Text style={styles.statValue}>{HEALTH_DATA.sleep.remSleep}h</Text>
            </View>
          </View>

          <View style={styles.sleepTimeRow}>
            <View style={styles.sleepTimeItem}>
              <Ionicons name="bed-outline" size={16} color={Colors.neutral.textSecondary} />
              <Text style={styles.sleepTimeText}>Đi ngủ: {HEALTH_DATA.sleep.bedTime}</Text>
            </View>
            <View style={styles.sleepTimeItem}>
              <Ionicons name="sunny-outline" size={16} color={Colors.neutral.textSecondary} />
              <Text style={styles.sleepTimeText}>Thức dậy: {HEALTH_DATA.sleep.wakeTime}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Steps & Water Row */}
        <View style={styles.smallCardsRow}>
          {/* Steps Card */}
          <View style={styles.smallCard}>
            <View style={[styles.smallCardIcon, { backgroundColor: Colors.health.steps + '20' }]}>
              <Ionicons name="footsteps" size={20} color={Colors.health.steps} />
            </View>
            <Text style={styles.smallCardValue}>
              {HEALTH_DATA.steps.current.toLocaleString()}
            </Text>
            <Text style={styles.smallCardLabel}>bước</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((HEALTH_DATA.steps.current / HEALTH_DATA.steps.goal) * 100, 100)}%`,
                    backgroundColor: Colors.health.steps,
                  },
                ]}
              />
            </View>
            <Text style={styles.goalText}>
              Mục tiêu: {HEALTH_DATA.steps.goal.toLocaleString()}
            </Text>
          </View>

          {/* Water Card */}
          <View style={styles.smallCard}>
            <View style={[styles.smallCardIcon, { backgroundColor: Colors.health.water + '20' }]}>
              <Ionicons name="water" size={20} color={Colors.health.water} />
            </View>
            <Text style={styles.smallCardValue}>{HEALTH_DATA.water.current}</Text>
            <Text style={styles.smallCardLabel}>ml</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((HEALTH_DATA.water.current / HEALTH_DATA.water.goal) * 100, 100)}%`,
                    backgroundColor: Colors.health.water,
                  },
                ]}
              />
            </View>
            <Text style={styles.goalText}>
              Mục tiêu: {HEALTH_DATA.water.goal}ml
            </Text>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color={Colors.secondary.orange} />
            <Text style={styles.tipsTitle}>{randomTip?.title || 'Gợi ý hôm nay'}</Text>
          </View>
          <Text style={styles.tipsText}>
            {randomTip?.content || 'Hãy duy trì thói quen tập luyện và ngủ đủ giấc để có sức khỏe tốt!'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.main,
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.white + 'CC',
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.status.error,
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.neutral.white,
  },
  timeRangeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.neutral.white + 'CC',
  },
  timeRangeTextActive: {
    color: Colors.primary.main,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    marginTop: -Spacing.md,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  healthScoreCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  healthScoreLeft: {
    flex: 1,
  },
  healthScoreLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  healthScoreValue: {
    fontSize: 48,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary.main,
  },
  healthScoreUnit: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.neutral.textSecondary,
    marginLeft: 4,
  },
  healthScoreStatus: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.success,
    fontWeight: Typography.fontWeights.medium,
    marginTop: Spacing.xs,
  },
  healthScoreRight: {
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: Colors.primary.light + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.status.infoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.health.heartRate + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  metricTitleContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  deviceText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  timeText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.placeholder,
  },
  metricBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  metricMainValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainValueText: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  mainValueUnit: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginLeft: 4,
  },
  trendBadge: {
    marginLeft: Spacing.sm,
    padding: 4,
    backgroundColor: Colors.neutral.background,
    borderRadius: BorderRadius.sm,
  },
  qualityBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  qualityText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  metricChart: {
    width: 100,
    height: 50,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    gap: 4,
  },
  miniChartBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 8,
  },
  sleepStages: {
    marginBottom: Spacing.md,
  },
  sleepStageBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  sleepStageSegment: {
    borderRadius: 4,
  },
  metricFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
  metricStat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metricStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.neutral.border,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  statValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
  },
  sleepTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  sleepTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sleepTimeText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  smallCardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  smallCardIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  smallCardValue: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
  },
  smallCardLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.neutral.border,
    borderRadius: 3,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.placeholder,
    marginTop: Spacing.xs,
  },
  tipsCard: {
    backgroundColor: Colors.status.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.secondary.orange,
  },
  tipsText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
  // ✅ Styles mới cho loading và error states
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.error,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.light + '30',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
  },
});
