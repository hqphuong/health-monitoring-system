import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import api from '../../services/api'; // Duy kiểm tra lại đường dẫn import này cho đúng cấu trúc folder dự án nhé

export default function WeeklySyncScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    const logLine = `[${time}] ${message}`;
    console.log(logLine, data ? JSON.stringify(data, null, 2) : '');

    setLogs(prev => [
      ...prev,
      logLine + (data ? `\n${JSON.stringify(data, null, 2).substring(0, 200)}...` : '')
    ]);
  };

  const runWeeklySync = async () => {
    setLoading(true);
    setLogs([]);
    addLog("=== 🚀 BẮT ĐẦU TIẾN TRÌNH ĐỒNG BỘ DỮ LIỆU CHUẨN 1 TUẦN QUA ===");

    try {
      // -------------------------------------------------------------
      // BƯỚC 1: KHỞI TẠO SDK & ĐỊNH NGHĨA MẢNG QUYỀN CHUẨN ĐỂ TRÁNH LỖI BIÊN DỊCH ARGUMENTS
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 1] Kết nối hệ thống Android Health Connect...");
      await initialize();

      const PERMISSIONS_LIST = [
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
      ] as any[];

      addLog("⏳ Gửi yêu cầu cấp quyền đọc cho 6 phân hệ chỉ số sức khỏe...");
      await requestPermission(PERMISSIONS_LIST);
      addLog("✅ Khởi tạo và cấp quyền thành công!");

      // Thiết lập khoảng thời gian lùi đúng 7 ngày tính từ thời điểm hiện tại
      const now = new Date();
      const startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endTime = now.toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime } };

      addLog(`⏱️ Khoảng thời gian quét dữ liệu (1 Tuần - UTC): ${startTime} ==> ${endTime}`);

      // -------------------------------------------------------------
      // BƯỚC 2: ĐỌC DỮ LIỆU THÔ TỪ SDK (PHÁT HIỆN SỐ LƯỢNG ĐẦU VÀO)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 2] Đang tải song song dữ liệu thô từ các phân hệ đối tượng...");
      const [oxygenRaw, sleepRaw, heartRaw, stepsRaw, caloriesRaw, distanceRaw] = await Promise.all([
        readRecords('OxygenSaturation', filter as any),
        readRecords('SleepSession', filter as any),
        readRecords('HeartRate', filter as any),
        readRecords('Steps', filter as any),
        readRecords('ActiveCaloriesBurned', filter as any),
        readRecords('Distance', filter as any),
      ]);

      addLog(`📊 THỐNG KÊ BẢN GHI THÔ TỪ HEALTH CONNECT (7 NGÀY):`);
      addLog(`- Nhịp tim (HeartRate Series): ${heartRaw.records?.length || 0} gói dữ liệu lớn`);
      addLog(`- SpO2 (OxygenSaturation): ${oxygenRaw.records?.length || 0} điểm đo`);
      addLog(`- Bước chân (Steps): ${stepsRaw.records?.length || 0} mốc vận động`);
      addLog(`- Giấc ngủ (SleepSession): ${sleepRaw.records?.length || 0} giấc ngủ`);
      addLog(`- Năng lượng tiêu hao (Calories): ${caloriesRaw.records?.length || 0} mốc tiêu thụ`);

      // -------------------------------------------------------------
      // BƯỚC 3: MÁY NGHIỀN DATA THEO PHÚT (BÓC TÁCH MẢNG SAMPLES CON)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 3] Tiến hành nghiền nhỏ và tích hợp đa chỉ số về mốc thời gian phút...");
      const groupedMap: Record<string, any> = {};

      const addToMap = (time: string, fields: any) => {
        if (!time) return;
        const date = new Date(time);
        date.setSeconds(0, 0); // Đưa về giây 0 để gộp chung một phút
        const timeKey = date.toISOString();

        if (!groupedMap[timeKey]) {
          groupedMap[timeKey] = {
            record_time: timeKey,
            heart_rate: null,
            steps: 0,
            blood_oxygen: null,
            calories: 0,
            distance: 0,
            sleep_duration: 0,
            raw_data: {},
            hr_samples: []
          };
        }

        const entry = groupedMap[timeKey];

        // Gộp Nhịp tim: Cộng dồn mẫu trong phút rồi tính trung bình
        if (fields.heart_rate != null) {
          entry.hr_samples.push(fields.heart_rate);
          const sum = entry.hr_samples.reduce((a: number, b: number) => a + b, 0);
          entry.heart_rate = Math.round(sum / entry.hr_samples.length);
        }

        // Gộp SpO2: Chuẩn hóa nếu dính số thập phân từ thiết bị (0.98 -> 98)
        if (fields.blood_oxygen != null) {
          let oxyVal = Number(fields.blood_oxygen);
          if (oxyVal > 0 && oxyVal <= 1) oxyVal = Math.round(oxyVal * 100);
          if (oxyVal > 0) entry.blood_oxygen = oxyVal;
        }

        // Tích lũy tuyến tính các chỉ số vận động & giấc ngủ trùng phút
        if (fields.steps != null) entry.steps += Number(fields.steps);
        if (fields.calories != null) entry.calories += Number(fields.calories);
        if (fields.distance != null) entry.distance += Number(fields.distance);
        if (fields.sleep_duration != null) entry.sleep_duration += Number(fields.sleep_duration);

        if (fields.raw_data) {
          entry.raw_data = { ...entry.raw_data, ...fields.raw_data };
        }
      };

      // --- TRÍCH XUẤT CHUYÊN SÂU NHỊP TIM (Chọc vào mảng samples con của Series) ---
      if (heartRaw.records && heartRaw.records.length > 0) {
        heartRaw.records.forEach((record: any) => {
          if (record.samples && record.samples.length > 0) {
            record.samples.forEach((sample: any) => {
              addToMap(sample.time, { heart_rate: sample.beatsPerMinute });
            });
          } else if (record.beatsPerMinute != null) {
            addToMap(record.startTime || record.time, { heart_rate: record.beatsPerMinute });
          }
        });
      }

      // --- TRÍCH XUẤT SPO2 (SINGLE POINT) ---
      if (oxygenRaw.records && oxygenRaw.records.length > 0) {
        oxygenRaw.records.forEach((r: any) => {
          const time = r.time || r.startTime;
          const oxyVal = r.percentage ?? r.level ?? null;
          addToMap(time, { blood_oxygen: oxyVal });
        });
      }

      // --- TRÍCH XUẤT BƯỚC CHÂN ---
      if (stepsRaw.records && stepsRaw.records.length > 0) {
        stepsRaw.records.forEach((r: any) => {
          addToMap(r.startTime || r.time, { steps: r.count });
        });
      }

      // --- TRÍCH XUẤT CALORIES ---
      if (caloriesRaw.records && caloriesRaw.records.length > 0) {
        caloriesRaw.records.forEach((r: any) => {
          const calVal = r.energy?.inKilocalories || r.energy || 0;
          addToMap(r.startTime || r.time, { calories: calVal });
        });
      }

      // --- TRÍCH XUẤT GIẤC NGỦ ---
      if (sleepRaw.records && sleepRaw.records.length > 0) {
        sleepRaw.records.forEach((session: any) => {
          if (session.stages && session.stages.length > 0) {
            session.stages.forEach((stage: any) => {
              const durationInMinutes = Math.round((new Date(stage.endTime).getTime() - new Date(stage.startTime).getTime()) / 60000);
              addToMap(stage.startTime, {
                sleep_duration: durationInMinutes,
                raw_data: { sleep_stages: stage.stage }
              });
            });
          } else {
            const durationInMinutes = Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000);
            addToMap(session.startTime, { sleep_duration: durationInMinutes });
          }
        });
      }

      // Nén mảng Payload cuối cùng, lọc sạch các phút trống không chứa bất kỳ chỉ số sinh lý nào
      const finalPayload = Object.values(groupedMap)
        .filter((item: any) => {
          return item.steps > 0 || item.heart_rate != null || item.blood_oxygen != null || item.calories > 0 || item.sleep_duration > 0;
        })
        .map(({ hr_samples, ...rest }) => rest);

      addLog(`📦 ĐÓNG GÓI HOÀN TẤT: Tạo ra mảng tích hợp gồm ${finalPayload.length} phần tử từng phút.`);

      const payloadCoverage = {
        'Nhịp tim lọt lưới': finalPayload.some(p => p.heart_rate !== null),
        'SpO2 lọt lưới': finalPayload.some(p => p.blood_oxygen !== null),
        'Bước chân lọt lưới': finalPayload.some(p => p.steps > 0),
        'Calories lọt lưới': finalPayload.some(p => p.calories > 0),
        'Giấc ngủ lọt lưới': finalPayload.some(p => p.sleep_duration > 0),
      };
      addLog("🔍 ĐỘ PHỦ ĐỐI TƯỢNG DATA TRONG PAYLOAD CHUẨN BỊ GỬI:", payloadCoverage);

      if (finalPayload.length === 0) {
        throw new Error("Không có dữ liệu biến động hợp lệ nào trong 7 ngày qua để thực hiện sync!");
      }

      // -------------------------------------------------------------
      // BƯỚC 4: BẮN PAYLOAD MẢNG CHUẨN LÊN SERVER (POST /METRICS)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 4] Đang thực hiện POST API đẩy payload 1 tuần lên Server...");
      const syncResult = await api.syncMetrics({ data: finalPayload });
      addLog("✅ SERVER PHẢN HỒI GHI NHẬN THÀNH CÔNG:", syncResult);

      addLog("⏳ Tạm nghỉ 2 giây chờ hệ thống phía Backend xử lý hoàn tất Batch...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // -------------------------------------------------------------
      // BƯỚC 5: ĐỌC NGƯỢC KIỂM TRA CHỈ SỐ THỰC TẾ ĐÃ LƯU TRÊN DB SERVER
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 5] Đang gọi GET API truy vấn đối chứng dữ liệu trên Server...");
      const serverData = await api.getMetrics({ range: 'week' });

      const serverRaw = serverData?.raw_data || [];
      const serverSummary = serverData?.daily_summary || [];

      addLog(`📊 KẾT QUẢ NGHIỆM THU CUỐI CÙNG TỪ DATABASE SERVER:`);
      addLog(`- Số lượng ngày sinh ra tóm tắt (daily_summary): ${serverSummary.length} ngày`);
      addLog(`- Tổng số hàng chỉ số sinh lý (raw_data) trong DB: ${serverRaw.length}`);
      addLog(`- Số hàng chứa Nhịp tim thực tế (>0): ${serverRaw.filter((r: any) => r.heart_rate > 0).length}`);
      addLog(`- Số hàng chứa SpO2 thực tế (>0): ${serverRaw.filter((r: any) => r.blood_oxygen > 0).length}`);
      addLog(`- Số hàng chứa Bước chân thực tế (>0): ${serverRaw.filter((r: any) => r.steps > 0).length}`);

      if (serverRaw.length > 0) {
        addLog("🎉 XÁC NHẬN LUỒNG HOÀN TOÀN THÔNG SUỐT! Mẫu 1 bản ghi đa chỉ số chuẩn từ DB Server:", serverRaw[serverRaw.length - 1]);
      } else {
        addLog("❌ CẢNH BÁO: Không kéo được bản ghi đối chứng nào từ Server xuống.");
      }

    } catch (err: any) {
      addLog(`🚨 TIẾN TRÌNH ĐỨT GÃY TẠI LỖI: ${err.message}`);
    } finally {
      setLoading(false);
      addLog("=== 🏁 KẾT THÚC QUY TRÌNH ĐỒNG BỘ 1 TUẦN ===");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthGuard Weekly Synchronizer</Text>
      <Text style={styles.subTitle}>Dọn dẹp và đồng bộ chuẩn xác dữ liệu 7 ngày qua lên Server</Text>

      <Button
        title={loading ? "Đang đồng bộ dữ liệu tuần..." : "Kích Hoạt Đồng Bộ 1 Tuần"}
        onPress={runWeeklySync}
        disabled={loading}
        color="#22C55E"
      />

      {loading && <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 20 }} />}

      <ScrollView style={styles.logContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {logs.map((log, index) => (
          <Text key={index} style={[
            styles.logText,
            log.includes("❌") || log.includes("🚨") ? styles.errorLog : null,
            log.includes("✅") || log.includes("🎉") ? styles.successLog : null,
          ]}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0F172A', paddingTop: 50 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC', textAlign: 'center', marginBottom: 5 },
  subTitle: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  logContainer: { flex: 1, backgroundColor: '#020617', borderRadius: 8, padding: 10, marginTop: 15 },
  logText: { fontFamily: 'monospace', fontSize: 11, color: '#38BDF8', marginBottom: 6 },
  errorLog: { color: '#EF4444', fontWeight: 'bold' },
  successLog: { color: '#4ADE80', fontWeight: 'bold' },
});