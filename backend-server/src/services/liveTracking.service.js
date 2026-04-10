import prisma from '../lib/prisma.js';
import { evaluateHealthData } from './alert.service.js';

export const handleLiveTracking = async (payload, ws) => {
    const { user_id, device_id, metrics } = payload;

    if (!user_id || !device_id || !metrics) {
        return ws.send(JSON.stringify({ error: "Payload không hợp lệ" }));
    }

    try {
        const userProfile = await prisma.healthProfile.findFirst({
            where: { user_id }
        });

        let userAge = 25;
        if (userProfile?.birth) {
            const birthYear = new Date(userProfile.birth).getFullYear();
            userAge = new Date().getFullYear() - birthYear;
        }

        for (const m of metrics) {

            const savedMetric = await prisma.healthMetric.create({
                data: {
                    user_id,
                    record_time: new Date(m.record_time),
                    heart_rate: m.heart_rate || null,
                    steps: m.steps || null,
                    sleep_duration: m.sleep_duration || null,
                    stress_level: m.stress_level || null,
                    raw_data: m
                }
            });

            const isResting = (!m.steps || m.steps < 50);
            const evaluation = evaluateHealthData(savedMetric, userAge, isResting);

            let alertData = null;

            if (evaluation.level === "SOS") {

                const relatives = await prisma.relative.findMany({
                    where: { user_id }
                });

                await prisma.alertLog.create({
                    data: {
                        user_id,
                        type: "SOS_LIVE",
                        trigger_heart_rate: savedMetric.heart_rate || 0,
                        alert_time: new Date(),
                        is_sos_sent: true
                    }
                });

                alertData = {
                    level: "SOS",
                    message: evaluation.message,
                    contacts: relatives.map(r => r.phone_num)
                };
            }

            ws.send(JSON.stringify({
                metric: savedMetric,
                alert: alertData || evaluation
            }));
        }

    } catch (err) {
        console.error(err);
        ws.send(JSON.stringify({ error: err.message }));
    }
};