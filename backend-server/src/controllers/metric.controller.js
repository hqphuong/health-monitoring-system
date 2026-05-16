import prisma from '../lib/prisma.js';

/**
 * ĐỒNG BỘ DỮ LIỆU TỪ MOBILE LÊN SERVER
 * Khắc phục lỗi: Thay thế toán tử `?? undefined` bằng kiểm tra điều kiện tường minh
 * để tránh việc giá trị `null` từ mobile triệt tiêu dữ liệu cũ đã tồn tại trong DB khi upsert.
 */
export const syncHealthData = async (req, res) => {
    try {
        const { data } = req.body;
        // Hỗ trợ ID mặc định để test hoặc lấy từ middleware auth
        const currentUserId = req.user?.user_id || "1bfbf31a-81ae-4fb5-9222-78e6576d8d5f";

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ status: "error", message: "Dữ liệu không hợp lệ." });
        }

        console.log(`📥 [SYNC] Nhận ${data.length} bản ghi. Đang xử lý upsert...`);

        // Sử dụng Promise.all để xử lý bất đồng bộ song song nhằm tối ưu hiệu năng
        await Promise.all(data.map(item => {
            const recordDate = new Date(item.record_time);
            return prisma.healthMetric.upsert({
                where: {
                    user_id_record_time: {
                        user_id: currentUserId,
                        record_time: recordDate,
                    },
                },
                update: {
                    // CHỈ cập nhật nếu có dữ liệu thực (khác null/0), nếu null thì truyền undefined để Prisma giữ nguyên giá trị hiện tại trong DB
                    heart_rate: item.heart_rate !== null ? Number(item.heart_rate) : undefined,
                    steps: (item.steps !== null && item.steps > 0) ? Number(item.steps) : undefined,
                    sleep_duration: (item.sleep_duration !== null && item.sleep_duration > 0) ? Number(item.sleep_duration) : undefined,
                    blood_oxygen: (item.blood_oxygen !== null && item.blood_oxygen > 0) ? Number(item.blood_oxygen) : undefined,
                    calories: (item.calories !== null && item.calories > 0) ? Number(item.calories) : undefined,
                    distance: (item.distance !== null && item.distance > 0) ? Number(item.distance) : undefined,
                    raw_data: item.raw_data ?? undefined,
                },
                create: {
                    user_id: currentUserId,
                    record_time: recordDate,
                    heart_rate: item.heart_rate !== null ? Number(item.heart_rate) : null,
                    steps: item.steps !== null ? Number(item.steps) : 0,
                    blood_oxygen: item.blood_oxygen !== null ? Number(item.blood_oxygen) : null,
                    calories: item.calories !== null ? Number(item.calories) : 0,
                    distance: item.distance !== null ? Number(item.distance) : 0,
                    sleep_duration: item.sleep_duration !== null ? Number(item.sleep_duration) : 0,
                    raw_data: item.raw_data ?? {},
                },
            });
        }));

        console.log(`✅ [SYNC DONE] User: ${currentUserId} đã đồng bộ thành công.`);
        return res.status(201).json({ status: "success", count: data.length });
    } catch (error) {
        console.error("❌ [SYNC ERROR]:", error.message);
        return res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * LẤY DỮ LIỆU VÀ TÍNH TOÁN SUMMARY CHO UI
 * Khắc phục lỗi: Loại bỏ logic cộng đúp giờ thủ công (+7), sử dụng toLocaleDateString 
 * với múi giờ 'Asia/Ho_Chi_Minh' để nhóm dữ liệu (grouping) chính xác theo ngày Việt Nam.
 */
export const getHealthMetrics = async (req, res) => {
    try {
        const currentUserId = req.user?.user_id || "1bfbf31a-81ae-4fb5-9222-78e6576d8d5f";
        const { range = 'day' } = req.query;

        const now = new Date();
        let startDate = new Date();

        // Cấu hình mốc thời gian lấy dữ liệu
        if (range === 'day') {
            startDate.setHours(now.getHours() - 36); // Lấy dư 36 tiếng để cover hết múi giờ toàn cầu
        } else if (range === 'week') {
            startDate.setDate(now.getDate() - 8);
        } else if (range === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        }

        const metrics = await prisma.healthMetric.findMany({
            where: {
                user_id: currentUserId,
                record_time: { gte: startDate }
            },
            orderBy: { record_time: 'asc' }
        });

        // Hàm helper chuyển đổi múi giờ sang Việt Nam (định dạng YYYY-MM-DD chuẩn ISO vùng)
        const getLocalDate = (date) => {
            const d = new Date(date);
            return d.toLocaleDateString('fr-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
        };

        const groups = metrics.reduce((acc, curr) => {
            const date = getLocalDate(curr.record_time);

            const sleepDateObj = new Date(curr.record_time);
            sleepDateObj.setHours(sleepDateObj.getHours() + 12);
            const sleepDate = getLocalDate(sleepDateObj);

            const timeKey = new Date(curr.record_time).getTime();

            if (!acc[date]) {
                acc[date] = {
                    stepsSet: new Map(),
                    caloriesSet: new Map(),
                    sleep: 0, deep: 0, hr: [], oxy: []
                };
            }
            if (!acc[sleepDate]) {
                acc[sleepDate] = {
                    stepsSet: new Map(),
                    caloriesSet: new Map(),
                    sleep: 0, deep: 0, hr: [], oxy: []
                };
            }

            const g = acc[date];

            // 1. Chống trùng lặp Vận động (Steps/Calories): Đè giá trị dựa trên mốc thời gian duy nhất
            if (curr.steps) g.stepsSet.set(timeKey, Number(curr.steps));
            if (curr.calories) g.caloriesSet.set(timeKey, Number(curr.calories));

            // 2. Thu thập mẫu Nhịp tim
            if (curr.heart_rate) g.hr.push(Number(curr.heart_rate));

            // 3. Thu thập mẫu SpO2 và ép kiểu nghiêm ngặt kèm kiểm tra khoảng giá trị
            const oxyVal = curr.blood_oxygen != null ? Number(curr.blood_oxygen) : null;
            if (oxyVal && oxyVal > 0) {
                // Tự động chuẩn hóa nếu data thô trả về dạng thập phân hệ số 1 (Ví dụ: 0.98 -> 98)
                const fixedOxy = oxyVal <= 1 ? Math.round(oxyVal * 100) : oxyVal;
                g.oxy.push(fixedOxy);
            }

            // 4. Xử lý tích lũy thời gian giấc ngủ (Sử dụng cấu trúc sleepDate đã điều hướng)
            if (curr.sleep_duration) {
                const dur = Number(curr.sleep_duration);
                acc[sleepDate].sleep += dur;
                const stage = curr.raw_data?.sleep_stages;
                if (stage === 5) acc[sleepDate].deep += dur; // Giai đoạn ngủ sâu (Deep Sleep)
            }

            return acc;
        }, {});
        const dailySummary = Object.keys(groups).map(date => {
            const day = groups[date];

            // Tính toán tổng cuối cùng từ Map thực tế (đã loại bỏ sạch trùng lặp ngầm từ Mobile gửi lên)
            const totalSteps = Array.from(day.stepsSet.values()).reduce((a, b) => a + b, 0);
            const totalCals = Array.from(day.caloriesSet.values()).reduce((a, b) => a + b, 0);

            return {
                date,
                steps: totalSteps,
                calories: Math.round(totalCals),
                sleep_hours: parseFloat((day.sleep / 60).toFixed(1)),
                deep_sleep_hours: parseFloat((day.deep / 60).toFixed(1)),

                // Thống kê nhịp tim tổng quan trong ngày
                avg_hr: day.hr.length ? Math.round(day.hr.reduce((a, b) => a + b) / day.hr.length) : 0,
                max_hr: day.hr.length ? Math.max(...day.hr) : 0,
                min_hr: day.hr.length ? Math.min(...day.hr) : 0,

                // Thống kê Oxy máu tổng quan trong ngày (Hỗ trợ Box Plot trên biểu đồ giao diện)
                avg_spo2: day.oxy.length ? Math.round(day.oxy.reduce((a, b) => a + b) / day.oxy.length) : 0,
                max_spo2: day.oxy.length ? Math.max(...day.oxy) : 0,
                min_spo2: day.oxy.length ? Math.min(...day.oxy) : 0,
            };
        });

        return res.status(200).json({
            status: "success",
            view_range: range,
            daily_summary: dailySummary,
            raw_data: metrics.map(m => ({
                ...m,
                // Đảm bảo dữ liệu SpO2 thô luôn được ép kiểu số cho UI xử lý đồng bộ
                blood_oxygen: m.blood_oxygen != null ? Number(m.blood_oxygen) : null,
                sleep_stage: m.raw_data?.sleep_stages || null
            }))
        });
    } catch (error) {
        console.error("❌ [GET METRICS ERROR]:", error.message);
        return res.status(500).json({ status: "error", message: error.message });
    }
};