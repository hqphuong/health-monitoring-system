import prisma from '../lib/prisma.js';
<<<<<<< HEAD
import { evaluateHealthData } from '../services/alert.service.js';

export const syncHealthData = async (req, res) => {
    try {
        const { device_id, metrics } = req.body;
        const currentUserId = req.user.user_id; 

        // 1. KIỂM TRA PAYLOAD
        if (!device_id || !metrics || !Array.isArray(metrics) || metrics.length === 0) {
            return res.status(400).json({ status: "error", message: "Payload không hợp lệ." });
        }

        // 2. KIỂM TRA THIẾT BỊ
        const existingDevice = await prisma.device.findFirst({
            where: { device_id: device_id, user_id: currentUserId, status: "connected" }
        });
        if (!existingDevice) {
            return res.status(403).json({ status: "error", message: "Thiết bị chưa kết nối hoặc đã bị ngắt." });
        }

        // 3. FORMAT DỮ LIỆU ĐẦU VÀO (Khởi tạo dataToInsert ở đây)
        const dataToInsert = metrics.map((m) => ({
            user_id: currentUserId,
            record_time: new Date(m.record_time), 
            heart_rate: m.heart_rate || null,
            steps: m.steps || null,
            sleep_duration: m.sleep_duration || null,
            stress_level: m.stress_level || null,
            raw_data: m 
        }));

        // 4. BULK INSERT VÀO DATABASE
        await prisma.healthMetric.createMany({ data: dataToInsert });

        // 5. ĐÁNH GIÁ DỮ LIỆU VÀ KÍCH HOẠT CẢNH BÁO
        // 5.1 Lấy bản ghi mới nhất để đánh giá 
        const latestMetric = dataToInsert[dataToInsert.length - 1]; 

        // Lấy thông tin ngày sinh để tính tuổi
        const userProfile = await prisma.healthProfile.findFirst({
            where: { user_id: currentUserId }
        });

        // Tính tuổi thực tế
        let userAge = 25; // Tuổi mặc định
        if (userProfile && userProfile.birth) {
            const birthYear = new Date(userProfile.birth).getFullYear();
            const currentYear = new Date().getFullYear();
            userAge = currentYear - birthYear;
        }

        let finalAlert = { level: "NORMAL", message: "Các chỉ số cơ thể đang ở trạng thái an toàn." };
        let hasSOS = false;

        // 5.3 QUÉT TOÀN BỘ BẢN GHI TRONG MẢNG 
        for (const metric of dataToInsert) {
            const isResting = (!metric.steps || metric.steps < 50);
            
            // Khám từng bản ghi một
            const evaluation = evaluateHealthData(metric, userAge, isResting);
            // Nâng cấp mức độ cảnh báo nếu phát hiện nguy hiểm (SOS ưu tiên cao nhất)
            if (evaluation.level === "SOS") {
                finalAlert = evaluation; // Lấy lời nguyền của SOS
                hasSOS = true;
                break; 
            } 
            else if (evaluation.level === "WARNING" && finalAlert.level !== "SOS") {
                // Nếu chỉ là Warning, thì ghi nhận lại, nhưng vẫn khám tiếp xem ở dưới có SOS không
                finalAlert = evaluation; 
            }
        }

        let emergencyContacts = []; // Khởi tạo mảng chứa số điện thoại

        if (hasSOS) {

            // Rút danh sách Người liên hệ (Relative) từ Database
            const relatives = await prisma.relative.findMany({
                where: { user_id: currentUserId }
            });

            // Lấy ra danh sách các số điện thoại
            emergencyContacts = relatives.map(r => r.phone_num);

            // Ghi chép sự kiện vào sổ Nam Tào (Bảng Alert_Log)
            await prisma.alertLog.create({
                data: {
                    user_id: currentUserId,
                    type: "SOS_HEART_RATE",
                    trigger_heart_rate: latestMetric.heart_rate || 0,
                    is_sos_sent: true, 
                    alert_time: new Date()
                }
            });
        }

        // 6. TRẢ KẾT QUẢ VỀ CHO APP 
        return res.status(201).json({ 
            status: "success", 
            message: `Đã đồng bộ dữ liệu.`,
            alert: finalAlert,
            // Nếu là NORMAL/WARNING thì mảng này rỗng, nếu SOS thì có số điện thoại
            emergency_contacts: emergencyContacts 
        });

    } catch (error) {
        console.error(">>> LỖI SYNC DATA:", error);
=======

export const syncHealthData = async (req, res) => {
    try {
        const { data } = req.body;
        const currentUserId = req.user.user_id;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ status: "error", message: "Dữ liệu không hợp lệ." });
        }

        const chunkSize = 100;
        let totalProcessed = 0;

        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            
            await Promise.all(chunk.map(item => {
                const recordDate = new Date(item.record_time);
                return prisma.healthMetric.upsert({
                    where: {
                        user_id_record_time: {
                            user_id: currentUserId,
                            record_time: recordDate,
                        },
                    },
                    update: {
                        heart_rate: item.heart_rate ?? undefined,
                        steps: item.steps ?? undefined,
                        sleep_duration: item.sleep_duration ?? undefined,
                        blood_oxygen: item.blood_oxygen ?? undefined,
                        calories: item.calories ?? undefined,
                        distance: item.distance ?? undefined,
                        raw_data: item.raw_data ?? undefined,
                    },
                    create: {
                        user_id: currentUserId,
                        record_time: recordDate,
                        heart_rate: item.heart_rate,
                        steps: item.steps,
                        blood_oxygen: item.blood_oxygen,
                        calories: item.calories,
                        distance: item.distance,
                        sleep_duration: item.sleep_duration,
                        raw_data: item.raw_data,
                    },
                });
            }));
            totalProcessed += chunk.length;
        }

        return res.status(201).json({ status: "success", count: totalProcessed });
    } catch (error) {
>>>>>>> origin/FE
        return res.status(500).json({ status: "error", message: error.message });
    }
};

