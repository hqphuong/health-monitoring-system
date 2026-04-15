import prisma from './lib/prisma.js';
import { evaluateHealthData } from './services/alert.service.js';
import { getRiskScore } from './services/ai.service.js';

// ================= CONFIG =================
const ALERT_COOLDOWN = 60000;
const MAX_FALLBACK = 100;

// Circuit breaker
let aiFailCount = 0;
let aiDisabledUntil = 0;

// fallback queue (in-memory)
const fallbackQueue = [];

// ================= UTIL =================
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// ================= AI RETRY =================
const callAIWithRetry = async (hrSeq, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await getRiskScore(hrSeq);
            aiFailCount = 0;
            return result;
        } catch (err) {
            aiFailCount++;
            console.error(`AI retry ${i + 1} failed`);

            // exponential backoff: 200 → 400 → 800
            await sleep(200 * Math.pow(2, i));

            if (i === retries - 1) throw err;
        }
    }
};

// ================= CIRCUIT BREAKER =================
const isAIDisabled = () => Date.now() < aiDisabledUntil;

const handleAIFailure = () => {
    if (aiFailCount >= 5) {
        console.warn("⚠ AI circuit breaker triggered");
        aiDisabledUntil = Date.now() + 60000; // disable 1 phút
        aiFailCount = 0;
    }
};

// ================= HELPERS =================

// Lấy tuổi user
const getUserAge = async (user_id) => {
    const profile = await prisma.healthProfile.findFirst({
        where: { user_id }
    });

    if (profile?.birth) {
        return new Date().getFullYear() - new Date(profile.birth).getFullYear();
    }

    return 25; // default fallback
};

// Lưu metric (có fallback)
const saveMetric = async (metric, user_id, work_id) => {
    try {
        return await prisma.healthMetric.create({
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
        console.error("DB ERROR → fallback", dbErr);

        if (fallbackQueue.length < MAX_FALLBACK) {
            fallbackQueue.push({ metric, user_id, work_id });
        }

        return null; // ❗ KHÔNG throw → tránh crash worker
    }
};

// Retry fallback queue
const retryFallbackQueue = async () => {
    if (fallbackQueue.length === 0) return;

    console.log("Retry fallback queue...");

    for (let i = 0; i < fallbackQueue.length; i++) {
        const fb = fallbackQueue[i];

        try {
            await prisma.healthMetric.create({
                data: {
                    user_id: fb.user_id,
                    work_id: fb.work_id,
                    record_time: new Date(fb.metric.record_time),
                    heart_rate: fb.metric.heart_rate,
                    steps: fb.metric.steps,
                    stress_level: fb.metric.stress_level,
                    raw_data: fb.metric
                }
            });

            fallbackQueue.splice(i, 1);
            i--;

        } catch {
            break; // DB vẫn lỗi → dừng retry
        }
    }
};

// Lấy chuỗi HR
const getHeartRateSequence = async (user_id) => {
    const history = await prisma.healthMetric.findMany({
        where: { user_id },
        orderBy: { record_time: 'desc' },
        take: 10
    });

    return history
        .map(m => m.heart_rate)
        .filter(Boolean)
        .reverse();
};

// Gọi AI (có circuit breaker)
const getAIAssessment = async (hrSeq) => {
    let ai = { risk_score: 0, reasons: [] };

    if (!isAIDisabled() && hrSeq.length >= 3) {
        try {
            ai = await callAIWithRetry(hrSeq);
        } catch (err) {
            console.error("AI call failed:", err.message);
            handleAIFailure();
        }
    }

    return ai;
};

// Tính trend
const calculateTrend = (hrSeq) => {
    if (hrSeq.length < 5) return 0;

    const diff = hrSeq.at(-1) - hrSeq.at(0);

    if (diff >= 50) return 0.9;
    if (diff >= 30) return 0.7;

    return 0;
};

// Quyết định level
const determineAlertLevel = (medical, ai, trend) => {
    let level = medical.level;

    if (ai.risk_score > 0.85 || trend > 0.8) {
        level = "WARNING";
    }

    if (medical.level === "SOS") {
        level = "SOS";
    }

    return level;
};

// Check cooldown
const shouldSendAlert = (level, socket) => {
    const now = Date.now();
    socket.data.lastAlert = socket.data.lastAlert || 0;

    if (level === "SOS") return true;

    if (
        level === "WARNING" &&
        now - socket.data.lastAlert > ALERT_COOLDOWN
    ) return true;

    return false;
};

// Gửi alert
const sendAlert = async ({ level, metric, ai, trend, user_id, work_id, socket, io }) => {
    socket.data.lastAlert = Date.now();

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
};

// ================= MAIN WORKER =================
export const processMetricJob = async (metric, socket, io) => {
    const user_id = socket.data.user_id;
    const work_id = socket.data.work_id;

    try {
        console.log("📥 PROCESS METRIC:", metric);

        // 1. User profile
        const age = await getUserAge(user_id);

        // 2. Save metric
        const saved = await saveMetric(metric, user_id, work_id);
        if (!saved) return;

        // 3. Retry fallback nếu có
        await retryFallbackQueue();

        // 4. Resting detection
        const isResting =
            (metric.steps ?? 0) < 20 &&
            (metric.heart_rate ?? 0) < 100;

        // 5. Rule-based
        const medical = evaluateHealthData(metric, age, isResting);

        // 6. AI
        const hrSeq = await getHeartRateSequence(user_id);
        const ai = await getAIAssessment(hrSeq);

        // 7. Trend
        const trend = calculateTrend(hrSeq);

        // 8. Final decision
        const level = determineAlertLevel(medical, ai, trend);

        // 9. Alert
        if (shouldSendAlert(level, socket)) {
            await sendAlert({ level, metric, ai, trend, user_id, work_id, socket, io });
        }

        // 10. Realtime response
        io.to(`user_${user_id}`).emit("metric_update", {
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