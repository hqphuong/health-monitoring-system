import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // ✅ BƯỚC 1: tạo session
  socket.emit("start_session", {
    user_id: "test-user-1"
  });
});

// ✅ nhận session từ server
socket.on("session_created", (session) => {
  console.log("📦 Session created:", session);

  // ✅ BƯỚC 2: gửi metrics (ĐÃ SỬA event name)
  socket.emit("stream_metric", {
    user_id: "test-user-1",
    metrics: [
      {
        record_time: new Date().toISOString(),
        heart_rate: 120,
        steps: 5,
        stress_level: 80
      }
    ]
  });
});

// ✅ nhận kết quả xử lý
socket.on("metric_update", (data) => {
  console.log("📊 Metric Update:", data);
});

// ✅ nhận cảnh báo
socket.on("emergency_alert", (data) => {
  console.log("🚨 ALERT:", data);
});

// debug
socket.on("error", (err) => {
  console.log("❌ ERROR:", err);
});