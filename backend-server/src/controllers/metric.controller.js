import prisma from '../lib/prisma.js';

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
                        // Sửa lỗi ghi đè: Chỉ cập nhật nếu có dữ liệu mới
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
        //console.error("❌ [Sync Error]:", error.message);
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const getHealthMetrics = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;
        const { range = 'day' } = req.query;
        
        const now = new Date();
        let startDate = new Date();

        // Mở rộng khoảng thời gian lấy dữ liệu để tab "Hôm nay" luôn có data ngày gần nhất
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

        // Hàm xử lý ngày chuẩn theo múi giờ địa phương (Việt Nam)
        const getLocalDate = (date) => {
            const d = new Date(date);
            d.setHours(d.getHours() + 7); // Cộng 7 tiếng để khớp giờ VN
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
                min_hr: day.hr_samples.length > 0 ? Math.min(...day.hr_samples) : 0
            };
        });

        return res.status(200).json({
            status: "success",
            view_range: range,
            daily_summary: dailySummary,
            // Trả về dữ liệu thô đã được map stage để Mobile vẽ Timeline mượt
            raw_data: metrics.map(m => ({
                ...m,
                sleep_stage: m.raw_data?.sleep_stages || null 
            }))
        });
    } catch (error) {
        //console.error("❌ Lỗi lấy Metrics:", error.message);
        return res.status(500).json({ status: "error", message: error.message });
    }
};