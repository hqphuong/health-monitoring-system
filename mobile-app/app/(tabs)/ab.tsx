import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

// Import Services & Constants
import api from '../../services/api';
import { Colors } from '../../constants/Colors';
import { useHealthTips } from '../../hooks/useHealthTips';
import { getUserData } from '../../services/auth';

export default function HealthSyncTab() {
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [lastSyncData, setLastSyncData] = useState<any[]>([]);
  const { randomTip } = useHealthTips();

  // 1. Tải thông tin User khi vào trang
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getUserData();
        // Sửa lỗi TS: Kiểm tra cả full_name (theo Schema) và name (phòng hờ)
        const nameToShow = (userData as any)?.full_name || (userData as any)?.name || 'Người dùng';
        setUserName(nameToShow);
      } catch (error) {
        setUserName('Người dùng');
      }
    };
    loadUser();
  }, []);

  // 2. Logic chính: Quét, Gộp và Đồng bộ
  const fetchAndSyncData = async () => {
    setLoading(true);
    try {
      await initialize();
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
      ] as any);

      const now = new Date();
      const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime: now.toISOString() } };

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
            const numValue = typeof value === 'number' ? parseFloat(value.toFixed(2)) : value;
            groupedMap[timeKey][key] = (groupedMap[timeKey][key] || 0) + numValue;
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

      const cleanData = Object.values(groupedMap)
        .sort((a: any, b: any) => new Date(a.record_time).getTime() - new Date(b.record_time).getTime());

      if (cleanData.length > 0) {
        setLastSyncData(cleanData);
        await api.syncMetrics({ data: cleanData });
        console.log(`✅ Đã đồng bộ ${cleanData.length} bản ghi.`);
      } else {
        Alert.alert("Thông báo", "Không tìm thấy dữ liệu mới để đồng bộ.");
      }
    } catch (error: any) {
      console.error("❌ Lỗi:", error.message);
      Alert.alert("Lỗi đồng bộ", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý tính toán chỉ số hiển thị tức thời
  const displayMetrics = useMemo(() => {
    if (lastSyncData.length === 0) return { hr: '--', spo2: '--', steps: '0', cal: '0' };
    
    const latestHr = [...lastSyncData].reverse().find(d => d.heart_rate)?.heart_rate;
    const latestOxy = [...lastSyncData].reverse().find(d => d.blood_oxygen)?.blood_oxygen;
    const totalSteps = lastSyncData.reduce((sum, d) => sum + (d.steps || 0), 0);
    const totalCal = lastSyncData.reduce((sum, d) => sum + (d.calories || 0), 0);

    return {
      hr: latestHr || '--',
      spo2: latestOxy || '--',
      steps: Math.round(totalSteps).toLocaleString(),
      cal: Math.round(totalCal).toString()
    };
  }, [lastSyncData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity 
          style={styles.syncIndicator} 
          onPress={fetchAndSyncData}
          disabled={loading}
        >
            {loading ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Ionicons name="cloud-done" size={26} color="#10B981" />
            )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchAndSyncData} 
            colors={['#6366F1']} 
          />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>Trạng thái hệ thống</Text>
            <Text style={styles.summaryStatus}>
              {loading ? 'Đang đồng bộ dữ liệu...' : 'Dữ liệu đã được cập nhật'}
            </Text>
          </View>
          <Ionicons name="pulse" size={45} color="#FFF" />
        </View>

        {/* Metrics Grid */}
        <View style={styles.grid}>
          {/* Nhịp tim */}
          <View style={styles.metricBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFE4E6' }]}>
                <Ionicons name="heart" size={24} color="#E11D48" />
            </View>
            <Text style={styles.metricValue}>{displayMetrics.hr}</Text>
            <Text style={styles.metricUnit}>Nhịp tim (BPM)</Text>
          </View>

          {/* SpO2 */}
          <View style={styles.metricBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="water" size={24} color="#0284C7" />
            </View>
            <Text style={styles.metricValue}>{displayMetrics.spo2 === '--' ? '--' : displayMetrics.spo2 + '%'}</Text>
            <Text style={styles.metricUnit}>Oxy trong máu</Text>
          </View>

          {/* Bước chân */}
          <View style={styles.metricBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="footsteps" size={24} color="#16A34A" />
            </View>
            <Text style={styles.metricValue}>{displayMetrics.steps}</Text>
            <Text style={styles.metricUnit}>Bước chân</Text>
          </View>

          {/* Calo */}
          <View style={styles.metricBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flame" size={24} color="#D97706" />
            </View>
            <Text style={styles.metricValue}>{displayMetrics.cal}</Text>
            <Text style={styles.metricUnit}>Calories (kcal)</Text>
          </View>
        </View>

        {/* Tips Card */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Gợi ý sức khỏe</Text>
          <Text style={styles.tipContent}>
            {randomTip?.content || "Hãy duy trì thói quen đồng bộ dữ liệu mỗi ngày để theo dõi sức khỏe chính xác nhất."}
          </Text>
        </View>
        
        <Text style={styles.footerNote}>Vuốt xuống để làm mới và đồng bộ dữ liệu</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 19, fontWeight: '700', color: '#1E293B' },
  syncIndicator: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  summaryCard: {
    backgroundColor: '#6366F1',
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryLabel: { color: '#E0E7FF', fontSize: 13, fontWeight: '500' },
  summaryStatus: { color: '#FFF', fontSize: 17, fontWeight: '700', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricBox: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricValue: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  metricUnit: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  tipCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginTop: 10, 
    borderLeftWidth: 6, 
    borderLeftColor: '#6366F1',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  tipContent: { fontSize: 14, color: '#475569', lineHeight: 22 },
  footerNote: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 30, marginBottom: 40 }
});