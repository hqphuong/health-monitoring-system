import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Constants & Components
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import Header from '../../components/home/Header';
import HealthScoreCard from '../../components/home/HealthScoreCard';
import MetricCard from '../../components/home/MetricCard';
import SleepSection from '../../components/home/SleepSection';
import HealthTipCard from '../../components/home/HealthTips';

// Hooks & Services
import { useHealthData } from '../../hooks/useHealthData';
import { getUserData } from '../../services/auth';
import { useHealthTips } from '../../hooks/useHealthTips';
import { useHealthConnect } from '../../hooks/useHealthConnect';

type TimeRange = 'day' | 'week' | 'month';

export default function HomeScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [userName, setUserName] = useState<string>('');
  
  const { syncHealthData, loading: isSyncing } = useHealthConnect() as any;
  const { data: serverDataRaw, loading: isDataLoading, refresh: refreshFromServer } = useHealthData() as any;
  const { randomTip } = useHealthTips();

  // 1. Format dữ liệu và Debug Raw Data
  const serverData = useMemo(() => {
    const raw = serverDataRaw?.raw_data || serverDataRaw?.data || serverDataRaw;
    const dataArray = Array.isArray(raw) ? raw : [];
    
    console.log('--- [DEBUG SERVER DATA] ---');
    console.log('Tổng số records nhận được:', dataArray.length);
    
    // Tìm thử 1 bản ghi có raw_data để check stage
    const sampleWithRaw = dataArray.find((r: any) => r.raw_data !== null && r.sleep_duration > 0);
    console.log('Mẫu bản ghi có Stage:', sampleWithRaw ? JSON.stringify(sampleWithRaw) : '⚠️ Không thấy raw_data (Stage bị null)');
    
    return dataArray;
  }, [serverDataRaw]);

  // 2. Logic xử lý dữ liệu chính
  const processedData = useMemo(() => {
    const now = new Date();
    const filteredRecords = serverData.filter((r: any) => {
      const rDate = new Date(r.record_time);
      if (timeRange === 'day') return rDate.toDateString() === now.toDateString();
      if (timeRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return rDate >= weekAgo;
      }
      return true;
    });

    // --- Xử lý Nhịp tim ---
    const hrValues = filteredRecords.map((r: any) => r.heart_rate).filter((v: any) => v !== null);
    
    // --- Xử lý Giấc ngủ (Logic Timeline bậc thang) ---
    const sleepRecords = filteredRecords.filter((r: any) => (r.sleep_duration || 0) > 0);
    
    const sleepSegments = sleepRecords.map((r: any) => {
      // Lấy stage từ raw_data (đã được fix ở Backend) hoặc field sleep_stage mở rộng
      const stage = r.raw_data?.sleep_stages || r.sleep_stage || 4; 
      
      return {
        label: stage === 5 ? 'Sâu' : stage === 6 ? 'REM' : stage === 1 ? 'Thức' : 'Nông',
        minutes: r.sleep_duration,
        color: stage === 5 ? '#5B21B6' : stage === 6 ? '#A78BFA' : stage === 1 ? '#F59E0B' : '#8B5CF6',
        percent: 0, // Sẽ tính sau
        stage: stage
      };
    });

    const totalSleepMin = sleepSegments.reduce((sum, s) => sum + s.minutes, 0);
    
    // Tính % và thống kê phút theo loại để debug
    const stats = { deep: 0, rem: 0, light: 0, awake: 0 };
    sleepSegments.forEach(s => {
      if (s.stage === 5) stats.deep += s.minutes;
      else if (s.stage === 6) stats.rem += s.minutes;
      else if (s.stage === 1) stats.awake += s.minutes;
      else stats.light += s.minutes;
    });

    const finalStages = [
      { label: 'Sâu', minutes: stats.deep, percent: totalSleepMin ? (stats.deep/totalSleepMin)*100 : 0, color: '#5B21B6' },
      { label: 'REM', minutes: stats.rem, percent: totalSleepMin ? (stats.rem/totalSleepMin)*100 : 0, color: '#A78BFA' },
      { label: 'Nhẹ', minutes: stats.light, percent: totalSleepMin ? (stats.light/totalSleepMin)*100 : 0, color: '#8B5CF6' },
    ];

    console.log('--- [DEBUG CALCULATION] ---');
    console.log(`Phút ngủ - Tổng: ${totalSleepMin} | Sâu: ${stats.deep} | REM: ${stats.rem} | Nhẹ: ${stats.light}`);

    // --- Xử lý Vận động ---
    const totalSteps = filteredRecords.reduce((sum: number, r: any) => sum + (r.steps || 0), 0);
    const totalCalories = filteredRecords.reduce((sum: number, r: any) => sum + (r.calories || 0), 0);

    return {
      heartRate: {
        current: hrValues.length ? hrValues[hrValues.length - 1] : 0,
        avg: hrValues.length ? Math.round(hrValues.reduce((a: number, b: number) => a + b, 0) / hrValues.length) : 0,
        history: hrValues.slice(-20),
      },
      sleep: {
        duration: (totalSleepMin / 60).toFixed(1),
        stages: finalStages,
        segments: sleepSegments // Dùng cho biểu đồ timeline nếu cần
      },
      steps: Math.round(totalSteps),
      calories: Math.round(totalCalories),
    };
  }, [serverData, timeRange]);

  const healthScore = useMemo(() => {
    let score = 70;
    if (processedData.heartRate.avg >= 60 && processedData.heartRate.avg <= 90) score += 15;
    if (processedData.steps > 4000) score += 15;
    return Math.min(100, score);
  }, [processedData]);

  const onRefresh = useCallback(async () => {
    await syncHealthData();
    if (refreshFromServer) await refreshFromServer();
  }, [syncHealthData, refreshFromServer]);

  useEffect(() => {
    getUserData().then(user => setUserName((user as any)?.full_name || 'Duy'));
    onRefresh();
  }, []);

  return (
    <View style={styles.container}>
      <Header 
        userName={userName} 
        timeRange={timeRange} 
        setTimeRange={setTimeRange} 
        isSyncing={isSyncing} 
        onRefresh={onRefresh} 
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isDataLoading} onRefresh={onRefresh} colors={[Colors.primary.main]} />}
      >
        <HealthScoreCard score={healthScore} />

        <MetricCard
          title="Nhịp tim"
          subtitle={`Trung bình: ${processedData.heartRate.avg} BPM`}
          value={processedData.heartRate.current}
          icon="heart"
          iconColor={Colors.health.heartRate}
          onPress={() => router.push('/(health)/heart-rate-detail')}
        >
          <View style={styles.miniChart}>
            {processedData.heartRate.history.map((v, i) => {
              const maxHr = Math.max(...processedData.heartRate.history, 1);
              const minHr = Math.min(...processedData.heartRate.history, 0);
              return (
                <View key={i} style={[styles.miniChartBar, { 
                  height: ((v - minHr) / (maxHr - minHr || 1)) * 30 + 5, 
                  backgroundColor: i === processedData.heartRate.history.length - 1 ? Colors.health.heartRate : Colors.health.heartRate + '40',
                }]} />
              );
            })}
          </View>
        </MetricCard>

        <SleepSection 
          duration={processedData.sleep.duration} 
          stages={processedData.sleep.stages} 
        />

        <View style={styles.smallCardsRow}>
          <View style={styles.smallCard}>
            <View style={[styles.smallCardIcon, { backgroundColor: Colors.health.steps + '20' }]}><Ionicons name="footsteps" size={20} color={Colors.health.steps} /></View>
            <Text style={styles.smallCardValue}>{processedData.steps.toLocaleString()}</Text>
            <Text style={styles.smallCardLabel}>Bước chân</Text>
          </View>
          <View style={styles.smallCard}>
            <View style={[styles.smallCardIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="flame" size={20} color="#D97706" /></View>
            <Text style={styles.smallCardValue}>{processedData.calories}</Text>
            <Text style={styles.smallCardLabel}>Kcal</Text>
          </View>
        </View>

        <HealthTipCard tipContent={randomTip?.content} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.main },
  content: { flex: 1, backgroundColor: Colors.neutral.background, borderTopLeftRadius: BorderRadius['2xl'], borderTopRightRadius: BorderRadius['2xl'], marginTop: -Spacing.md },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing['3xl'] },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', height: 40, gap: 3 },
  miniChartBar: { width: 5, borderRadius: 2, minHeight: 5 },
  smallCardsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  smallCard: { flex: 1, backgroundColor: Colors.neutral.white, borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', ...Shadows.sm },
  smallCardIcon: { width: 44, height: 44, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  smallCardValue: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.neutral.textPrimary },
  smallCardLabel: { fontSize: Typography.fontSizes.sm, color: Colors.neutral.textSecondary },
});