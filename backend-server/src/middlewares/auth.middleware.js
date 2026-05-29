import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const verifyToken = (req, res, next) => {
    try {
        // 1. Lấy Token từ HTTP Header (Authorization)
        // Định dạng chuẩn mà App Mobile gửi lên sẽ là: "Bearer chuoi_token"
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                status: "error", 
                message: "Truy cập bị từ chối. Vui lòng đăng nhập!" 
            });
        }

        // 2. Cắt bỏ chữ "Bearer " để lấy đúng cái chuỗi token 
        const token = authHeader.split(' ')[1];

        // 3. Đưa cho jwt kiểm tra xem token có hợp lệ/hết hạn không
        // Chìa khóa JWT_SECRET phải khớp 100% với chìa khóa tạo token ở hàm Login
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Nếu thành công, gắn thông tin user vào Request để Controller phía sau xài
        req.user = decoded;

        // 5. BẢO VỆ MỞ CỬA CHO ĐI TIẾP VÀO CONTROLLER
        next(); 

    } catch (error) {
        // Nếu token hết hạn hoặc bị App Mobile làm giả mạo
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: "error", message: "Phiên đăng nhập đã hết hạn." });
        }
        return res.status(403).json({ status: "error", message: "Token không hợp lệ." });
    }
};

export const checkProfileComplete = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const profile = await prisma.healthProfile.findUnique({
            where: { user_id: userId }
        });

        // Kiểm tra xem các trường bắt buộc có bị null không
        if (!profile || !profile.birth || !profile.weight || !profile.height) {
            return res.status(403).json({
                status: "error",
                code: "PROFILE_INCOMPLETE",
                message: "Vui lòng hoàn thiện hồ sơ sức khỏe (chiều cao, cân nặng, ngày sinh) để hệ thống có thể phân tích chính xác."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Lỗi kiểm tra hồ sơ " + error.message });
    }
};