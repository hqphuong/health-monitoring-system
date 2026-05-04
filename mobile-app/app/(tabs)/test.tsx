import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/Colors';
import { useHealthData } from '../../hooks/useHealthData';

type TimeRange = 'day' | 'week' | 'month';

export default function HeartRateDetailScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const { data: serverDataRaw, loading } = useHealthData(timeRange) as any;

  const [analysis, setAnalysis] = useState({
    prediction: 'normal',
    riskScore: 0,
    reasons: [] as string[],
    isAnalyzing: false
  });

  // 1. XỬ LÝ DỮ LIỆU BIỂU ĐỒ & THỐNG KÊ
  const processedStats = useMemo(() => {
    const raw = serverDataRaw?.raw_data || [];
    const summary = serverDataRaw?.daily_summary || [];

    const filtered = raw.filter((r: any) => r.heart_rate != null && r.heart_rate > 0);
    const hrValues = filtered.map((r: any) => r.heart_rate);
    
    const current = hrValues.length ? hrValues[hrValues.length - 1] : 0;
    const max = hrValues.length ? Math.max(...hrValues) : 0;
    const min = hrValues.length ? Math.min(...hrValues) : 0;
    const avg = hrValues.length ? Math.round(hrValues.reduce((a: number, b: number) => a + b, 0) / hrValues.length) : 0;

    let chartData: number[] = [];
    let labels: string[] = [];

    if (timeRange === 'day') {
      const currentHour = new Date().getHours();
      for (let i = 0; i <= 22; i += 2) {
        if (i <= currentHour + 1) {
          const hourRecords = filtered.filter((r: any) => {
            const h = new Date(r.record_time).getHours();
            return h >= i && h < i + 2;
          });
          chartData.push(hourRecords.length ? Math.round(hourRecords.reduce((s: number, r: any) => s + r.heart_rate, 0) / hourRecords.length) : 0);
          labels.push(`${i}h`);
        }
      }
    } else {
      const source = summary.slice(timeRange === 'week' ? -7 : -12);
      chartData = source.map((d: any) => d.avg_hr || 0);
      labels = source.map((d: any) => new Date(d.date).getDate().toString());
    }

    return { current, max, min, avg, chartData, labels, measurements: [...filtered].reverse().slice(0, 15) };
  }, [serverDataRaw, timeRange]);

  // 2. GỌI MODULE B (PYTHON) - CÓ LOG CHI TIẾT
  useEffect(() => {
  const runAnalysis = async () => {
    if (analysis.isAnalyzing || !serverDataRaw?.raw_data) return;

    const hrHistory = serverDataRaw.raw_data
      .map((r: any) => r.heart_rate)
      .filter((hr: number) => hr > 0)
      .slice(-20);

    if (hrHistory.length < 3) return;

    setAnalysis(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      console.log("🚀 [STEP 2] Gửi mảng nhịp tim sang Python:", hrHistory);

      // Thêm AbortController để ngắt kết nối nếu quá lâu
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Đợi 5s thôi

      const response = await fetch('http://192.168.31.197:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heart_rate_history: hrHistory }),
        signal: controller.signal // Gắn signal vào đây
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      console.log("✅ [STEP 3] Kết quả từ Module B:", result);

      setAnalysis({
        prediction: result.prediction,
        riskScore: result.risk_score,
        reasons: result.reasons || [],
        isAnalyzing: false
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error("❌ [LỖI] Fetch bị Timeout! Server Python không phản hồi.");
      } else {
        console.error("❌ [LỖI KẾT NỐI]:", error.message);
      }
      setAnalysis(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  runAnalysis();
}, [serverDataRaw]);

  const getZone = (bpm: number) => {
    if (bpm <= 0) return { zone: '--', color: '#94A3B8', bg: '#F1F5F9' };
    if (bpm < 100) return { zone: 'Bình thường', color: '#22C55E', bg: '#DCFCE7' };
    return { zone: 'Cao', color: '#EF4444', bg: '#FEE2E2' };
  };

  const currentZone = getZone(processedStats.current);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Nhịp tim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* Card Phân tích AI */}
        <View style={[styles.card, { borderColor: analysis.prediction === 'anomaly' ? '#EF4444' : '#22C55E', borderWidth: 1 }]}>
          <View style={styles.row}>
            <Ionicons name="analytics" size={20} color={analysis.prediction === 'anomaly' ? "#EF4444" : "#22C55E"} />
            <Text style={[styles.cardTitle, { color: analysis.prediction === 'anomaly' ? "#EF4444" : "#22C55E" }]}>
              AI Analysis: {analysis.prediction === 'anomaly' ? 'Bất thường' : 'An toàn'}
            </Text>
            {analysis.isAnalyzing && <ActivityIndicator size="small" style={{marginLeft: 10}} />}
          </View>
          <Text style={styles.cardDesc}>Điểm rủi ro: {(analysis.riskScore * 100).toFixed(1)}%</Text>
        </View>

        {/* Giá trị hiện tại */}
        <View style={styles.mainCard}>
          <Text style={styles.label}>Nhịp tim hiện tại</Text>
          <View style={styles.row}>
            <Text style={styles.bigValue}>{processedStats.current || '--'}</Text>
            <Text style={styles.unit}>BPM</Text>
            <View style={[styles.badge, { backgroundColor: currentZone.bg, marginLeft: 'auto' }]}>
              <Text style={{ color: currentZone.color, fontWeight: 'bold' }}>{currentZone.zone}</Text>
            </View>
          </View>
        </View>

        {/* Bộ lọc thời gian */}
        <View style={styles.tabContainer}>
          {(['day', 'week', 'month'] as TimeRange[]).map((r) => (
            <TouchableOpacity 
              key={r} 
              onPress={() => setTimeRange(r)}
              style={[styles.tab, timeRange === r && styles.tabActive]}
            >
              <Text style={{ color: timeRange === r ? '#000' : '#64748B' }}>{r === 'day' ? 'Ngày' : r === 'week' ? 'Tuần' : 'Tháng'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thống kê nhanh */}
        <View style={styles.rowBetween}>
          <View style={styles.miniCard}>
            <Text style={styles.label}>Tối đa</Text>
            <Text style={styles.value}>{processedStats.max} BPM</Text>
          </View>
          <View style={styles.miniCard}>
            <Text style={styles.label}>Trung bình</Text>
            <Text style={styles.value}>{processedStats.avg} BPM</Text>
          </View>
        </View>

        {/* Lịch sử */}
        <View style={styles.historyCard}>
          <Text style={styles.cardTitle}>Lịch sử đo</Text>
          {processedStats.measurements.map((m: any, i: number) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.time}>{new Date(m.record_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              <Text style={[styles.hrText, { color: getZone(m.heart_rate).color }]}>{m.heart_rate} BPM</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backButton: { padding: 8, backgroundColor: '#FFF', borderRadius: 10, ...Shadows.sm },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 15, ...Shadows.sm },
  mainCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, ...Shadows.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  cardDesc: { fontSize: 13, color: '#64748B', marginTop: 5, marginLeft: 28 },
  bigValue: { fontSize: 48, fontWeight: 'bold' },
  unit: { fontSize: 16, color: '#64748B', marginLeft: 5, marginBottom: 10 },
  label: { fontSize: 13, color: '#64748B' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', padding: 4, borderRadius: 12, marginBottom: 15 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFF' },
  miniCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, width: '48%', ...Shadows.sm },
  value: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
  historyCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginTop: 15, ...Shadows.sm },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  time: { color: '#64748B' },
  hrText: { fontWeight: 'bold' }
});