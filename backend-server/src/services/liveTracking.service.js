import { pushToQueue } from '../queue.js';

export const handleLiveTracking = async (payload, ws, io) => {
    const { user_id, device_id, metrics } = payload;

    if (!user_id || !device_id || !metrics) {
        return ws.send(JSON.stringify({
            error: "Invalid payload"
        }));
    }

    try {

        for (const metric of metrics) {

            const socketMock = {
                data: {
                    user_id,
                    work_id: null,
                    lastAlert: 0
                },
                emit: (...args) => ws.send(JSON.stringify(args))
            };

            pushToQueue(() =>
                processMetricJob(metric, socketMock, io)
            );
        }

        ws.send(JSON.stringify({
            status: "queued"
        }));

    } catch (err) {
        console.error(err);

        ws.send(JSON.stringify({
            error: err.message
        }));
    }
};