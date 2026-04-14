import prisma from '../lib/prisma.js';

/**
 * 1. ĐỒNG BỘ DỮ LIỆU THỰC TỪ APP
 */
export const syncHealthData = async (req, res) => {
    try {
        const { data } = req.body; 
        const currentUserId = req.user.user_id;

        console.log(`\n--- [SYNC] Nhận ${data?.length || 0} bản ghi từ Flutter ---`);

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ status: "error", message: "Dữ liệu không hợp lệ." });
        }

        const dataToInsert = data.map((item) => ({
            user_id: currentUserId,
            record_time: new Date(item.time),
            heart_rate: item.type === 'HEART_RATE' ? Math.round(parseFloat(item.value)) : null,
            steps: item.type === 'STEPS' ? parseInt(item.value) : null,
            sleep_duration: item.type === 'SLEEP_ASLEEP' ? parseInt(item.value) : null,
            raw_data: item 
        }));

        // Sử dụng createMany và skipDuplicates để tránh lỗi nếu sync trùng record_time
        const result = await prisma.healthMetric.createMany({
            data: dataToInsert,
            skipDuplicates: true
        });

        console.log(`✅ Đã lưu mới thành công ${result.count} bản ghi.`);
        return res.status(201).json({ status: "success", count: result.count });

    } catch (error) {
        console.error("❌ Lỗi Sync:", error.message);
        return res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * 2. LẤY DỮ LIỆU LÀM BIỂU ĐỒ (Hỗ trợ Gom nhóm)
 */
export const getHealthMetrics = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const days = parseInt(req.query.days) || 30; 
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Lấy dữ liệu thô
        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: currentUserId,
                record_time: { gte: startDate }
            },
            orderBy: { record_time: 'asc' }
        });

        // --- LOG PHÂN TÍCH ---
        console.log("\n--- [GET CHART DATA] ---");
        console.log(`✅ Đọc được ${metrics.length} bản ghi.`);

        // Gom nhóm theo ngày để Console Log xem có đủ cột làm biểu đồ không
        const dailySummary = metrics.reduce((acc, curr) => {
            const date = curr.record_time.toISOString().split('T')[0];
            if (!acc[date]) acc[date] = { steps: 0, hr_points: 0 };
            if (curr.steps) acc[date].steps += curr.steps;
            if (curr.heart_rate) acc[date].hr_points += 1;
            return acc;
        }, {});

        console.log("📅 Thống kê cột biểu đồ (Ngày: {Tổng bước, Số điểm nhịp tim}):");
        console.log(dailySummary);

        return res.status(200).json({
            status: "success",
            count: metrics.length,
            daily_summary: dailySummary, // Trả thêm cái này cho frontend dễ vẽ
            data: metrics
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * 3. HÀM TẠO DỮ LIỆU GIẢ (Để test biểu đồ ngay lập tức)
 * Gọi API này 1 lần: GET /api/v1/metrics/seed-mock
 */
export const seedMockData = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const mockData = [];
        
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            mockData.push({
                user_id: currentUserId,
                record_time: date,
                heart_rate: Math.floor(Math.random() * (90 - 60 + 1)) + 60,
                steps: Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000,
                raw_data: { info: "Dữ liệu giả lập để test biểu đồ" }
            });
        }

        await prisma.healthMetric.createMany({ data: mockData });
        res.status(201).json({ message: "Đã tạo 30 ngày dữ liệu giả thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};