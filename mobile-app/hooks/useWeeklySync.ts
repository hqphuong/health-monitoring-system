import { useState } from 'react';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import api from '../services/api'; // Duy kiểm tra lại đường dẫn import này cho đúng cấu trúc folder dự án nhé

export function useWeeklySync() {
    const [loading, setLoading] = useState(false);

    const runWeeklySync = async () => {
        setLoading(true);

        try {
            // -------------------------------------------------------------
            // BƯỚC 1: KHỞI TẠO SDK & ĐỊNH NGHĨA MẢNG QUYỀN CHUẨN ĐỂ TRÁNH LỖI BIÊN DỊCH ARGUMENTS
            // -------------------------------------------------------------
            await initialize();

            const PERMISSIONS_LIST = [
                { accessType: 'read', recordType: 'OxygenSaturation' },
                { accessType: 'read', recordType: 'SleepSession' },
                { accessType: 'read', recordType: 'HeartRate' },
                { accessType: 'read', recordType: 'Steps' },
                { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
                { accessType: 'read', recordType: 'Distance' },
            ] as any[];

            await requestPermission(PERMISSIONS_LIST);

            // Thiết lập khoảng thời gian lùi đúng 30 ngày tính từ thời điểm hiện tại
            const now = new Date();
            const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const endTime = now.toISOString();
            const filter = {
                timeRangeFilter: { operator: 'between', startTime, endTime },
                pageSize: 10000
            };

            // -------------------------------------------------------------
            // BƯỚC 2: ĐỌC DỮ LIỆU THÔ TỪ SDK (PHÁT HIỆN SỐ LƯỢNG ĐẦU VÀO)
            // -------------------------------------------------------------
            const [oxygenRaw, sleepRaw, heartRaw, stepsRaw, caloriesRaw, distanceRaw] = await Promise.all([
                readRecords('OxygenSaturation', filter as any),
                readRecords('SleepSession', filter as any),
                readRecords('HeartRate', filter as any),
                readRecords('Steps', filter as any),
                readRecords('ActiveCaloriesBurned', filter as any),
                readRecords('Distance', filter as any),
            ]);

            // -------------------------------------------------------------
            // BƯỚC 3: MÁY NGHIỀN DATA THEO PHÚT (BÓC TÁCH MẢNG SAMPLES CON)
            // -------------------------------------------------------------
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

            if (finalPayload.length === 0) {
                throw new Error("Không có dữ liệu biến động hợp lệ nào trong 30 ngày qua để thực hiện sync!");
            }

            // -------------------------------------------------------------
            // BƯỚC 4: BẮN PAYLOAD MẢNG CHUẨN LÊN SERVER (POST /METRICS)
            // -------------------------------------------------------------
            await api.syncMetrics({ data: finalPayload });

            // Tạm nghỉ 2 giây chờ hệ thống phía Backend xử lý hoàn tất Batch
            await new Promise(resolve => setTimeout(resolve, 2000));

            // -------------------------------------------------------------
            // BƯỚC 5: ĐỌC NGƯỢC KIỂM TRA CHỈ SỐ THỰC TẾ ĐÃ LƯU TRÊN DB SERVER
            // -------------------------------------------------------------
            await api.getMetrics({ range: 'month' });

        } catch (err: any) {
            console.error("🚨 [useWeeklySync Sync Error]:", err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        runWeeklySync,
        loading
    };
}