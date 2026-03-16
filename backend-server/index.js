const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Khởi tạo các công cụ
const prisma = new PrismaClient();
const app = express();

// Cấu hình trung gian (Middleware)
app.use(cors()); // Cho phép Mobile App gọi API không bị chặn
app.use(express.json()); // Giúp server đọc hiểu được cục JSON của FE bắn lên

// ==========================================
// API 1: Kiểm tra máy chủ (Ping-Pong)
// ==========================================
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Pong! Server HealthGuard đang chạy cực bốc!' });
});

// ==========================================
// API 2: Nhận dữ liệu nhịp tim (Theo đúng Hợp đồng Postman)
// ==========================================
app.post('/api/v1/health-data/sync', async (req, res) => {
    try {
        const data = req.body; // Hứng nguyên cục JSON FE gửi lên
        
        // In ra màn hình Terminal để Tech Lead kiểm tra
        console.log("📥 [CÓ BIẾN] FE vừa bắn dữ liệu lên:");
        console.log(JSON.stringify(data, null, 2));

        // TODO: Lát nữa chúng ta sẽ viết code Prisma nhét data này vào PostgreSQL ở đây

        // Trả về kết quả đúng y chang bản Example trên Postman
        res.status(200).json({
            message: "Health data synced successfully",
            synced_records: data.metrics ? data.metrics.length : 0
        });
    } catch (error) {
        console.error("Lỗi ập đến:", error);
        res.status(500).json({ error: "Máy chủ đang bốc khói!" });
    }
});

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đã cất tiếng khóc chào đời tại http://localhost:${PORT}`);
});