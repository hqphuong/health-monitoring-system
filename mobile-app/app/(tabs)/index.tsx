import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  ActivityIndicator,
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

  // 1. DATA PICKER: Bóc tách dữ liệu từ Server chuẩn xác nhất
  // 1. DATA PICKER: Bóc tách dữ liệu từ Server chuẩn xác nhất
  const serverData = useMemo(() => {
    // Backend của Duy trả về object có key "raw_data"
    // Axios/Fetch có thể bọc thêm một lớp "data" bên ngoài
    const raw = (serverDataRaw as any)?.data?.raw_data || 
                (serverDataRaw as any)?.raw_data;
    
    if (Array.isArray(raw)) {
      return raw as HealthRecord[];
    }
    
    // Log để kiểm tra nếu vẫn không ra mảng
    if (serverDataRaw) {
        console.log("⚠️ Vẫn chưa tìm thấy mảng raw_data. Cấu trúc hiện tại:", Object.keys(serverDataRaw));
    }
    
    return [];
  }, [serverDataRaw]);

  // 2. LOGIC ĐỒNG BỘ: Quét 30 ngày và gộp 15 phút
  const handleSyncHealthConnect = async () => {
    try {
      setIsSyncing(true);
      await initialize();
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
      ]);

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

      const groupedMap: Record<string, any> = {};
      const addToMap = (time: string, fields: object) => {
        if (!time) return;
        const date = new Date(time);
        if (isNaN(date.getTime())) return;
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
            groupedMap[timeKey][key] = (groupedMap[timeKey][key] || 0) + (value || 0);
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
        await api.syncMetrics({ data: finalPayload });
        console.log(`✅ [Sync] Đã đẩy ${finalPayload.length} bản ghi lên Database.`);
      }
    } catch (error: any) {
      console.error("❌ Sync Error:", error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    await handleSyncHealthConnect();
    if (refreshFromServer) await refreshFromServer();
  }, [refreshFromServer]);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserData();
      const nameToShow = (userData as any)?.full_name || (userData as any)?.name || 'Người dùng';
      setUserName(nameToShow);
    };
    loadUser();
    onRefresh(); // Tự động sync khi mở app
  }, []);

  // 3. LOGIC TÍNH TOÁN VÀ CONSOLE TEST
  const processedData = useMemo(() => {
    const defaultStats = {
      heartRate: { current: 0, min: 0, max: 0, avg: 0, history: [] as number[] },
      oxygen: { current: 0, avg: 0, history: [] as number[] },
      steps: { current: 0, goal: 10000 },
      sleep: { duration: 0, quality: 85 }
    };

    if (serverData.length === 0) {
      console.log("⚠️ [Data] Đang chờ dữ liệu từ server...");
      return defaultStats;
    }

    const now = new Date();
    const filteredRecords = serverData.filter(r => {
      const rDate = new Date(r.record_time);
      if (timeRange === 'day') return rDate.toDateString() === now.toDateString();
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return rDate >= weekAgo;
      }
      return true; // Month
    });

    const hrValues = filteredRecords.map(r => r.heart_rate).filter((v): v is number => v !== null);
    const oxValues = filteredRecords.map(r => r.blood_oxygen).filter((v): v is number => v !== null);
    const totalSteps = filteredRecords.reduce((sum, r) => sum + (r.steps || 0), 0);
    const totalSleepMin = filteredRecords.reduce((sum, r) => sum + (r.sleep_duration || 0), 0);

    const result = {
      heartRate: {
        current: hrValues.length ? hrValues[hrValues.length - 1] : 0,
        min: hrValues.length ? Math.min(...hrValues) : 0,
        max: hrValues.length ? Math.max(...hrValues) : 0,
        avg: hrValues.length ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : 0,
        history: hrValues.slice(-8),
      },
      oxygen: {
        current: oxValues.length ? oxValues[oxValues.length - 1] : 0,
        avg: oxValues.length ? Math.round(oxValues.reduce((a, b) => a + b, 0) / oxValues.length) : 0,
        history: oxValues.slice(-8)
      },
      steps: { current: Math.round(totalSteps), goal: 10000 },
      sleep: { duration: Math.round(totalSleepMin / 60), quality: 85 }
    };

    // --- CONSOLE LOG TEST DỮ LIỆU ---
    console.log("====================================");
    console.log(`📊 TEST DATA TAB: [${timeRange.toUpperCase()}]`);
    console.log(`- Nhịp tim: Min(${result.heartRate.min}) Avg(${result.heartRate.avg}) Max(${result.heartRate.max})`);
    console.log(`- SpO2: Mới nhất(${result.oxygen.current}%) Avg(${result.oxygen.avg}%)`);
    console.log(`- Tổng bước chân: ${result.steps.current}`);
    console.log(`- Giờ ngủ: ${result.sleep.duration}h`);
    console.log(`- Số mốc dữ liệu tìm thấy: ${filteredRecords.length}`);
    console.log("====================================");

    return result;
  }, [serverData, timeRange]);

  const healthScore = useMemo(() => {
    let score = 65;
    const avgOxy = processedData.oxygen.avg || processedData.oxygen.current;
    if (avgOxy >= 95) score += 20;
    if (processedData.heartRate.avg >= 60 && processedData.heartRate.avg <= 100) score += 15;
    return Math.min(100, score);
  }, [processedData]);

  const renderMiniChart = (chartData: number[], color: string) => {
    if (!chartData.length) return <View style={styles.miniChart} />;
    const max = Math.max(...chartData, 1);
    const min = Math.min(...chartData, 0);
    const range = max - min || 1;
    return (
      <View style={styles.miniChart}>
        {chartData.map((value, index) => (
          <View key={index} style={[styles.miniChartBar, { 
            height: ((value - min) / range) * 35 + 10, 
            backgroundColor: index === chartData.length - 1 ? color : color + '40' 
          }]} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            {isSyncing ? <ActivityIndicator color="#FFF" /> : <Ionicons name="notifications-outline" size={24} color="#FFF" />}
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
        refreshControl={
          <RefreshControl refreshing={isSyncing || isTableLoading} onRefresh={onRefresh} colors={[Colors.primary.main]} />
        }
      >
        {/* Health Score */}
        <View style={styles.healthScoreCard}>
          <View style={styles.healthScoreLeft}>
            <Text style={styles.healthScoreLabel}>Điểm sức khỏe {timeRange === 'day' ? 'Hôm nay' : 'Giai đoạn'}</Text>
            <View style={styles.healthScoreRow}>
              <Text style={styles.healthScoreValue}>{healthScore}</Text>
              <Text style={styles.healthScoreUnit}>/100</Text>
            </View>
            <Text style={styles.healthScoreStatus}>{healthScore >= 85 ? 'Rất Tốt' : 'Bình thường'}</Text>
          </View>
          <Ionicons name="pulse" size={80} color={Colors.primary.main} />
        </View>

        {/* Heart Rate Card */}
        <TouchableOpacity style={styles.metricCard} onPress={() => router.push('/(health)/heart-rate-detail')}>
          <View style={styles.metricHeader}>
            <View style={styles.metricIconContainer}><Ionicons name="heart" size={20} color="#FF4B4B" /></View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>Nhịp tim (BPM)</Text>
              <Text style={styles.deviceText}>T.bình: {processedData.heartRate.avg}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </View>
          <View style={styles.metricBody}>
            <View style={styles.metricMainValue}>
              <Text style={styles.mainValueText}>{processedData.heartRate.avg || '--'}</Text>
            </View>
            <View style={styles.metricChart}>{renderMiniChart(processedData.heartRate.history, "#FF4B4B")}</View>
          </View>
          <View style={styles.metricFooter}>
            <Text style={styles.statLabel}>Thấp nhất: <Text style={styles.statValue}>{processedData.heartRate.min}</Text></Text>
            <View style={styles.metricStatDivider} />
            <Text style={styles.statLabel}>Cao nhất: <Text style={styles.statValue}>{processedData.heartRate.max}</Text></Text>
          </View>
        </TouchableOpacity>

        {/* SpO2 Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#E0F2FE' }]}><Ionicons name="water" size={20} color="#0EA5E9" /></View>
            <View style={styles.metricTitleContainer}>
              <Text style={styles.metricTitle}>Oxy trong máu (SpO2)</Text>
              <Text style={styles.deviceText}>{timeRange === 'day' ? 'Hiện tại' : 'Trung bình'}</Text>
            </View>
          </View>
          <View style={styles.metricBody}>
            <View style={styles.metricMainValue}>
              <Text style={styles.mainValueText}>
                {timeRange === 'day' ? (processedData.oxygen.current || '--') : (processedData.oxygen.avg || '--')}
                <Text style={styles.mainValueUnit}> %</Text>
              </Text>
            </View>
            <View style={styles.metricChart}>{renderMiniChart(processedData.oxygen.history, "#0EA5E9")}</View>
          </View>
        </View>

        {/* Steps & Sleep Row */}
        <View style={styles.smallCardsRow}>
          <View style={styles.smallCard}>
            <Ionicons name="footsteps" size={26} color="#10B981" />
            <Text style={styles.smallCardValue}>{processedData.steps.current.toLocaleString()}</Text>
            <Text style={styles.smallCardLabel}>tổng bước</Text>
          </View>
          <View style={styles.smallCard}>
            <Ionicons name="moon" size={26} color="#8B5CF6" />
            <Text style={styles.smallCardValue}>{processedData.sleep.duration}</Text>
            <Text style={styles.smallCardLabel}>giờ ngủ</Text>
          </View>
        </View>

        {/* Advice Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 {randomTip?.title || 'Lời khuyên'}</Text>
          <Text style={styles.tipsText}>{randomTip?.content || 'Đang cập nhật lời khuyên sức khỏe...'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}