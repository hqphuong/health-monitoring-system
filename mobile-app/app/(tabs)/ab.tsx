import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

export default function HealthSyncTab() {
  const [loading, setLoading] = useState(false);
  const [rawJson, setRawJson] = useState<any>(null);

  const fetchCleanData = async () => {
    setLoading(true);
    try {
      await initialize();
      
      const permissions = [
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
      ];
      await requestPermission(permissions as any);

      // 1. Lấy dữ liệu 30 ngày để làm biểu đồ
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

      // 2. LOGIC GỘP DỮ LIỆU SẠCH & ĐẦY ĐỦ TRƯỜNG
      const groupedMap: Record<string, any> = {};

      const addToMap = (time: string, fields: object) => {
        if (!time) return;
        
        const date = new Date(time);
        // Gộp theo 15 phút để giảm thiểu số hàng và tăng mật độ dữ liệu
        const minutes = date.getMinutes();
        const roundedMinutes = Math.floor(minutes / 15) * 15;
        date.setMinutes(roundedMinutes, 0, 0);
        const timeKey = date.toISOString();

        if (!groupedMap[timeKey]) {
          // KHỞI TẠO ĐẦY ĐỦ CÁC TRƯỜNG THEO SCHEMA PRISMA
          groupedMap[timeKey] = { 
            record_time: timeKey,
            heart_rate: null,
            steps: null,
            blood_oxygen: null,
            calories: null,
            distance: null,
            sleep_duration: null // Thêm nếu bạn muốn đồng bộ giấc ngủ sau này
          };
        }
        
        // Xử lý ghi đè hoặc cộng dồn
        Object.entries(fields).forEach(([key, value]) => {
          if (['steps', 'calories', 'distance'].includes(key)) {
            // Cộng dồn cho các chỉ số vận động
            groupedMap[timeKey][key] = (groupedMap[timeKey][key] || 0) + value;
          } else {
            // Lấy giá trị đo mới nhất cho Nhịp tim / SpO2
            groupedMap[timeKey][key] = value;
          }
        });
      };

      // Đổ dữ liệu thô vào Map xử lý
      steps.records.forEach((r: any) => addToMap(r.startTime, { steps: r.count }));
      heart.records.forEach((r: any) => {
        const lastBpm = r.samples[r.samples.length - 1]?.beatsPerMinute;
        if (lastBpm) addToMap(r.startTime, { heart_rate: lastBpm });
      });
      oxygen.records.forEach((r: any) => addToMap(r.time, { blood_oxygen: r.percentage }));
      calories.records.forEach((r: any) => addToMap(r.startTime, { calories: r.energy.inKilocalories }));
      distance.records.forEach((r: any) => addToMap(r.startTime, { distance: r.distance.inMeters }));

      // 3. CHUẨN HÓA MẢNG CUỐI CÙNG
      const cleanData = Object.values(groupedMap)
        .sort((a: any, b: any) => new Date(a.record_time).getTime() - new Date(b.record_time).getTime());

      // CONSOLE LOG ĐỂ DUY COPY CHO BACKEND
      console.log("================ BACKEND PAYLOAD ================");
      console.log(JSON.stringify({ data: cleanData }, null, 2));
      console.log("================================================");

      setRawJson({ data: cleanData });
      Alert.alert("Thành công", `Đã gộp thành ${cleanData.length} mốc dữ liệu (30 ngày). Xem Console log để biết cấu trúc.`);

    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Data Pro</Text>
        <Text style={styles.subtitle}>Dữ liệu sạch khớp Schema (30 ngày)</Text>
      </View>
      <ScrollView style={styles.logContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.jsonWrapper}>
            <Text style={styles.jsonText}>
              {rawJson ? JSON.stringify(rawJson, null, 2) : "Chưa có dữ liệu. Nhấn nút bên dưới."}
            </Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={fetchCleanData} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'ĐANG XỬ LÝ...' : 'QUÉT & GỘP DỮ LIỆU'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#DDD' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  subtitle: { color: '#8E8E93', fontSize: 14, marginTop: 4 },
  logContainer: { flex: 1, padding: 10 },
  jsonWrapper: { backgroundColor: '#1C1C1E', padding: 15, borderRadius: 12, marginBottom: 100 },
  jsonText: { color: '#32D74B', fontSize: 11, fontFamily: 'monospace' },
  button: { 
    position: 'absolute', bottom: 30, left: 20, right: 20,
    height: 54, backgroundColor: '#007AFF', justifyContent: 'center', 
    alignItems: 'center', borderRadius: 14, elevation: 4
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});