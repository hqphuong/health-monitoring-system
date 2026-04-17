import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text } from 'react-native';

// Constants & Components
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import Header from '../../components/home/Header';
import HealthScoreCard from '../../components/home/HealthScoreCard';
import SleepSection from '../../components/home/SleepSection';
import HealthTipCard from '../../components/home/HealthTips';
import HeartRateSection from '../../components/home/HeartRateSection';

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
  const { data: serverResponse, loading: isDataLoading, refresh: refreshFromServer } = useHealthData(timeRange) as any;
  const { randomTip } = useHealthTips();

  const rawData = useMemo(() => serverResponse?.raw_data || [], [serverResponse]);
  const dailySummary = useMemo(() => serverResponse?.daily_summary || [], [serverResponse]);

  const processedData = useMemo(() => {
    // --- KHÔNG CÓ DỮ LIỆU ---
    if (rawData.length === 0 && dailySummary.length === 0) {
      return {
        heartRate: { current: 0, avg: 0, history: [] },
        sleep: { duration: '0.0', stages: [] },
        steps: 0, calories: 0,
      };
    }

    // --- TAB HÔM NAY (Lấy ngày có dữ liệu mới nhất) ---
    if (timeRange === 'day') {
      // Tìm ngày mới nhất có trong mảng rawData
      const latestDateStr = rawData.length > 0 
        ? new Date(rawData[rawData.length - 1].record_time).toDateString()
        : new Date().toDateString();

      const targetRecords = rawData.filter((r: any) => 
        new Date(r.record_time).toDateString() === latestDateStr
      );

      const hrValues = targetRecords.map((r: any) => r.heart_rate).filter((v: any) => v !== null);
      
      const stats = { deep: 0, rem: 0, light: 0, total: 0 };
      targetRecords.forEach((r: any) => {
        if (r.sleep_duration > 0) {
          const stage = r.sleep_stage || r.raw_data?.sleep_stages;
          stats.total += r.sleep_duration;
          if (stage === 5) stats.deep += r.sleep_duration;
          else if (stage === 6) stats.rem += r.sleep_duration;
          else stats.light += r.sleep_duration;
        }
      });

      return {
        heartRate: {
          current: hrValues.length ? hrValues[hrValues.length - 1] : 0,
          avg: hrValues.length ? Math.round(hrValues.reduce((a: number, b: number) => a + b, 0) / hrValues.length) : 0,
          history: hrValues.slice(-30), // Lấy lịch sử nhịp tim để vẽ chart
        },
        sleep: {
          duration: (stats.total / 60).toFixed(1),
          stages: [
            { label: 'Sâu', minutes: stats.deep, percent: stats.total ? (stats.deep/stats.total)*100 : 0, color: '#5B21B6' },
            { label: 'REM', minutes: stats.rem, percent: stats.total ? (stats.rem/stats.total)*100 : 0, color: '#A78BFA' },
            { label: 'Nhẹ', minutes: stats.light, percent: stats.total ? (stats.light/stats.total)*100 : 0, color: '#8B5CF6' },
          ],
        },
        steps: targetRecords.reduce((sum: number, r: any) => sum + (r.steps || 0), 0),
        calories: Math.round(targetRecords.reduce((sum: number, r: any) => sum + (r.calories || 0), 0)),
      };
    }

    // --- TAB TUẦN / THÁNG (Dùng dailySummary) ---
    const hrHistory = dailySummary.map((d: any) => d.avg_hr).filter((v: any) => v > 0);
    const totalSteps = dailySummary.reduce((sum: number, d: any) => sum + (d.steps || 0), 0);
    const totalCalories = dailySummary.reduce((sum: number, d: any) => sum + (d.calories || 0), 0);

    return {
      heartRate: {
        current: hrHistory.length ? hrHistory[hrHistory.length - 1] : 0,
        avg: hrHistory.length ? Math.round(hrHistory.reduce((a:number, b:number) => a+b, 0) / hrHistory.length) : 0,
        history: hrHistory,
      },
      sleep: {
        duration: dailySummary.reduce((sum: number, d: any) => sum + (d.sleep_hours || 0), 0).toFixed(1),
        stages: [], 
      },
      steps: totalSteps,
      calories: totalCalories,
    };
  }, [rawData, dailySummary, timeRange]);

  const onRefresh = useCallback(async () => {
    await syncHealthData(30); 
    if (refreshFromServer) refreshFromServer();
  }, [syncHealthData, refreshFromServer]);

  useEffect(() => {
    getUserData().then(user => setUserName((user as any)?.full_name || 'Duy'));
    onRefresh();
  }, []);

  return (
    <View style={styles.container}>
      <Header userName={userName} timeRange={timeRange} setTimeRange={setTimeRange} isSyncing={isSyncing} onRefresh={onRefresh} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={isDataLoading} onRefresh={onRefresh} colors={[Colors.primary.main]} />}
      >
        <HealthScoreCard score={85} />
        <HeartRateSection 
          current={processedData.heartRate.current}
          avg={processedData.heartRate.avg}
          history={processedData.heartRate.history}
        />
        <SleepSection duration={processedData.sleep.duration} stages={processedData.sleep.stages} />
        <View style={styles.smallCardsRow}>
          <View style={styles.smallCard}>
            <Text style={styles.smallCardValue}>{processedData.steps.toLocaleString()}</Text>
            <Text style={styles.smallCardLabel}>Bước chân</Text>
          </View>
          <View style={styles.smallCard}>
            <Text style={styles.smallCardValue}>{processedData.calories}</Text>
            <Text style={styles.smallCardLabel}>Kcal tiêu thụ</Text>
          </View>
        </View>
        <HealthTipCard tipContent={randomTip?.content} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.main },
  content: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -Spacing.md },
  contentContainer: { padding: 20, paddingBottom: 40 },
  smallCardsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  smallCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', ...Shadows.sm },
  smallCardValue: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  smallCardLabel: { fontSize: 12, color: '#64748B' },
});