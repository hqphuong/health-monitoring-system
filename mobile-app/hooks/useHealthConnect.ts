import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import api from '../services/api';

export function useHealthConnect() {
  const [loading, setLoading] = useState(false);

  const syncHealthData = useCallback(async (daysToFetch: number = 30) => {
    if (Platform.OS !== 'android') return false;
    setLoading(true);

    try {
      // 1. Khởi tạo và xin quyền toàn diện
      await initialize();
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'OxygenSaturation' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'Distance' },
        { accessType: 'read', recordType: 'SleepSession' },
      ]);

      const now = new Date();
      // Mốc thời gian vét cạn (mặc định 30 ngày, Duy có thể tăng lên)
      const startTime = new Date(now.getTime() - daysToFetch * 24 * 60 * 60 * 1000).toISOString();
      const endTime = now.toISOString();
      const filter = { timeRangeFilter: { operator: 'between', startTime, endTime } };

      console.log(`🚀 [Sync] Bắt đầu vét dữ liệu từ: ${startTime}`);

      // 2. Fetch toàn bộ dữ liệu thô từ Health Connect
      const [steps, heart, oxygen, calories, distance, sleepSessions] = await Promise.all([
        readRecords('Steps', filter as any),
        readRecords('HeartRate', filter as any),
        readRecords('OxygenSaturation', filter as any),
        readRecords('ActiveCaloriesBurned', filter as any),
        readRecords('Distance', filter as any),
        readRecords('SleepSession', filter as any),
      ]);

      const groupedMap: Record<string, any> = {};

      // 3. Hàm gộp dữ liệu theo phút (Làm tròn giây về 0 để khớp @@unique của Duy)
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
            raw_data: {} 
          };
        }

        const entry = groupedMap[timeKey];

        // Cộng dồn các chỉ số vận động
        if (fields.steps) entry.steps += fields.steps;
        if (fields.calories) entry.calories += fields.calories;
        if (fields.distance) entry.distance += fields.distance;
        if (fields.sleep_duration) entry.sleep_duration += fields.sleep_duration;

        // Cập nhật các chỉ số sinh học
        if (fields.heart_rate) entry.heart_rate = fields.heart_rate;
        if (fields.blood_oxygen) entry.blood_oxygen = fields.blood_oxygen;

        // Gộp raw_data để chứa stages
        if (fields.raw_data) {
          entry.raw_data = { ...entry.raw_data, ...fields.raw_data };
        }
      };

      // 4. XỬ LÝ NHỊP TIM (Lấy từng điểm đo nhỏ nhất)
      heart.records.forEach((record: any) => {
        if (record.samples) {
          record.samples.forEach((sample: any) => {
            addToMap(sample.time, { heart_rate: sample.beatsPerMinute });
          });
        }
      });

      // 5. XỬ LÝ GIẤC NGỦ CHUYÊN SÂU (Deep, REM, Light, Awake)
      sleepSessions.records.forEach((session: any) => {
        if (session.stages && session.stages.length > 0) {
          // Bóc tách từng phân đoạn nhỏ
          session.stages.forEach((stage: any) => {
            const s = new Date(stage.startTime).getTime();
            const e = new Date(stage.endTime).getTime();
            const durationInMinutes = Math.round((e - s) / 60000);

            addToMap(stage.startTime, { 
              sleep_duration: durationInMinutes,
              raw_data: { sleep_stages: stage.stage } 
              // 5: Deep, 6: REM, 4: Light, 1: Awake
            });
          });
        } else {
          // Nếu không có stages, lấy session tổng
          const s = new Date(session.startTime).getTime();
          const e = new Date(session.endTime).getTime();
          addToMap(session.startTime, { 
            sleep_duration: Math.round((e - s) / 60000) 
          });
        }
      });

      // 6. XỬ LÝ CÁC CHỈ SỐ KHÁC
      steps.records.forEach((r: any) => addToMap(r.startTime, { steps: r.count }));
      oxygen.records.forEach((r: any) => addToMap(r.time, { blood_oxygen: r.percentage }));
      calories.records.forEach((r: any) => addToMap(r.startTime, { calories: r.energy.inKilocalories }));
      distance.records.forEach((r: any) => addToMap(r.startTime, { distance: r.distance.inMeters }));

      // 7. Tạo Payload cuối cùng (Lọc sạch các bản ghi rỗng)
      const finalPayload = Object.values(groupedMap).filter((item: any) => {
        return item.steps > 0 || item.heart_rate || item.blood_oxygen || item.calories > 0 || item.sleep_duration > 0;
      });

      // --- 8. CONSOLE LOG KIỂM TRA CẤU TRÚC ---
      console.log("------------------------------------------");
      console.log(`📊 Tổng số phút có dữ liệu: ${finalPayload.length}`);
      
      const sleepCheck = finalPayload.filter(p => p.raw_data?.sleep_stages);
      if (sleepCheck.length > 0) {
        console.log(`✅ Đã tìm thấy ${sleepCheck.length} phân đoạn giấc ngủ chi tiết.`);
        const stageMap: any = { 1: "Thức", 4: "Nông", 5: "Sâu", 6: "REM" };
        // In thử 3 phân đoạn đầu tiên
        sleepCheck.slice(0, 3).forEach(s => {
          console.log(`   - Stage: ${stageMap[s.raw_data.sleep_stages]} | Phút: ${s.sleep_duration} | Lúc: ${s.record_time}`);
        });
      } else {
        console.log("⚠️ Cảnh báo: Huawei không trả về Stages chi tiết cho giai đoạn này.");
      }
      console.log("------------------------------------------");

      // 9. Đẩy dữ liệu lên Server
      if (finalPayload.length > 0) {
        const response = await api.syncMetrics({ data: finalPayload });
        console.log(`🚀 [Server] Đồng bộ thành công: ${response.count} dòng.`);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("❌ [Sync Error]:", error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { syncHealthData, loading };
}