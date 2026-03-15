-- 1. Bảng USER 
CREATE TABLE "user" (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    height FLOAT,
    weight FLOAT,
    gender VARCHAR(10),
    birth DATE,
    systolic_bp INT,     -- Huyết áp tâm thu
    diastolic_bp INT,    -- Huyết áp tâm trương
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng RELATIVE (Người thân khẩn cấp - Khóa riêng phần là phone_num)
CREATE TABLE relative (
    phone_num VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES "user"(user_id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50)
);

-- 3. Bảng DEVICE (Thiết bị/Nguồn dữ liệu)
CREATE TABLE device (
    device_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES "user"(user_id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- vd: 'health_connect'
    status VARCHAR(20),
    last_sync_time TIMESTAMP
);

-- 4. Bảng WORKOUT_SESSION (Buổi tập luyện)
CREATE TABLE workout_session (
    work_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES "user"(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_heart_rate INT,
    av_heart_rate INT,
    status VARCHAR(20)
);

-- 5. Bảng HEALTH_METRIC (Kho chứa dữ liệu khổng lồ + JSONB)
CREATE TABLE health_metric (
    health_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES "user"(user_id) ON DELETE CASCADE,
    work_id VARCHAR(50) REFERENCES workout_session(work_id) ON DELETE SET NULL, -- Cho phép NULL nếu không tập
    record_time TIMESTAMP NOT NULL,
    heart_rate INT,
    steps INT,
    sleep_duration INT,
    stress_level INT,
    raw_data JSONB -- Cột ăn tiền để chứa data rác/thô từ Android
);

-- 6. Bảng ALERT_LOG (Nhật ký cảnh báo đột quỵ)
CREATE TABLE alert_log (
    alert_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES "user"(user_id) ON DELETE CASCADE,
    work_id VARCHAR(50) REFERENCES workout_session(work_id) ON DELETE SET NULL, -- Cho phép NULL nếu đang ngủ
    type VARCHAR(50) NOT NULL,
    trigger_heart_rate INT NOT NULL, -- Lưu số nhịp tim trực tiếp gây ra cảnh báo
    alert_time TIMESTAMP NOT NULL,
    is_sos_sent BOOLEAN DEFAULT FALSE
);