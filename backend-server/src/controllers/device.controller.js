import prisma from '../lib/prisma.js';

export const getDevices = async (req, res) => {
    try {
        const devices = await prisma.device.findMany({
            where: { user_id: req.user.user_id },
            orderBy: { last_sync_time: 'desc' }
        });
        return res.status(200).json({ status: "success", data: devices });
    }
    catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }       
};

export const connectDevice = async (req, res) => {
    try {
        const { device_id, provider } = req.body;

        if (!device_id || !provider) {
            return res.status(400).json({ status: "error", message: "Thiếu thông tin device_id hoặc provider." });
        }

        // 1. Kiểm tra xem thiết bị này đã từng kết nối chưa
        const existingDevice = await prisma.device.findUnique({
            where: { device_id }
        });

        if (existingDevice) {
            // Nếu là của người khác thì báo lỗi bảo mật
            if (existingDevice.user_id !== req.user.user_id) {
                return res.status(403).json({ status: "error", message: "Thiết bị này đã được kết nối với tài khoản khác." });
            }
            
            // NẾU LÀ CỦA MÌNH: Cập nhật lại trạng thái thành 'connected' phòng trường hợp đang bị 'disconnected'
            const reactivatedDevice = await prisma.device.update({
                where: { device_id },
                data: { status: "connected" } 
            });

            return res.status(200).json({ 
                status: "success", 
                message: "Đã kết nối lại thiết bị thành công.", 
                data: reactivatedDevice 
            });
        }

        // 2. Nếu là thiết bị hoàn toàn mới -> Tạo mới
        const newDevice = await prisma.device.create({
            data: {
                user_id: req.user.user_id,
                device_id,
                provider,
                status: "connected" 
            }
        });

        return res.status(201).json({ 
            status: "success", 
            message: "Kết nối thiết bị mới thành công.", 
            data: newDevice 
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const disconnectDevice = async (req, res) => {
    try {
        const { device_id } = req.params; 

        // 1. Phải kiểm tra đúng thiết bị và đúng chủ sở hữu
        const existingDevice = await prisma.device.findFirst({
            where: { device_id: device_id, user_id: req.user.user_id }
        });

        if (!existingDevice) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy thiết bị hoặc bạn không có quyền ngắt kết nối." });
        }

        const disconnectedDevice = await prisma.device.update({
            where: { device_id: device_id },
            data: { status: "disconnected" } 
        });

        return res.status(200).json({ 
            status: "success", 
            message: "Đã ngắt kết nối thiết bị an toàn. Bạn có thể kết nối lại bất cứ lúc nào.",
            data: disconnectedDevice
        });
    }
    catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const updateDeviceStatus = async (req, res) => {
    try {
        const { device_id } = req.params;
        const { status } = req.body; // status có thể là "connected", "disconnected", "offline"

        if (!status) {
            return res.status(400).json({ status: "error", message: "Vui lòng truyền lên trạng thái (status)." });
        }

        const existingDevice = await prisma.device.findFirst({
            where: { device_id: device_id, user_id: req.user.user_id }
        });

        if (!existingDevice) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy thiết bị." });
        }

        const updatedDevice = await prisma.device.update({
            where: { device_id: device_id },
            data: { status: status }
        });

        return res.status(200).json({ status: "success", message: `Đã cập nhật trạng thái thành ${status}`, data: updatedDevice });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};