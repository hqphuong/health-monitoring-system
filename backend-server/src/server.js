import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import prisma from './lib/prisma.js';
import { pushToQueue } from './queue.js';
import { processMetricJob } from './worker.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.json());

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

        const { user_id, metrics } = payload;

        for (const metric of metrics) {

            pushToQueue(() =>
                processMetricJob(metric, socket, io)
            );
        }
    });

});

server.listen(3000, () => {
    console.log("Server running");
});