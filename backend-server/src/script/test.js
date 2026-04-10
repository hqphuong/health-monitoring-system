import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

console.log("🚀 Starting test...");

let started = false;

// =========================
// CONNECT
// =========================
socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);

    // start session trước
    socket.emit("start_session", { user_id: "test-user-1" });
});

// =========================
// SESSION CREATED
// =========================
socket.on("session_created", (data) => {
    console.log("🟢 SESSION:", data);

    if (started) return;
    started = true;

    // =========================
    // STREAM METRIC
    // =========================
    setInterval(() => {

        const heartRate = Math.floor(Math.random() * 40 + 60); // 60–100
        const steps = Math.floor(Math.random() * 30); // realistic hơn

        const payload = {
            user_id: "test-user-1",
            device_id: "dev_watch_01",
            metrics: [
                {
                    record_time: new Date().toISOString(),
                    heart_rate: heartRate,
                    steps: steps,
                    stress_level: Math.floor(Math.random() * 100)
                }
            ]
        };

        console.log("📤 SEND:", payload);

        socket.emit("stream_metric", payload);

    }, 2000);
});

// =========================
// RESPONSE
// =========================
socket.on("metric_update", (data) => {
    console.log("📊 UPDATE:", data);
});

socket.on("emergency_alert", (data) => {
    console.log("🚨 ALERT:", data);
});

// =========================
// ERROR
// =========================
socket.on("error", (err) => {
    console.log("❌ ERROR:", err);
});