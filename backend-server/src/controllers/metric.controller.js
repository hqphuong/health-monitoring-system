import prisma from '../lib/prisma.js';

export const syncHealthData = async (req, res) => {
    console.log("==================================================");
    console.log("🚀 [SYNC START] Nhận request từ Mobile...");

    try {
        const { data } = req.body;
        // Sử dụng ID test của Duy hoặc ID từ token
        const currentUserId = req.user?.user_id || "1bfbf31a-81ae-4fb5-9222-78e6576d8d5f"; 

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ status: "error", message: "Dữ liệu không hợp lệ." });
        }

        // --- BƯỚC 1: LƯU DATABASE ---
        const chunkSize = 100;
        let totalProcessed = 0;
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await Promise.all(chunk.map(item => {
                const recordDate = new Date(item.record_time);
                return prisma.healthMetric.upsert({
                    where: { user_id_record_time: { user_id: currentUserId, record_time: recordDate } },
                    update: { heart_rate: item.heart_rate ?? undefined }, // Duy bổ sung các field khác tại đây
                    create: { 
                        user_id: currentUserId, 
                        record_time: recordDate, 
                        heart_rate: item.heart_rate 
                    },
                });
            }));
            totalProcessed += chunk.length;
        }
        console.log(`✅ [DB] Đã lưu xong ${totalProcessed} mẫu.`);

        // --- BƯỚC 2: TRUY VẤN LẠI DB ĐỂ LẤY SỐ 188 ---
        const dbMetrics = await prisma.healthMetric.findMany({
            where: { user_id: currentUserId },
            orderBy: { record_time: 'desc' },
            take: 50 
        });

        const heartRates = dbMetrics.filter(m => m.heart_rate !== null).map(m => m.heart_rate);
        const maxHR = heartRates.length > 0 ? Math.max(...heartRates) : 0;
        console.log(`📊 [CHECK] Nhịp tim cao nhất hiện tại: ${maxHR} BPM`);

        // --- BƯỚC 3: AI & SOCKET ALERT (CÁI MIỆNG) ---
        // Giả lập gọi AI hoặc logic nhịp tim nguy hiểm
        // --- BƯỚC 3: AI & SOCKET ALERT (CÁI MIỆNG) ---
if (maxHR > 150) {
    console.log("🚨 [CRITICAL] Phát hiện nhịp tim nguy hiểm!");

    const io = req.app.get('io'); 
    if (io) {
        // 1. Bắn cảnh báo cho chính người bệnh (Duy)
        const patientRoom = `user_${currentUserId}`;
        io.to(patientRoom).emit("emergency_alert", {
            level: "SOS",
            heart_rate: maxHR,
            message: "CẢNH BÁO: Nhịp tim của bạn đang ở mức báo động!",
            timestamp: new Date().toISOString()
        });
        console.log(`📡 [SOCKET] Đã bắn SOS tới người bệnh: ${patientRoom}`);

        // 2. TÌM NGƯỜI THÂN VÀ BẮN THÔNG BÁO CHO HỌ
        const primaryContact = await prisma.relative.findFirst({ 
            where: { user_id: currentUserId, is_primary: true } 
        });

        if (primaryContact) {
            // Dùng relative_id làm tên phòng để bắn Socket tới máy người thân
            const relativeRoom = `user_${primaryContact.relative_id}`;
            
            io.to(relativeRoom).emit("relative_warning", {
                type: "PATIENT_SOS",
                patient_name: "Nguyễn Quốc Duy", // Bạn có thể query tên từ bảng Profile nếu cần
                heart_rate: maxHR,
                message: `CẢNH BÁO: Người thân của bạn đang có nhịp tim bất thường (${maxHR} BPM)!`,
                timestamp: new Date().toISOString()
            });

            console.log(`📢 [SOCKET] Đã báo động tới máy người thân: ${primaryContact.contact_name} (Room: ${relativeRoom})`);
            console.log(`📞 Số điện thoại liên hệ: ${primaryContact.phone_num}`);
        } else {
            console.log("⚠️ [SOS] Phát hiện nguy hiểm nhưng user chưa cài đặt người thân chính.");
        }

        // 3. LƯU LẠI LỊCH SỬ CẢNH BÁO (Để làm báo cáo Module B)
        await prisma.alertLog.create({
            data: {
                user_id: currentUserId,
                type: "SOS",
                trigger_heart_rate: maxHR,
                alert_time: new Date(),
                message: primaryContact 
                    ? `Đã gửi cảnh báo tới người thân: ${primaryContact.contact_name}` 
                    : "Cảnh báo hệ thống: Không tìm thấy người thân để liên hệ."
            }
        });
    } else {
        console.error("❌ [SOCKET ERROR] Không tìm thấy instance 'io'.");
    }
}

        return res.status(201).json({ status: "success", count: totalProcessed });
    } catch (error) {
        console.error("❌ [SERVER ERROR]:", error.message);
        return res.status(500).json({ status: "error", message: error.message });
    }
};

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
                
                avg_hr: day.hr_samples.length > 0 
                    ? Math.round(day.hr_samples.reduce((a, b) => a + b) / day.hr_samples.length) 
                    : 0,
                max_hr: day.hr_samples.length > 0 ? Math.max(...day.hr_samples) : 0,
                min_hr: day.hr_samples.length > 0 ? Math.min(...day.hr_samples) : 0,

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
        return res.status(500).json({ status: "error", message: error.message });
    }
};