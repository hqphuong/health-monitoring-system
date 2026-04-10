import prisma from './lib/prisma.js';
import { evaluateHealthData } from './services/alert.service.js';
import { getRiskScore } from './services/ai.service.js';

// CONFIG
const ALERT_COOLDOWN = 60000;
const MAX_FALLBACK = 100;

// Circuit breaker
let aiFailCount = 0;
let aiDisabledUntil = 0;

// fallback queue
const fallbackQueue = [];

// sleep util
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// RETRY AI (EXPONENTIAL BACKOFF)
const callAIWithRetry = async (hrSeq, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await getRiskScore(hrSeq);
            aiFailCount = 0;
            return result;
        } catch (err) {
            aiFailCount++;

            console.error(`AI retry ${i + 1} failed`);

            // backoff: 200ms → 400 → 800
            await sleep(200 * Math.pow(2, i));

            if (i === retries - 1) throw err;
        }
    }
};

// CIRCUIT BREAKER
const isAIDisabled = () => Date.now() < aiDisabledUntil;

const handleAIFailure = () => {
    if (aiFailCount >= 5) {
        console.warn("⚠ AI circuit breaker triggered");

        aiDisabledUntil = Date.now() + 60000;
        aiFailCount = 0;
    }
};

// MAIN WORKER
export const processMetricJob = async (metric, socket, io) => {

    const user_id = socket.data.user_id;
    const work_id = socket.data.work_id;

    try {

        console.log("PROCESS METRIC:", metric);

        // PROFILE
        const profile = await prisma.healthProfile.findFirst({
            where: { user_id }
        });

        let age = 25;
        if (profile?.birth) {
            age = new Date().getFullYear() - new Date(profile.birth).getFullYear();
        }

        // SAVE DB
        let saved;

        try {
            saved = await prisma.healthMetric.create({
                data: {
                    user_id,
                    work_id,
                    record_time: new Date(metric.record_time),
                    heart_rate: metric.heart_rate,
                    steps: metric.steps,
                    stress_level: metric.stress_level,
                    raw_data: metric
                }
            });

        } catch (dbErr) {

            console.error("DB ERROR → fallback");

            if (fallbackQueue.length < MAX_FALLBACK) {
                fallbackQueue.push(metric);
            }

            return;
        }

        // RETRY FALLBACK
        if (fallbackQueue.length > 0) {
            console.log("Retry fallback queue...");

            for (let i = 0; i < fallbackQueue.length; i++) {
                const fb = fallbackQueue[i];

                try {
                    await prisma.healthMetric.create({
                        data: {
                            user_id,
                            work_id,
                            record_time: new Date(fb.record_time),
                            heart_rate: fb.heart_rate,
                            steps: fb.steps,
                            stress_level: fb.stress_level,
                            raw_data: fb
                        }
                    });

                    fallbackQueue.splice(i, 1);
                    i--;

                } catch {
                    break;
                }
            }
        }

        // RESTING
        const isResting =
            (metric.steps ?? 0) < 20 &&
            metric.heart_rate < 100;

        // RULE ENGINE
        const medical = evaluateHealthData(metric, age, isResting);

        // HISTORY
        const history = await prisma.healthMetric.findMany({
            where: { user_id },
            orderBy: { record_time: 'desc' },
            take: 10
        });

        const hrSeq = history.map(m => m.heart_rate).filter(Boolean).reverse();

        // AI
        let ai = { risk_score: 0, reasons: [] };

        if (!isAIDisabled() && hrSeq.length >= 3) {
            try {
                ai = await callAIWithRetry(hrSeq);
            } catch (err) {
                handleAIFailure();
            }
        }

        // TREND
        let trend = 0;

        if (hrSeq.length >= 5) {
            const diff = hrSeq[hrSeq.length - 1] - hrSeq[0];

            if (diff > 30) trend = 0.7;
            if (diff > 50) trend = 0.9;
        }

        // FINAL DECISION
        let level = medical.level;

        if (ai.risk_score > 0.85 || trend > 0.8) {
            level = "WARNING";
        }

        if (medical.level === "SOS") {
            level = "SOS";
        }

        // COOLDOWN
        const now = Date.now();
        socket.data.lastAlert = socket.data.lastAlert || 0;

        let shouldAlert = false;

        if (level === "SOS") {
            shouldAlert = true;
        } else if (
            level === "WARNING" &&
            now - socket.data.lastAlert > ALERT_COOLDOWN
        ) {
            shouldAlert = true;
        }

        // ALERT
        if (shouldAlert) {

            socket.data.lastAlert = now;

            await prisma.alertLog.create({
                data: {
                    user_id,
                    work_id,
                    type: level,
                    trigger_heart_rate: metric.heart_rate,
                    alert_time: new Date(),
                    is_sos_sent: level === "SOS"
                }
            });

            io.to(`user_${user_id}`).emit("emergency_alert", {
                level,
                ai_risk: ai.risk_score,
                trend,
                reasons: ai.reasons || []
            });

            console.log("ALERT SENT:", level);
        }

        // RESPONSE
        socket.emit("metric_update", {
            metric: saved,
            ai_risk: ai.risk_score,
            trend,
            status: level,
            reasons: ai.reasons || []
        });

    } catch (err) {
        console.error("WORKER ERROR:", err);
        socket.emit("error", err.message);
    }
};