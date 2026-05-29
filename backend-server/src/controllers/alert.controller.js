import prisma from '../lib/prisma.js';

export const getAlerts = async (req, res) => {
    try {
        const currentUserId = req.user.user_id;

        // Lấy danh sách alert logs cho user hiện tại, sắp xếp mới nhất lên đầu
        const alerts = await prisma.alertLog.findMany({
            where: { user_id: currentUserId },
            orderBy: { alert_time: 'desc' }
        });

        return res.status(200).json({ 
            status: "success", 
            message: "Lấy lịch sử cảnh báo thành công.",
            data: alerts 
        });

    } catch (error) {
        //console.error(">>> LỖI GET ALERTS:", error);
        return res.status(500).json({ status: "error", message: error.message });
    }
};