<<<<<<< HEAD

export const getHealthMetrics = async (req, res) => {
    try {
        const currentUserId = req.user.user_id; 
        
        // 1. Nhận các tham số lọc từ Query String (URL)
        // Ví dụ: /api/v1/metrics?days=7&limit=100
        const days = parseInt(req.query.days) || 7; // Mặc định lấy dữ liệu 7 ngày qua
        const limit = parseInt(req.query.limit) || 50; // Mặc định chỉ trả về 50 dòng mới nhất

        // 2. Tính toán mốc thời gian bắt đầu quét
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 3. Truy xuất Database
        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: currentUserId,
                record_time: {
                    gte: startDate // Lớn hơn hoặc bằng mốc thời gian (Greater than or equal)
                }
            },
            orderBy: {
                record_time: 'desc' // Sắp xếp giảm dần: Mới nhất nằm trên cùng
            },
            take: limit // Giới hạn số lượng trả về
        });

        // 4. Trả kết quả về cho App
        return res.status(200).json({ 
            status: "success", 
            message: `Lấy thành công ${metrics.length} bản ghi trong ${days} ngày qua.`,
            data: metrics 
        });

    } catch (error) {
        console.error(">>> LỖI GET METRICS:", error);
=======
export const getHealthMetrics = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { range = 'day' } = req.query;
        
        const now = new Date();
        let startDate = new Date();

        if (range === 'day') startDate.setDate(now.getDate() - 1); 
        else if (range === 'week') startDate.setDate(now.getDate() - 7);
        else if (range === 'month') startDate.setMonth(now.getMonth() - 1);

        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: currentUserId,
                record_time: { gte: startDate }
            },
            orderBy: { record_time: 'asc' }
        });

        const getLocalDate = (date) => {
            const d = new Date(date);
            d.setHours(d.getHours() + 7); 
            return d.toISOString().split('T')[0];
        };

        const groups = metrics.reduce((acc, curr) => {
            const date = getLocalDate(curr.record_time);
            if (!acc[date]) {
                acc[date] = { 
                    steps: 0, calories: 0, distance: 0, 
                    sleep_duration: 0, deep_sleep: 0, light_sleep: 0, rem_sleep: 0,
                    hr_samples: [], spo2_samples: [] 
                };
            }
            
            const g = acc[date];
            if (curr.steps) g.steps += curr.steps;
            if (curr.calories) g.calories += curr.calories;
            if (curr.distance) g.distance += curr.distance;
            
            if (curr.sleep_duration) {
                g.sleep_duration += curr.sleep_duration;
                const stage = curr.raw_data?.sleep_stages;
                if (stage === 5) g.deep_sleep += curr.sleep_duration;
                else if (stage === 4) g.light_sleep += curr.sleep_duration;
                else if (stage === 6) g.rem_sleep += curr.sleep_duration;
            }
            
            if (curr.heart_rate) g.hr_samples.push(curr.heart_rate);
            if (curr.blood_oxygen) g.spo2_samples.push(curr.blood_oxygen);
            
            return acc;
        }, {});

        const dailySummary = Object.keys(groups).map(date => {
            const day = groups[date];
            return {
                date,
                steps: day.steps,
                calories: Math.round(day.calories),
                distance: parseFloat(day.distance.toFixed(2)),
                sleep_hours: parseFloat((day.sleep_duration / 60).toFixed(1)),
                deep_sleep_hours: parseFloat((day.deep_sleep / 60).toFixed(1)),
                light_sleep_hours: parseFloat((day.light_sleep / 60).toFixed(1)),
                rem_sleep_hours: parseFloat((day.rem_sleep / 60).toFixed(1)),
                
                // --- NHỊP TIM ---
                avg_hr: day.hr_samples.length > 0 
                    ? Math.round(day.hr_samples.reduce((a, b) => a + b) / day.hr_samples.length) 
                    : 0,
                max_hr: day.hr_samples.length > 0 ? Math.max(...day.hr_samples) : 0,
                min_hr: day.hr_samples.length > 0 ? Math.min(...day.hr_samples) : 0,

                // --- OXY MÁU (BỔ SUNG ĐỂ VẼ BOX PLOT) ---
                avg_spo2: day.spo2_samples.length > 0 
                    ? Math.round(day.spo2_samples.reduce((a, b) => a + b) / day.spo2_samples.length) 
                    : 0,
                max_spo2: day.spo2_samples.length > 0 ? Math.max(...day.spo2_samples) : 0,
                min_spo2: day.spo2_samples.length > 0 ? Math.min(...day.spo2_samples) : 0,
            };
        });

        return res.status(200).json({
            status: "success",
            view_range: range,
            daily_summary: dailySummary,
            raw_data: metrics.map(m => ({
                ...m,
                sleep_stage: m.raw_data?.sleep_stages || null 
            }))
        });
    } catch (error) {
>>>>>>> origin/FE
        return res.status(500).json({ status: "error", message: error.message });
    }
};