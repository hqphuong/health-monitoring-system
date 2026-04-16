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

// middleware
app.use(express.json());

// REST API
app.use('/api/v1', apiRoutes);

// Swagger
setupSwagger(app);

// SOCKET LOGIC
io.on('connection', (socket) => {

    socket.on('start_session', async ({ user_id }) => {

        const session = await prisma.workoutSession.create({
            data: {
                user_id,
                start_time: new Date(),
                status: "ACTIVE"
            }
        });

        socket.data.user_id = user_id;
        socket.data.work_id = session.work_id;

        socket.join(`user_${user_id}`);

        socket.emit("session_created", session);
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