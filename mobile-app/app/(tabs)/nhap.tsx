
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { initialize, requestPermission, readRecords, getSdkStatus, SdkAvailabilityStatus } from 'react-native-health-connect';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api'; 

export default function HealthDashboard() {
  const [loading, setLoading] = useState(false);
  const [dataGroups, setDataGroups] = useState<any>({});

  const syncToDatabase = async (rawData: any) => {
    try {
      //console.log("🔄 [Sync] Bắt đầu chuẩn hóa dữ liệu cho Backend...");
      
      // Backend yêu cầu mảng nằm trong key "data"
      // Và mỗi item phải có: type, value, time
      const allRecords: any[] = [];

      // Map Bước chân
      rawData.Steps.forEach((r: any) => {
        allRecords.push({ type: 'STEPS', value: r.count, time: r.startTime });
      });

      // Map Nhịp tim
      rawData.HeartRate.forEach((r: any) => {
        const bpm = r.samples[r.samples.length - 1]?.beatsPerMinute;
        if (bpm) allRecords.push({ type: 'HEART_RATE', value: bpm, time: r.startTime });
      });

      // Map Calo
      rawData.Calories.forEach((r: any) => {
        allRecords.push({ type: 'CALORIES', value: r.energy.inKilocalories, time: r.startTime });
      });

      // Map Quãng đường
      rawData.Distance.forEach((r: any) => {
        allRecords.push({ type: 'DISTANCE', value: r.distance.inMeters, time: r.startTime });
      });

      // Map SpO2
      rawData.Oxygen.forEach((r: any) => {
        allRecords.push({ type: 'BLOOD_OXYGEN', value: r.percentage, time: r.time });
      });

      if (allRecords.length === 0) return;

      //console.log(`📤 [Sync] Gửi ${allRecords.length} bản ghi lên server...`);

      // CHÚ Ý: Backend Duy dùng const { data } = req.body
      // Nên ta phải gửi object có key là "data"
      const payload = { data: allRecords };

      // Sử dụng axios/fetch thông qua api service
      // Vì hàm syncHealthDataSmart trong api.ts đang bọc metrics, Duy nên dùng hàm syncMetrics 
      // hoặc gọi trực tiếp fetch để khớp key "data"
      const response: any = await api.syncMetrics(payload as any); 

      if (response) {
        //console.log(`✅ [Sync] Thành công! Đã lưu ${response.count} bản ghi.`);
      }
    } catch (error: any) {
      //console.error("❌ [Sync] Lỗi:", error.message);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await initialize();
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'Distance' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
      ]);

      const now = new Date();
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime: now.toISOString() } };

      const [steps, heartRate, oxygen, distance, calories] = await Promise.all([
        readRecords('Steps', filter as any),
        readRecords('HeartRate', filter as any),
        readRecords('OxygenSaturation', filter as any),
        readRecords('Distance', filter as any),
        readRecords('ActiveCaloriesBurned', filter as any), 
      ]);

      const rawData = {
        Steps: steps.records,
        HeartRate: heartRate.records,
        Oxygen: oxygen.records,
        Distance: distance.records,
        Calories: calories.records,
      };

      setDataGroups(rawData);
      await syncToDatabase(rawData);
    } catch (e) {
      //console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.appBar}><Text style={styles.appBarTitle}>Đồng bộ Duy</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.txt}>Dữ liệu hôm nay: {Object.values(dataGroups).flat().length} mục</Text>
      </ScrollView>
      <TouchableOpacity style={styles.btn} onPress={fetchData} disabled={loading}>
        <Text style={styles.btnTxt}>{loading ? 'ĐANG CHẠY...' : 'ĐỒNG BỘ NGAY'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  appBar: { height: 90, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center', paddingTop: 30 },
  appBarTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  txt: { textAlign: 'center', color: '#666' },
  btn: { position: 'absolute', bottom: 30, left: 20, right: 20, height: 50, backgroundColor: '#10B981', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnTxt: { color: '#fff', fontWeight: 'bold' }
});


