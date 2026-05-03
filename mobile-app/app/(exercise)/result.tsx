import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

export default function ExerciseResultScreen() {
  const params = useLocalSearchParams<{
    workoutName: string;
    workoutColor: string;
    duration: string;
    calories: string;
    avgHeartRate: string;
    steps: string;
  }>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const duration = parseInt(params.duration || '0');
  const calories = parseInt(params.calories || '0');
  const avgHeartRate = parseInt(params.avgHeartRate || '0');
  const steps = parseInt(params.steps || '0');
  const workoutColor = params.workoutColor || Colors.primary.main;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs} giờ ${mins} phút`;
    }
    if (mins > 0) {
      return `${mins} phút ${secs} giây`;
    }
    return `${secs} giây`;
  };

  const getPerformanceLevel = () => {
    if (duration < 600) return { level: 'Khởi động', icon: 'leaf', color: Colors.secondary.teal };
    if (duration < 1800) return { level: 'Tốt', icon: 'thumbs-up', color: Colors.secondary.green };
    if (duration < 3600) return { level: 'Xuất sắc', icon: 'star', color: Colors.secondary.orange };
    return { level: 'Vô địch', icon: 'trophy', color: Colors.health.heartRate };
  };

  const performance = getPerformanceLevel();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏃 Tôi vừa hoàn thành buổi ${params.workoutName}!\n⏱ Thời gian: ${formatDuration(duration)}\n🔥 ${calories} kcal\n❤️ Nhịp tim TB: ${avgHeartRate} BPM\n\n#HealthGuard #Fitness`,
      });
    } catch (error) {
      //console.error(error);
    }
  };

  const handleComplete = () => {
    router.replace('/(tabs)/live-tracking');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={workoutColor} />

      {/* Header with gradient */}
      <View style={[styles.header, { backgroundColor: workoutColor }]}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.celebrationIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.neutral.white} />
          </View>
          <Text style={styles.congratsText}>Hoàn thành!</Text>
          <Text style={styles.workoutName}>{params.workoutName}</Text>
        </Animated.View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Performance Badge */}
        <Animated.View
          style={[
            styles.performanceCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.performanceIcon, { backgroundColor: performance.color + '20' }]}>
            <Ionicons
              name={performance.icon as keyof typeof Ionicons.glyphMap}
              size={32}
              color={performance.color}
            />
          </View>
          <Text style={[styles.performanceLevel, { color: performance.color }]}>
            {performance.level}
          </Text>
          <Text style={styles.performanceDesc}>
            Bạn đã tập luyện {formatDuration(duration)}
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View
            style={[
              styles.statCard,
              styles.statCardLarge,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Ionicons name="time" size={28} color={Colors.primary.main} />
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>Thời gian</Text>
          </Animated.View>

          <View style={styles.statsRow}>
            <Animated.View
              style={[
                styles.statCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Ionicons name="flame" size={24} color={Colors.health.calories} />
              <Text style={styles.statValue}>{calories}</Text>
              <Text style={styles.statLabel}>kcal</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.statCard,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <Ionicons name="heart" size={24} color={Colors.health.heartRate} />
              <Text style={styles.statValue}>{avgHeartRate}</Text>
              <Text style={styles.statLabel}>BPM TB</Text>
            </Animated.View>

            {steps > 0 && (
              <Animated.View
                style={[
                  styles.statCard,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <Ionicons name="footsteps" size={24} color={Colors.health.steps} />
                <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Bước</Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Heart Rate Zones */}
        <View style={styles.zonesCard}>
          <Text style={styles.zonesTitle}>Vùng nhịp tim</Text>
          <View style={styles.zoneBar}>
            <View style={[styles.zoneSegment, { flex: 2, backgroundColor: Colors.secondary.teal }]} />
            <View style={[styles.zoneSegment, { flex: 3, backgroundColor: Colors.secondary.green }]} />
            <View style={[styles.zoneSegment, { flex: 2, backgroundColor: Colors.secondary.orange }]} />
            <View style={[styles.zoneSegment, { flex: 1, backgroundColor: Colors.status.error }]} />
          </View>
          <View style={styles.zoneLabels}>
            <Text style={styles.zoneLabel}>Nhẹ nhàng</Text>
            <Text style={styles.zoneLabel}>Đốt mỡ</Text>
            <Text style={styles.zoneLabel}>Cardio</Text>
            <Text style={styles.zoneLabel}>Cao điểm</Text>
          </View>
        </View>

        {/* Motivation Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="chatbubble-ellipses" size={24} color={Colors.primary.light} />
          <Text style={styles.quoteText}>
            "Mỗi buổi tập là một bước tiến tới phiên bản tốt hơn của bạn!"
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <Button
            title="Chia sẻ"
            variant="outline"
            onPress={handleShare}
            style={styles.shareButton}
            leftIcon={<Ionicons name="share-social" size={18} color={Colors.primary.main} />}
          />
          <Button
            title="Hoàn tất"
            onPress={handleComplete}
            style={styles.completeButton}
          />
        </View>
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  headerContent: {
    alignItems: 'center',
  },
  celebrationIcon: {
    marginBottom: Spacing.md,
  },
  congratsText: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  workoutName: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.neutral.white + 'CC',
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  performanceCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: -Spacing['3xl'],
    ...Shadows.lg,
  },
  performanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  performanceLevel: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  performanceDesc: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    marginTop: Spacing.lg,
  },
  statCardLarge: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  zonesCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    ...Shadows.sm,
  },
  zonesTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.md,
  },
  zoneBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  zoneSegment: {
    height: '100%',
  },
  zoneLabels: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  zoneLabel: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: Colors.status.infoLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  quoteText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.main,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  shareButton: {
    flex: 1,
  },
  completeButton: {
    flex: 2,
  },
});
