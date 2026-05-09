import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import MetricCard from './MetricCard';

interface OxygenData {
  blood_oxygen: number;
  record_time?: string;
  min_spo2?: number; 
  max_spo2?: number; 
  avg_spo2?: number;
}

interface OxygenSectionProps {
  percent: number;
  timeRange: 'day' | 'week' | 'month';
  rawData: OxygenData[];
}

const OxygenSection: React.FC<OxygenSectionProps> = ({ percent, timeRange, rawData }) => {

  // --- ĐOẠN CONSOLE LOG DEBUG SIÊU CHI TIẾT ---
  useMemo(() => {
    console.log("======= 🕵️ DEBUG OXYGEN START =======");
    console.log(`📍 Component re-render lúc: ${new Date().toLocaleTimeString()}`);
    console.log(`📍 Props Percent (Số to):`, percent);
    console.log(`📍 Time Range đang chọn:`, timeRange);
    console.log(`📍 Tổng số dòng (RawData):`, rawData?.length);

    if (rawData && rawData.length > 0) {
      // 1. Soi cấu trúc của 1 bản ghi đầu tiên
      console.log("📍 Cấu trúc 1 bản ghi mẫu:", JSON.stringify(rawData[0], null, 2));

      // 2. Kiểm tra xem có bản ghi nào có Oxy > 0 không
      const hasOxy = rawData.filter(d => d.blood_oxygen > 0);
      console.log(`📍 Số bản ghi có blood_oxygen > 0:`, hasOxy.length);

      // 3. Nếu có, in ra 3 bản ghi có Oxy mới nhất để xem giá trị
      if (hasOxy.length > 0) {
        console.log("📍 3 bản ghi Oxy mới nhất:", JSON.stringify(hasOxy.slice(-3), null, 2));
      }

      // 4. Kiểm tra xem có bị sai tên biến không (ví dụ server trả về bloodOxygen thay vì blood_oxygen)
      const sample = rawData[0] as any;
      const keys = Object.keys(sample);
      console.log("📍 Tất cả các Key có trong data:", keys.join(", "));
      
      if (!keys.includes('blood_oxygen')) {
        console.error("❌ LỖI: Không tìm thấy key 'blood_oxygen' trong data từ Server trả về!");
      }
    } else {
      console.log("⚠️ WARNING: rawData gửi sang Component bị rỗng [] hoặc undefined");
    }
    console.log("======= 🕵️ DEBUG OXYGEN END =======");
  }, [rawData, percent, timeRange]);
  // ------------------------------------------

  const validRecords = useMemo(() => 
    (rawData || []).filter(d => d.blood_oxygen && d.blood_oxygen > 0), 
  [rawData]);

  const displayPercent = useMemo(() => {
    if (percent > 0) return percent;
    return validRecords.length > 0 ? validRecords[validRecords.length - 1].blood_oxygen : 0;
  }, [percent, validRecords]);

  const getStatus = (val: number) => {
    if (!val || val === 0) return { label: 'N/A', color: '#94A3B8' };
    if (val >= 95) return { label: 'Bình thường', color: '#10B981' };
    if (val >= 90) return { label: 'Thấp', color: '#F59E0B' };
    return { label: 'Cảnh báo', color: '#EF4444' };
  };

  const status = getStatus(displayPercent);

  const renderChart = useMemo(() => {
    if (validRecords.length === 0) return <Text style={styles.noDataText}>Không tìm thấy dữ liệu SpO2</Text>;

    const dayData = validRecords.slice(-12);
    return (
      <View style={styles.dayChartContainer}>
        {dayData.map((d, i) => (
          <View key={i} style={styles.timelinePoint}>
            <View style={[styles.bar, { height: Math.max(5, (d.blood_oxygen - 70) * 1.5), backgroundColor: getStatus(d.blood_oxygen).color }]} />
            {(i === 0 || i === dayData.length - 1) && <Text style={styles.miniLabel}>{d.blood_oxygen}%</Text>}
          </View>
        ))}
      </View>
    );
  }, [validRecords]);

  return (
    <MetricCard
      title="Nồng độ Oxy máu"
      subtitle="Chỉ số gần nhất"
      value={displayPercent > 0 ? displayPercent : '--'}
      unit="%"
      icon="water"
      iconColor="#0EA5E9"
      onPress={() => router.push('/(health)/oxygen-detail')}
    >
      <View style={styles.innerContent}>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
          <View style={[styles.dot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.chartWrapper}>{renderChart}</View>
      </View>
    </MetricCard>
  );
};

const styles = StyleSheet.create({
  innerContent: { marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  chartWrapper: { height: 60, justifyContent: 'center', marginBottom: 10 },
  dayChartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 50 },
  timelinePoint: { alignItems: 'center' },
  bar: { width: 6, borderRadius: 3, marginBottom: 4 },
  miniLabel: { fontSize: 8, color: '#94A3B8', marginTop: 4 },
  noDataText: { fontSize: 12, color: '#94A3B8', textAlign: 'center', fontStyle: 'italic' }
});

export default OxygenSection;