import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import api from '../../services/api'; // Thay đổi đường dẫn import api cho đúng với dự án của Duy

export default function DiagnosticsScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string, data?: any) => {
    const time = new Date().toLocaleTimeString();
    const logLine = `[${time}] ${message}`;
    console.log(logLine, data ? JSON.stringify(data, null, 2) : '');

    setLogs(prev => [...prev, logLine + (data ? `\n${JSON.stringify(data, null, 2).substring(0, 300)}...` : '')]);
  };

  const runFullDiagnostics = async () => {
    setLoading(true);
    setLogs([]);
    addLog("=== 🚀 KHỞI ĐỘNG CHẨN ĐOÁN TOÀN DIỆN LUỒNG DATA ===");

    try {
      // -------------------------------------------------------------
      // BƯỚC 1: KHỞI TẠO SDK & XIN QUYỀN TRỰC TIẾP
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 1] Đang khởi tạo Health Connect...");
      await initialize();

      addLog("⏳ Đang kiểm tra/Xin quyền đọc SpO2 và Giấc ngủ...");
      await requestPermission([
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Steps' },
      ]);

      const now = new Date();
      // Quét 3 ngày gần nhất để chắc chắn gom đủ data tháng 5
      const startTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const endTime = now.toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime } };

      addLog(`⏱️ Khoảng thời gian quét dữ liệu (UTC): ${startTime} ==> ${endTime}`);

      // -------------------------------------------------------------
      // BƯỚC 2: ĐỌC DATA THÔ TỪ SDK (KIỂM TRA CHẶNG ĐẦU)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 2] Đang đọc dữ liệu thô từ Android Health Connect...");
      const oxygenRaw = await readRecords('OxygenSaturation', filter as any);
      const sleepRaw = await readRecords('SleepSession', filter as any);

      addLog(`📊 KẾT QUẢ ĐỌC THÔ:`);
      addLog(`- Số lượng bản ghi SpO2 thô: ${oxygenRaw.records?.length || 0}`);
      addLog(`- Số lượng bản ghi Giấc ngủ thô: ${sleepRaw.records?.length || 0}`);

      if (oxygenRaw.records && oxygenRaw.records.length > 0) {
        addLog("📝 MẪU 1 BẢN GHI SpO2 THÔ:", oxygenRaw.records[0]);
      } else {
        addLog("⚠️ CẢNH BÁO: Không có dữ liệu SpO2 thô nào trong 3 ngày qua từ Android!");
      }

      // -------------------------------------------------------------
      // BƯỚC 3: MÔ PHỎNG MAP PAYLOAD LÀM TRÒN PHÚT (GIỐNG USEHEALTHCONNECT)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 3] Đang tiến hành gộp dữ liệu thành Payload...");
      const groupedMap: Record<string, any> = {};

      const addToMap = (time: string, fields: any) => {
        if (!time) return;
        const date = new Date(time);
        date.setSeconds(0, 0);
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
          };
        }

        const entry = groupedMap[timeKey];

        // Chuẩn hóa SpO2
        if (fields.blood_oxygen != null) {
          let oxyVal = Number(fields.blood_oxygen);
          if (oxyVal > 0 && oxyVal <= 1) oxyVal = Math.round(oxyVal * 100);
          if (oxyVal > 0) entry.blood_oxygen = oxyVal;
        }

        if (fields.sleep_duration != null) entry.sleep_duration += fields.sleep_duration;
        if (fields.raw_data) entry.raw_data = { ...entry.raw_data, ...fields.raw_data };
      };

      // Xử lý Giấc ngủ đưa vào map
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

      // Xử lý SpO2 đưa vào map
      oxygenRaw.records.forEach((r: any) => {
        const time = r.time || r.startTime;
        const oxyVal = r.percentage ?? r.level ?? null;
        addToMap(time, { blood_oxygen: oxyVal });
      });

      const finalPayload = Object.values(groupedMap).filter((item: any) => {
        return item.blood_oxygen != null || item.sleep_duration > 0;
      });

      addLog(`📦 KẾT QUẢ PAYLOAD SAU GỘP: Tổng số ${finalPayload.length} bản ghi chuẩn bị đẩy lên Server.`);

      const hasOxyInPayload = finalPayload.some(p => p.blood_oxygen !== null);
      addLog(`👉 Kiểm tra Payload: Có chứa SpO2 khác null không? => ${hasOxyInPayload ? "CÓ" : "KHÔNG"}`);

      if (finalPayload.length > 0) {
        addLog("📝 VÍ DỤ 2 BẢN GHI PAYLOAD GỬI ĐI:", finalPayload.slice(0, 2));
      }

      if (finalPayload.length === 0) {
        throw new Error("Dừng chẩn đoán: Không có dữ liệu hợp lệ trong Payload để gửi.");
      }

      // -------------------------------------------------------------
      // BƯỚC 4: BẮN DATA LÊN SERVER (POST /METRICS)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 4] Đang gửi POST API đưa data lên Server...");

      // Gửi theo cấu trúc chuẩn để khớp với server
      const syncResult = await api.syncMetrics({ data: finalPayload });
      addLog("✅ SERVER PHẢN HỒI KHI POST:", syncResult);

      // Chờ 1.5 giây để Server Render hoàn thành xử lý luồng ghi đè DB
      addLog("⏳ Đang nghỉ 1.5s chờ DB Server cập nhật ổn định...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      // -------------------------------------------------------------
      // BƯỚC 5: ĐỌC LẠI DATA TỪ SERVER VỀ (GET /METRICS)
      // -------------------------------------------------------------
      addLog("⏳ [BƯỚC 5] Đang gọi GET API truy vấn ngược lại data từ Server...");
      const serverData = await api.getMetrics({ range: 'day' });

      addLog("📊 DỮ LIỆU THỰC TẾ SERVER TRẢ VỀ:");
      addLog(`- Số lượng bản ghi raw_data trả về: ${serverData?.raw_data?.length || 0}`);
      addLog(`- Số lượng bản ghi daily_summary trả về: ${serverData?.daily_summary?.length || 0}`);

      if (serverData?.raw_data && serverData.raw_data.length > 0) {
        // Tìm xem trong đống raw_data server trả về có bản ghi nào chứa blood_oxygen không
        const recordsWithOxyOnServer = serverData.raw_data.filter((r: any) => r.blood_oxygen !== null);
        addLog(`- Số lượng bản ghi chứa SpO2 thực tế trên Server: ${recordsWithOxyOnServer.length}`);

        if (recordsWithOxyOnServer.length > 0) {
          addLog("🎉 THÀNH CÔNG! Bản ghi có SpO2 thực tế lấy từ Server xuống:", recordsWithOxyOnServer.slice(0, 2));
        } else {
          addLog("❌ LỖI: Server trả về mảng raw_data, nhưng TOÀN BỘ trường blood_oxygen đều là NULL!");
          addLog("👉 Gợi ý: Hãy kiểm tra xem file syncHealthData của Server đã được Deploy phiên bản sửa lỗi Batch-Upsert mới chưa.");
        }
      } else {
        addLog("⚠️ CẢNH BÁO: Server trả về mảng raw_data trống rỗng!");
      }

    } catch (err: any) {
      addLog(`🚨 ĐỨT GÃY TẠI LỖI: ${err.message}`);
    } finally {
      setLoading(false);
      addLog("=== 🏁 KẾT THÚC CHẨN ĐOÁN TOÀN LUỒNG ===");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HealthGuard Deep Diagnoser</Text>
      <Button title={loading ? "Đang Chẩn Đoán..." : "Chạy Chẩn Đoán Khép Kín"} onPress={runFullDiagnostics} disabled={loading} color="#E91E63" />

      {loading && <ActivityIndicator size="large" color="#E91E63" style={{ marginVertical: 10 }} />}

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
  container: { flex: 1, padding: 20, backgroundColor: '#1E1E1E', paddingTop: 50 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15, textAlign: 'center' },
  logContainer: { flex: 1, backgroundColor: '#000', borderRadius: 8, padding: 10, marginTop: 15 },
  logText: { fontFamily: 'monospace', fontSize: 11, color: '#00FF00', marginBottom: 6 },
  errorLog: { color: '#FF3333', fontWeight: 'bold' },
  successLog: { color: '#33FF33', fontWeight: 'bold' },
});