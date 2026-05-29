import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';

// Constants & Components
import { Colors, Spacing } from '../../constants/Colors';
import Header from '../../components/home/Header';
import HealthScoreCard from '../../components/home/HealthScoreCard';
import SleepSection from '../../components/home/SleepSection';
import HealthTipCard from '../../components/home/HealthTips';
import HeartRateSection from '../../components/home/HeartRateSection';
import OxygenSection from '../../components/home/OxygenSection';
import StepsSection from '../../components/home/StepsSection';
import CaloriesSection from '../../components/home/CaloriesSection';

// Hooks & Services
import { useHealthData } from '../../hooks/useHealthData';
import { getUserData } from '../../services/auth';
import { useHealthTips } from '../../hooks/useHealthTips';
import { useWeeklySync } from '../../hooks/useWeeklySync'; // Import Hook nguyên bản vừa bóc tách
import socketService from '../../services/socketService';
import { readAllHealthData } from '../../services/healthConnect';
import { EmergencyModal } from '../../components/EmergencyModal';
import { TouchableOpacity, Text } from 'react-native';

type TimeRange = 'day' | 'week' | 'month';

export default function HomeScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [userName, setUserName] = useState<string>('');
  const [alertData, setAlertData] = useState<any>(null);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // 1. Gọi Hook đồng bộ nguyên bản 100% logic của Duy
  const { runWeeklySync, loading: isSyncing } = useWeeklySync();

  // 2. Lấy dữ liệu phân tích từ Server về để vẽ biểu đồ và cập nhật UI
  const { data: serverResponse, loading: isDataLoading, refresh } = useHealthData(timeRange) as any;
  const { randomTip } = useHealthTips();

  const rawData = useMemo(() => serverResponse?.raw_data || [], [serverResponse]);
  const dailySummary = useMemo(() => serverResponse?.daily_summary || [], [serverResponse]);

  // --- LUỒNG XỬ LÝ ĐỒNG BỘ VÀ LÀM MỚI DỮ LIỆU (KHI VUỐT HOẶC ẤN NÚT ĐỒNG BỘ) ---
  const onRefresh = useCallback(async () => {
    try {
      // Kích hoạt đọc Health Connect và POST dữ liệu thô lên DB Render
      await runWeeklySync();
    } catch (error) {
      console.error("❌ [HomeScreen Sync Error]:", error);
    } finally {
      // Trễ đúng 2.5 giây như luồng test để DB hoàn tất Batch-Upsert rồi kéo ngược data sạch về UI
      setTimeout(() => {
        refresh();
      }, 2500);
    }
  }, [runWeeklySync, refresh]);

  // --- XỬ LÝ TÍNH TOÁN HIỂN THỊ CÁC THÀNH PHẦN (GIỮ NGUYÊN GỐC KHÔNG ĐỔI) ---
  const processedData = useMemo(() => {
    const defaultData = {
      score: 0,
      heartRate: { current: 0, avg: 0, history: [] as number[] },
      oxygen: 0,
      sleep: { duration: '0.0', stages: [] as any[] },
      steps: 0,
      calories: 0,
    };

    if (!rawData.length && !dailySummary.length) return defaultData;

    if (timeRange === 'day') {
      const availableDates = Array.from(new Set(rawData.map((r: any) => new Date(r.record_time).toDateString()))).reverse();
      let targetDateStr: string = availableDates.length > 0 ? (availableDates[0] as string) : new Date().toDateString();

      for (const dStr of availableDates) {
        const hasMainData = rawData.some((r: any) =>
          new Date(r.record_time).toDateString() === (dStr as string) && (r.heart_rate > 0 || r.steps > 0 || r.blood_oxygen > 0)
        );
        if (hasMainData) { targetDateStr = dStr as string; break; }
      }

      const targetRecords = rawData.filter((r: any) => new Date(r.record_time).toDateString() === targetDateStr);
      const hrValues = targetRecords.map((r: any) => r.heart_rate).filter((v: any) => v > 0);
      const oxygenValues = targetRecords.map((r: any) => r.blood_oxygen).filter((v: any) => v > 0);
      const sleepRecs = targetRecords.filter((r: any) => (r.sleep_duration || 0) > 0);

      let deep = 0, rem = 0, light = 0, totalSleep = 0;
      sleepRecs.forEach((r: any) => {
        const stage = r.sleep_stage || r.raw_data?.sleep_stages;
        totalSleep += r.sleep_duration;
        if (stage === 5) deep += r.sleep_duration;
        else if (stage === 6) rem += r.sleep_duration;
        else light += r.sleep_duration;
      });

      return {
        score: Math.min(100, 65 + (targetRecords.reduce((s: number, r: any) => s + (r.steps || 0), 0) / 200)),
        heartRate: {
          current: hrValues.length ? hrValues[hrValues.length - 1] : 0,
          avg: hrValues.length ? Math.round(hrValues.reduce((a: any, b: any) => a + b, 0) / hrValues.length) : 0,
          history: hrValues.slice(-30)
        },
        oxygen: oxygenValues.length ? oxygenValues[oxygenValues.length - 1] : 0,
        sleep: {
          duration: (totalSleep / 60).toFixed(1),
          stages: [
            { label: 'Sâu', minutes: deep, percent: totalSleep ? (deep / totalSleep) * 100 : 0, color: '#5B21B6' },
            { label: 'REM', minutes: rem, percent: totalSleep ? (rem / totalSleep) * 100 : 0, color: '#A78BFA' },
            { label: 'Nhẹ', minutes: light, percent: totalSleep ? (light / totalSleep) * 100 : 0, color: '#8B5CF6' },
          ]
        },
        steps: Math.round(targetRecords.reduce((s: number, r: any) => s + (r.steps || 0), 0)),
        calories: Math.round(targetRecords.reduce((s: number, r: any) => s + (r.calories || 0), 0)),
      };
    }

    const totalSteps = dailySummary.reduce((s: number, d: any) => s + (d.steps || 0), 0);
    const totalCals = dailySummary.reduce((s: number, d: any) => s + (d.calories || 0), 0);
    const hrHistory = dailySummary.map((d: any) => d.avg_hr).filter((v: any) => v > 0);
    const oxyHistory = dailySummary.map((d: any) => d.avg_spo2).filter((v: any) => v > 0);
    const totalSleepHrs = dailySummary.reduce((s: number, d: any) => s + (d.sleep_hours || 0), 0);

    return {
      score: Math.min(100, 55 + (totalSteps / (timeRange === 'week' ? 1000 : 5000))),
      heartRate: {
        current: hrHistory.length ? hrHistory[hrHistory.length - 1] : 0,
        avg: hrHistory.length ? Math.round(hrHistory.reduce((a: any, b: any) => a + b, 0) / hrHistory.length) : 0,
        history: hrHistory
      },
      oxygen: oxyHistory.length ? Math.round(oxyHistory.reduce((a: any, b: any) => a + b, 0) / oxyHistory.length) : 0,
      sleep: {
        duration: totalSleepHrs.toFixed(1),
        stages: []
      },
      steps: Math.round(totalSteps),
      calories: Math.round(totalCals)
    };
  }, [rawData, dailySummary, timeRange]);

  // SỬA TẠI ĐÂY: Khởi chạy phát đầu tiên khi mở app - Chỉ lấy tên và kéo data UI có sẵn, không tự động sync nữa
  useEffect(() => {
    getUserData().then((u: any) => {
      setUserName(u?.full_name || 'Duy');
      
      // Khởi tạo Socket.io
      socketService.connect();
      // Dùng user_id thật để DB không bị lỗi Foreign Key khi lưu
      const userId = u?.user_id || '1bfbf31a-81ae-4fb5-9222-78e6576d8d5f';
      socketService.startSession(userId);
    });
    refresh(); // Chỉ gọi refresh để lấy data sẵn có từ Server Render lên UI

    // Lắng nghe cảnh báo SOS
    const handleEmergency = (data: any) => {
      console.log('\n==================================================');
      console.log('🚨 [MOBILE APP] NHẬN ĐƯỢC CẢNH BÁO TỪ BACKEND!');
      console.log('Dữ liệu nhận được:', JSON.stringify(data, null, 2));
      console.log('==================================================\n');

      setAlertData({
        ...data,
        message: data.reasons?.join(', ') || 'Phát hiện rủi ro sức khỏe cao!'
      });
      setIsAlertVisible(true);
    };
    socketService.on('emergency_alert', handleEmergency);

    // Sửa lại: Không gửi liên tục mỗi 10s nữa để tránh rác DB do Huawei Health không cập nhật realtime.
    // Thay vào đó, ta sẽ chỉ gửi luồng Realtime khi nào người dùng dùng tính năng "Đo Trực Tiếp" (như Bluetooth).
    // Ở đoạn này tôi tạm tắt interval tự động, và cung cấp nút "Test" bên dưới UI để bạn trải nghiệm luồng xử lý của AI.
    
    return () => {
      socketService.off('emergency_alert', handleEmergency);
      socketService.disconnect();
    };
  }, []);

  // Hàm mô phỏng dữ liệu nhịp tim cao gửi qua WebSocket để test
  const simulateEmergency = async () => {
    // 1. Đảm bảo Socket đã được bật và đăng ký Session
    const u = await getUserData();
    const userId = u?.user_id || '1bfbf31a-81ae-4fb5-9222-78e6576d8d5f';
    socketService.startSession(userId);

    // 2. Gửi metric cực cao để kích hoạt SOS
    const fakeMetric = {
      record_time: new Date().toISOString(),
      heart_rate: 210, // Nhịp tim cực cao (Vượt ngưỡng 220-tuổi) để chắc chắn kích hoạt cảnh báo SOS
      steps: 10,
      blood_oxygen: 85, 
      raw_data: { spo2: 85 }, // Backend đọc SpO2 từ raw_data.spo2
      stress_level: 0
    };
    
    // Đợi 500ms cho Backend xử lý xong start_session rồi mới gửi Metric
    setTimeout(() => {
      console.log('\n==================================================');
      console.log('📡 [MOBILE APP] GỬI DỮ LIỆU LÊN BACKEND (SOCKET):');
      console.log(JSON.stringify(fakeMetric, null, 2));
      console.log('==================================================\n');

      socketService.streamMetrics([fakeMetric]);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Header
        userName={userName}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        isSyncing={isSyncing} // Hiển thị vòng xoay xoay trên Header dựa vào loading của hook gốc
        onRefresh={onRefresh} // Hàm này kích hoạt đồng bộ khi bấm nút trên Header
      />
      
      {/* NÚT TEST CẢNH BÁO ĐỂ DEMO LUỒNG MODULE B */}
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={simulateEmergency}
      >
        <Text style={styles.testButtonText}>⚠️ Test Giả lập Nhịp tim Cao (Kích hoạt AI)</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isDataLoading}
            onRefresh={onRefresh} // SỬA TẠI ĐÂY: Vuốt từ trên xuống sẽ kích hoạt luồng đồng bộ hoàn chỉnh
            colors={[Colors.primary.main]}
          />
        }
      >
        <HealthScoreCard score={Math.round(processedData?.score ?? 0)} />

        <HeartRateSection
          current={processedData.heartRate.current}
          avg={processedData.heartRate.avg}
          history={processedData.heartRate.history}
          timeRange={timeRange}
          rawData={timeRange === 'day'
            ? rawData
            : dailySummary.map((d: any) => ({ heart_rate: d.avg_hr, record_time: d.date }))
          }
        />

        <OxygenSection
          percent={processedData.oxygen}
          timeRange={timeRange}
          rawData={timeRange === 'day'
            ? rawData
            : dailySummary.map((d: any) => ({
              blood_oxygen: d.avg_spo2,
              record_time: d.date,
              min_spo2: d.min_spo2 || (d.avg_spo2 - 2),
              max_spo2: d.max_spo2 || (d.avg_spo2 + 1)
            }))
          }
        />

        <SleepSection
          duration={processedData.sleep.duration}
          stages={processedData.sleep.stages}
          timeRange={timeRange}
          dailySummary={dailySummary}
          rawData={rawData}
        />

        <StepsSection
          steps={processedData.steps}
          goal={10000}
          timeRange={timeRange}
          dailySummary={dailySummary}
          rawData={rawData} // 🟢 TRUYỀN THÊM DÒNG NÀY ĐỂ BƠM DATA CHO MÁY NGHIỀN MINI
        />

        <CaloriesSection
          calories={processedData.calories}
          timeRange={timeRange}
          dailySummary={dailySummary} // 🟢 Chỉ cần bổ sung dòng này là xong
        />


        <HealthTipCard
          content={randomTip?.content || "Duy trì lối sống lành mạnh cùng HealthGuard nhé!"}
        />
      </ScrollView>

      {/* MODAL CẢNH BÁO */}
      <EmergencyModal 
        visible={isAlertVisible} 
        data={alertData} 
        onClose={() => setIsAlertVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary.main },
  content: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -Spacing.md },
  contentContainer: { padding: 20, paddingBottom: 40 },
  smallCardsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  testButton: { 
    backgroundColor: '#FF3B30', 
    marginHorizontal: 20, 
    marginBottom: 15, 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center',
    elevation: 3
  },
  testButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});