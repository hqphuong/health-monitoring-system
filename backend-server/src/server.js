import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import prisma from './lib/prisma.js';
import { pushToQueue } from './queue.js';
import { processMetricJob } from './worker.js';
import apiRoutes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';

const app = express();
const server = http.createServer(app);

// 🔥 setup socket
const io = new Server(server, {
    cors: { origin: "*" }
});
app.set('io', io);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// REST API
app.use('/api/v1', apiRoutes);

// Swagger
setupSwagger(app);

// SOCKET LOGIC
io.on('connection', (socket) => {

    socket.on('start_session', async ({ user_id }) => {
        console.log(`✅ [SOCKET] Nhận yêu cầu start_session từ user: ${user_id}`);
        socket.data.user_id = user_id;
        socket.join(`user_${user_id}`);
        
        try {
            const session = await prisma.workoutSession.create({
                data: {
                    user_id,
                    start_time: new Date(),
                    status: "ACTIVE"
                }
            });
            socket.data.work_id = session.work_id;
            socket.emit("session_created", session);
            console.log(`✅ [SOCKET] Đã tạo session thành công cho user: ${user_id}`);
        } catch (err) {
            console.error(`❌ [SOCKET] Lỗi khi tạo workout session cho user ${user_id}:`, err.message);
            // Vẫn emit một event fake để FE không bị block
            socket.emit("session_created", { work_id: "fallback_session" });
        }
    });

    socket.on('stream_metric', async (payload) => {
        const { metrics } = payload;
        for (const metric of metrics) {
            pushToQueue(() =>
                processMetricJob(metric, socket, io)
            );
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});