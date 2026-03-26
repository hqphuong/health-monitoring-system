import prisma from '../lib/prisma.js';


export const getHealthProfile = async (req, res) => {
    try {
        // Kiểm tra xem req.user có tồn tại không để tránh crash server
        if (!req.user) {
            return res.status(401).json({ error: "Không tìm thấy thông tin xác thực người dùng" });
        }

        const profile = await prisma.healthProfile.findUnique({
            where: { user_id: req.user.user_id } 
        });

        if (!profile) {
            return res.status(404).json({ message: "Người dùng chưa tạo hồ sơ sức khỏe" });
        }

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateHealthProfile = async (req, res) => {
    const { bloodType, height, weight, allergies, chronicDiseases, currentMedication } = req.body;
    try {
        const profile = await prisma.healthProfile.upsert({
            where: { user_id: req.user.user_id },
            update: { bloodType, height, weight, allergies, chronicDiseases, currentMedication },
            create: { 
                user_id: req.user.user_id, 
                bloodType, height, weight, allergies, chronicDiseases, currentMedication 
            },
        });
        res.status(200).json({ message: "Cập nhật thành công", data: profile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};