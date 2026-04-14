import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import { Ionicons } from '@expo/vector-icons';

// Định nghĩa kiểu dữ liệu cho Webhook
interface HealthPayload {
  user: string;
  timestamp: string;
  total_records: number;
  data: any[];
}

export default function HealthDashboard() {
  const [loading, setLoading] = useState(false);
  const [dataGroups, setDataGroups] = useState<any>({});

  // 1. Hàm đồng bộ dữ liệu lên Webhook (Giống code Flutter của Duy)
  const syncDataToCloud = async (allData: any[]) => {
    if (allData.length === 0) return;

    const url = 'https://webhook.site/4cda32d3-f229-469c-943e-8dfc479b6f7b';
    
    const payload: HealthPayload = {
      user: "Duy_Huawei_Band_RN",
      timestamp: new Date().toISOString(),
      total_records: allData.length,
      data: allData,
    };

    console.log("📤 Đang gửi dữ liệu lên Webhook...", payload);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Đồng bộ Webhook thành công!");
      }
    } catch (error) {
      console.error("❌ Lỗi gửi Webhook:", error);
    }
  };

  // 2. Hàm đọc dữ liệu từ Health Connect
  const fetchData = async () => {
    setLoading(true);
    try {
      // Khởi tạo & Check SDK
      const isInit = await initialize();
      const status = await getSdkStatus();
      if (!isInit || status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        Alert.alert("Lỗi", "Health Connect chưa được cài đặt hoặc khởi tạo.");
        return;
      }

      // Yêu cầu quyền (Steps, HeartRate, Sleep, Oxygen)
      await requestPermission([
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'OxygenSaturation' },
  { accessType: 'read', recordType: 'TotalCaloriesBurned' }, // Mới
  { accessType: 'read', recordType: 'Distance' },            // Mới
]);

      const now = new Date();
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 24h qua
      const endTime = now.toISOString();

      // Đọc từng loại dữ liệu
      const [steps, heartRate, sleep, oxygen] = await Promise.all([
        readRecords('Steps', { timeRangeFilter: { operator: 'between', startTime, endTime } }),
        readRecords('HeartRate', { timeRangeFilter: { operator: 'between', startTime, endTime } }),
        readRecords('SleepSession', { timeRangeFilter: { operator: 'between', startTime, endTime } }),
        readRecords('OxygenSaturation', { timeRangeFilter: { operator: 'between', startTime, endTime } }),
      ]);

      const rawData = {
        Steps: steps.records,
        HeartRate: heartRate.records,
        Sleep: sleep.records,
        Oxygen: oxygen.records,
      };

      // 📝 CONSOLE LOG TOÀN BỘ DỮ LIỆU ĐỌC ĐƯỢC
      console.log("📊 [HEALTH DATA FETCHED]:", rawData);

      setDataGroups(rawData);

      // Gom tất cả vào một mảng để gửi Cloud
      const allRecords = [
        ...steps.records.map(r => ({ type: 'STEPS', value: r.count, time: r.startTime })),
        ...heartRate.records.map(r => ({ type: 'HEART_RATE', value: r.samples[0]?.beatsPerMinute, time: r.startTime })),
        ...oxygen.records.map(r => ({ type: 'BLOOD_OXYGEN', value: r.percentage, time: r.time })),
      ];

      await syncDataToCloud(allRecords);

    } catch (error) {
      console.error("❌ Lỗi Fetch Data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 3. Giao diện hiển thị
  const renderCard = (title: string, records: any[], icon: string, color: string) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {records?.length > 0 ? (
        <View>
          <Text style={styles.latestText}>Mới nhất: {JSON.stringify(records[records.length-1]?.count || records[records.length-1]?.samples?.[0]?.beatsPerMinute || records[records.length-1]?.percentage || "...")}</Text>
          <Text style={styles.recordCount}>Tổng số bản ghi: {records.length}</Text>
        </View>
      ) : (
        <Text style={styles.noData}>Chưa có dữ liệu từ hôm qua</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Sức khỏe của Duy (RN)</Text>
        <TouchableOpacity onPress={fetchData}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderCard("Nhịp tim", dataGroups.HeartRate, "heart", "#F44336")}
        {renderCard("Bước chân", dataGroups.Steps, "footsteps", "#2196F3")}
        {renderCard("Giấc ngủ", dataGroups.Sleep, "moon", "#3F51B5")}
        {renderCard("SpO2", dataGroups.Oxygen, "water", "#E91E63")}
        
        {loading && <ActivityIndicator size="large" color="#FF9800" />}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={fetchData}>
        <Ionicons name="sync" size={20} color="white" />
        <Text style={styles.fabText}>ĐỒNG BỘ CLOUD</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  appBar: { 
    height: 100, backgroundColor: '#2196F3', 
    flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40 
  },
  appBarTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  card: { 
    backgroundColor: 'white', borderRadius: 15, padding: 16, 
    marginBottom: 16, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  latestText: { fontSize: 16, color: '#333' },
  recordCount: { fontSize: 12, color: '#999', marginTop: 4 },
  noData: { color: '#999', fontStyle: 'italic' },
  fab: {
    position: 'absolute', bottom: 30, right: 20, left: 20,
    backgroundColor: '#FF9800', height: 50, borderRadius: 25,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 5
  },
  fabText: { color: 'white', fontWeight: 'bold', marginLeft: 10 }
});