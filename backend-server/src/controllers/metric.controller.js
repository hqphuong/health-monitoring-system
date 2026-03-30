import prisma from '../lib/prisma.js';
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
        return res.status(500).json({ status: "error", message: error.message });
    }
};