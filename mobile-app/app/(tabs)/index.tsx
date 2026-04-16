import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

// Import Constants & Services
import { Colors } from '../../constants/Colors';
import { useHealthData } from '../../hooks/useHealthData';
import { getUserData } from '../../services/auth';
import { useHealthTips } from '../../hooks/useHealthTips';
import api from '../../services/api';

// Import styles
import { styles } from './index.styles';

interface HealthRecord {
  record_time: string;
  heart_rate: number | null;
  steps: number | null;
  blood_oxygen: number | null;
  calories: number | null;
  distance: number | null;
  sleep_duration: number | null;
}

type TimeRange = 'day' | 'week' | 'month';

export default function HomeScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [userName, setUserName] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: serverDataRaw, loading: isTableLoading, refresh: refreshFromServer } = useHealthData();
  const { randomTip } = useHealthTips();

  // 1. Chuyển đổi dữ liệu từ Server sang mảng chuẩn
  const serverData = useMemo(() => {
    return Array.isArray(serverDataRaw) ? (serverDataRaw as unknown as HealthRecord[]) : [];
  }, [serverDataRaw]);

  // 2. LOGIC CHÍNH: QUÉT, GỘP VÀ ĐỒNG BỘ
  const handleSyncHealthConnect = async () => {
    try {
      setIsSyncing(true);
      await initialize();

      // Yêu cầu quyền
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
      ]);

      // Lấy dữ liệu 30 ngày để đảm bảo biểu đồ tuần/tháng luôn đủ
      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endTime = now.toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime } };

      const [steps, heart, oxygen, calories, distance] = await Promise.all([
        readRecords('Steps', filter as any),
        readRecords('HeartRate', filter as any),
        readRecords('OxygenSaturation', filter as any),
        readRecords('ActiveCaloriesBurned', filter as any),
        readRecords('Distance', filter as any),
      ]);

      // Logic Gộp 15 phút "Siêu sạch"
      const groupedMap: Record<string, any> = {};
      const addToMap = (time: string, fields: object) => {
        if (!time) return;
        const date = new Date(time);
        const roundedMinutes = Math.floor(date.getMinutes() / 15) * 15;
        date.setMinutes(roundedMinutes, 0, 0);
        const timeKey = date.toISOString();

        if (!groupedMap[timeKey]) {
          groupedMap[timeKey] = {
            record_time: timeKey,
            heart_rate: null, steps: null, blood_oxygen: null,
            calories: null, distance: null, sleep_duration: null
          };
        }

        Object.entries(fields).forEach(([key, value]) => {
          if (['steps', 'calories', 'distance'].includes(key)) {
            groupedMap[timeKey][key] = (groupedMap[timeKey][key] || 0) + value;
          } else {
            groupedMap[timeKey][key] = value;
          }
        });
      };

      steps.records.forEach((r: any) => addToMap(r.startTime, { steps: r.count }));
      heart.records.forEach((r: any) => {
        const lastBpm = r.samples[r.samples.length - 1]?.beatsPerMinute;
        if (lastBpm) addToMap(r.startTime, { heart_rate: lastBpm });
      });
      oxygen.records.forEach((r: any) => addToMap(r.time, { blood_oxygen: r.percentage }));
      calories.records.forEach((r: any) => addToMap(r.startTime, { calories: r.energy.inKilocalories }));
      distance.records.forEach((r: any) => addToMap(r.startTime, { distance: r.distance.inMeters }));

      const finalPayload = Object.values(groupedMap);

      if (finalPayload.length > 0) {
        // Gửi lên Server
        await api.syncMetrics({ data: finalPayload });
        console.log("✅ Đã đồng bộ lên server:", finalPayload.length, "mốc dữ liệu.");
      }
    } catch (error) {
      console.error("❌ Lỗi đồng bộ:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Hàm OnRefresh khi vuốt màn hình
  const onRefresh = useCallback(async () => {
    // Bước A: Quét và đẩy dữ liệu mới từ máy lên Server
    await handleSyncHealthConnect();
    // Bước B: Tải lại dữ liệu từ Server để cập nhật UI
    if (refreshFromServer) {
      await refreshFromServer();
    }
  }, [refreshFromServer]);

  useEffect(() => {
    onRefresh();
    const loadUser = async () => {
      const userData = await getUserData();
      if (userData?.name) setUserName(userData.name);
    };
    loadUser();
  }, []);

  // 4. Tính toán dữ liệu hiển thị từ serverData
  const processedData = useMemo(() => {
    const defaultData = {
      heartRate: { current: 0, min: 0, max: 0, avg: 0, history: [] as number[] },
      oxygen: { current: 0, history: [] as number[] },
      steps: { current: 0, goal: 10000 },
      sleep: { duration: 0, quality: 85 }
    };

    if (serverData.length === 0) return defaultData;

    const hrList = serverData.filter(r => r.heart_rate).map(r => r.heart_rate as number);
    const oxList = serverData.filter(r => r.blood_oxygen).map(r => r.blood_oxygen as number);
    const stepsTotal = serverData.reduce((sum, r) => sum + (r.steps || 0), 0);
    const sleepTotal = serverData.reduce((sum, r) => sum + (r.sleep_duration || 0), 0);

    return {
      heartRate: {
        current: hrList.length ? hrList[hrList.length - 1] : 0,
        min: hrList.length ? Math.min(...hrList) : 0,
        max: hrList.length ? Math.max(...hrList) : 0,
        avg: hrList.length ? Math.round(hrList.reduce((a, b) => a + b, 0) / hrList.length) : 0,
        history: hrList.slice(-7),
      },
      oxygen: {
        current: oxList.length ? oxList[oxList.length - 1] : 0,
        history: oxList.slice(-7)
      },
      steps: { current: stepsTotal, goal: 10000 },
      sleep: { duration: sleepTotal, quality: 85 }
    };
  }, [serverData]);

  const healthScore = useMemo(() => {
    let score = 60;
    if (processedData.oxygen.current >= 95) score += 20;
    if (processedData.heartRate.avg >= 60 && processedData.heartRate.avg <= 100) score += 20;
    return Math.min(100, score);
  }, [processedData]);

  const renderMiniChart = (chartData: number[], color: string) => {
    if (!chartData || chartData.length === 0) return <View style={styles.miniChart} />;
    const max = Math.max(...chartData, 1);
    const min = Math.min(...chartData, 0);
    const range = max - min || 1;
    return (
      <View style={styles.miniChart}>
        {chartData.map((value, index) => (
          <View key={index} style={[styles.miniChartBar, { 
            height: ((value - min) / range) * 40 + 8, 
            backgroundColor: index === chartData.length - 1 ? color : color + '40' 
          }]} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{userName || 'Người dùng'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.timeRangeContainer}>
          {(['day', 'week', 'month'] as TimeRange[]).map((r) => (
            <TouchableOpacity 
              key={r} 
              style={[styles.timeRangeButton, timeRange === r && styles.timeRangeButtonActive]} 
              onPress={() => setTimeRange(r)}
            >
              <Text style={[styles.timeRangeText, timeRange === r && styles.timeRangeTextActive]}>
                {r === 'day' ? 'Hôm nay' : r === 'week' ? 'Tuần' : 'Tháng'}
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
            refreshing={isSyncing || isTableLoading} 
            onRefresh={onRefresh} 
            colors={[Colors.primary.main]} 
          />
        }
      >
        {/* Health Score Card */}
        <View style={styles.healthScoreCard}>
          <View style={styles.healthScoreLeft}>
            <Text style={styles.healthScoreLabel}>Điểm sức khỏe</Text>
            <View style={styles.healthScoreRow}>
              <Text style={styles.healthScoreValue}>{healthScore}</Text>
              <Text style={styles.healthScoreUnit}>/100</Text>
            </View>
            <Text style={styles.healthScoreStatus}>{healthScore >= 80 ? 'Rất Tốt' : 'Ổn định'}</Text>
          </View>
          <Ionicons name="heart-circle" size={80} color={Colors.primary.main} />
        </View>

        {/* Heart Rate Card */}
        <TouchableOpacity 
          style={styles.metricCard} 
          onPress={() => router.push('/(health)/heart-rate-detail')}
        >
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}><Ionicons name="heart" size={20} color="#FF4B4B" /></View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>Nhịp tim</Text>
              <Text style={styles.deviceText}>Cập nhật từ thiết bị</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
          <View style={styles.metricBody}>
            <View style={styles.metricMainValue}>
              <Text style={styles.mainValueText}>{processedData.heartRate.current}</Text>
              <Text style={styles.mainValueUnit}> BPM</Text>
            </View>
            <View style={styles.metricChart}>{renderMiniChart(processedData.heartRate.history, "#FF4B4B")}</View>
          </View>
          <View style={styles.metricFooter}>
            <Text style={styles.statLabel}>Min: <Text style={styles.statValue}>{processedData.heartRate.min}</Text></Text>
            <View style={styles.metricStatDivider} />
            <Text style={styles.statLabel}>Avg: <Text style={styles.statValue}>{processedData.heartRate.avg}</Text></Text>
            <View style={styles.metricStatDivider} />
            <Text style={styles.statLabel}>Max: <Text style={styles.statValue}>{processedData.heartRate.max}</Text></Text>
          </View>
        </TouchableOpacity>

        {/* SpO2 Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#E0F2FE' }]}><Ionicons name="water" size={20} color="#0EA5E9" /></View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>Nồng độ Oxy (SpO2)</Text>
              <Text style={styles.deviceText}>Theo thời gian thực</Text>
            </View>
          </View>
          <View style={styles.metricBody}>
            <View style={styles.metricMainValue}>
              <Text style={styles.mainValueText}>{processedData.oxygen.current}</Text>
              <Text style={styles.mainValueUnit}> %</Text>
            </View>
            <View style={styles.metricChart}>{renderMiniChart(processedData.oxygen.history, "#0EA5E9")}</View>
          </View>
        </View>

        {/* Row Steps & Sleep */}
        <View style={styles.smallCardsRow}>
          <View style={styles.smallCard}>
            <Ionicons name="footsteps" size={24} color="#10B981" />
            <Text style={styles.smallCardValue}>{processedData.steps.current.toLocaleString()}</Text>
            <Text style={styles.smallCardLabel}>bước chân</Text>
          </View>
          <View style={styles.smallCard}>
            <Ionicons name="moon" size={24} color="#8B5CF6" />
            <Text style={styles.smallCardValue}>{processedData.sleep.duration}</Text>
            <Text style={styles.smallCardLabel}>giờ ngủ</Text>
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 {randomTip?.title || 'Gợi ý hôm nay'}</Text>
          <Text style={styles.tipsText}>{randomTip?.content || 'Hãy duy trì thói quen tập thể dục mỗi ngày nhé.'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}