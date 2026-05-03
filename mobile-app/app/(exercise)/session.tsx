import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { getConnectedDeviceId, getLastConnectedDeviceId, monitorHeartRate } from '../../services/bluetooth';

type WorkoutState = 'active' | 'paused';
type HeartRateSource = 'ble' | 'simulated';

export default function ExerciseSessionScreen() {
  const params = useLocalSearchParams<{
    workoutId: string;
    workoutName: string;
    workoutIcon: string;
    workoutColor: string;
    caloriesPerMin: string;
  }>();

  const [workoutState, setWorkoutState] = useState<WorkoutState>('active');
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [heartRate, setHeartRate] = useState(72);
  const [calories, setCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [heartRateSource, setHeartRateSource] = useState<HeartRateSource>('simulated');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const caloriesPerMin = parseInt(params.caloriesPerMin || '7');
  const workoutColor = params.workoutColor || Colors.primary.main;

  // Heart rate pulse animation
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const interval = setInterval(pulse, 60000 / heartRate);
    return () => clearInterval(interval);
  }, [heartRate, pulseAnim]);

  // Timer logic
  useEffect(() => {
    if (workoutState === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);

        // Simulate steps (only for walking/running)
        if (['running', 'walking'].includes(params.workoutId || '')) {
          setSteps((prev) => prev + Math.floor(Math.random() * 3) + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [workoutState, params.workoutId]);

  // Heart-rate source: ưu tiên BLE realtime, fallback về mô phỏng.
  useEffect(() => {
    if (workoutState !== 'active') {
      return;
    }

    let cleanupBle: (() => void) | null = null;
    let simulationInterval: ReturnType<typeof setInterval> | null = null;
    let disposed = false;

    const startSimulation = () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }

      setHeartRateSource('simulated');
      simulationInterval = setInterval(() => {
        setHeartRate((prev) => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const newRate = prev + change;
          return Math.max(60, Math.min(180, newRate));
        });
      }, 1000);
    };

    const startBle = async () => {
      const connectedDeviceId = getConnectedDeviceId() || (await getLastConnectedDeviceId());
      if (!connectedDeviceId) {
        startSimulation();
        return;
      }

      try {
        cleanupBle = await monitorHeartRate(
          connectedDeviceId,
          ({ bpm }) => {
            if (!disposed) {
              setHeartRateSource('ble');
              setHeartRate(Math.max(30, Math.min(230, bpm)));
            }
          },
          () => {
            if (!disposed) {
              startSimulation();
            }
          }
        );
      } catch {
        if (!disposed) {
          startSimulation();
        }
      }
    };

    startBle();

    return () => {
      disposed = true;
      if (cleanupBle) {
        cleanupBle();
      }
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [workoutState]);

  // Calculate calories based on elapsed time
  useEffect(() => {
    setCalories(Math.floor((elapsedTime / 60) * caloriesPerMin));
  }, [elapsedTime, caloriesPerMin]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    Vibration.vibrate(50);
    setWorkoutState((prev) => (prev === 'active' ? 'paused' : 'active'));
  };

  const handleEndWorkout = () => {
    Alert.alert(
      'Kết thúc bài tập?',
      'Bạn có chắc muốn kết thúc buổi tập luyện này không?',
      [
        { text: 'Tiếp tục tập', style: 'cancel' },
        {
          text: 'Kết thúc',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(100);
            router.replace({
              pathname: '/(exercise)/result',
              params: {
                workoutName: params.workoutName,
                workoutColor: params.workoutColor,
                duration: elapsedTime.toString(),
                calories: calories.toString(),
                avgHeartRate: heartRate.toString(),
                steps: steps.toString(),
              },
            });
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (elapsedTime > 0) {
      Alert.alert(
        'Hủy bài tập?',
        'Tiến trình tập luyện sẽ không được lưu. Bạn có chắc muốn thoát?',
        [
          { text: 'Ở lại', style: 'cancel' },
          {
            text: 'Thoát',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  // Get heart rate zone
  const getHeartRateZone = () => {
    if (heartRate < 100) return { zone: 'Nhẹ nhàng', color: Colors.secondary.teal };
    if (heartRate < 130) return { zone: 'Đốt mỡ', color: Colors.secondary.green };
    if (heartRate < 150) return { zone: 'Cardio', color: Colors.secondary.orange };
    return { zone: 'Cao điểm', color: Colors.status.error };
  };

  const heartRateZone = getHeartRateZone();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={workoutColor} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: workoutColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="close" size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons
            name={params.workoutIcon as keyof typeof Ionicons.glyphMap || 'fitness'}
            size={24}
            color={Colors.neutral.white}
          />
          <Text style={styles.headerTitle}>{params.workoutName || 'Bài tập'}</Text>
        </View>
        <View style={styles.headerRight}>
          {workoutState === 'paused' && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>TẠM DỪNG</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Thời gian</Text>
          <Text style={[styles.timerValue, workoutState === 'paused' && styles.timerPaused]}>
            {formatTime(elapsedTime)}
          </Text>
        </View>

        {/* Heart Rate Display */}
        <View style={styles.heartRateContainer}>
          <Animated.View
            style={[
              styles.heartRateCircle,
              { transform: [{ scale: pulseAnim }], borderColor: heartRateZone.color },
            ]}
          >
            <Ionicons name="heart" size={32} color={heartRateZone.color} />
            <Text style={[styles.heartRateValue, { color: heartRateZone.color }]}>
              {heartRate}
            </Text>
            <Text style={styles.heartRateUnit}>BPM</Text>
            <Text style={styles.heartRateSource}>
              {heartRateSource === 'ble' ? 'BLE realtime' : 'Dữ liệu mô phỏng'}
            </Text>
          </Animated.View>
          <View style={[styles.zoneBadge, { backgroundColor: heartRateZone.color }]}>
            <Text style={styles.zoneText}>{heartRateZone.zone}</Text>
          </View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="flame" size={24} color={Colors.health.calories} />
            <Text style={styles.metricValue}>{calories}</Text>
            <Text style={styles.metricLabel}>Calories</Text>
          </View>

          {['running', 'walking'].includes(params.workoutId || '') && (
            <View style={styles.metricCard}>
              <Ionicons name="footsteps" size={24} color={Colors.health.steps} />
              <Text style={styles.metricValue}>{steps.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Bước chân</Text>
            </View>
          )}

          <View style={styles.metricCard}>
            <Ionicons name="speedometer" size={24} color={Colors.primary.light} />
            <Text style={styles.metricValue}>
              {((calories / Math.max(elapsedTime / 60, 1))).toFixed(1)}
            </Text>
            <Text style={styles.metricLabel}>kcal/phút</Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* End Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.endButton]}
          onPress={handleEndWorkout}
        >
          <Ionicons name="stop" size={28} color={Colors.status.error} />
          <Text style={[styles.controlText, { color: Colors.status.error }]}>Kết thúc</Text>
        </TouchableOpacity>

        {/* Pause/Resume Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.mainControlButton, { backgroundColor: workoutColor }]}
          onPress={handlePauseResume}
        >
          <Ionicons
            name={workoutState === 'active' ? 'pause' : 'play'}
            size={40}
            color={Colors.neutral.white}
          />
        </TouchableOpacity>

        {/* Lock Button (placeholder) */}
        <TouchableOpacity style={[styles.controlButton, styles.lockButton]}>
          <Ionicons name="lock-open" size={28} color={Colors.neutral.textSecondary} />
          <Text style={styles.controlText}>Khóa</Text>
        </TouchableOpacity>
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
    paddingTop: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.white,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  pausedBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  pausedText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timerLabel: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
  },
  timerValue: {
    fontSize: 64,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerPaused: {
    opacity: 0.5,
  },
  heartRateContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heartRateCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  heartRateValue: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    marginTop: Spacing.xs,
  },
  heartRateUnit: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
  },
  heartRateSource: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  zoneBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  zoneText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.neutral.white,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metricCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    minWidth: 100,
    ...Shadows.sm,
  },
  metricValue: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.neutral.textPrimary,
    marginTop: Spacing.sm,
  },
  metricLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.status.errorLight,
  },
  mainControlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    ...Shadows.lg,
  },
  lockButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.neutral.white,
    ...Shadows.sm,
  },
  controlText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginTop: Spacing.xs,
  },
});
