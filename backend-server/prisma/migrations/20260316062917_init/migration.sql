-- CreateTable
CREATE TABLE "user" (
    "user_id" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "gender" VARCHAR(10),
    "birth" DATE,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "relative" (
    "phone_num" VARCHAR(20) NOT NULL,
    "user_id" VARCHAR(50),
    "contact_name" VARCHAR(100) NOT NULL,
    "relationship" VARCHAR(50),

    CONSTRAINT "relative_pkey" PRIMARY KEY ("phone_num")
);

-- CreateTable
CREATE TABLE "device" (
    "device_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50),
    "provider" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20),
    "last_sync_time" TIMESTAMP(3),

    CONSTRAINT "device_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "workout_session" (
    "work_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50),
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "max_heart_rate" INTEGER,
    "av_heart_rate" INTEGER,
    "status" VARCHAR(20),

    CONSTRAINT "workout_session_pkey" PRIMARY KEY ("work_id")
);

-- CreateTable
CREATE TABLE "health_metric" (
    "health_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50),
    "work_id" VARCHAR(50),
    "record_time" TIMESTAMP(3) NOT NULL,
    "heart_rate" INTEGER,
    "steps" INTEGER,
    "sleep_duration" INTEGER,
    "stress_level" INTEGER,
    "raw_data" JSONB,

    CONSTRAINT "health_metric_pkey" PRIMARY KEY ("health_id")
);

-- CreateTable
CREATE TABLE "alert_log" (
    "alert_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50),
    "work_id" VARCHAR(50),
    "type" VARCHAR(50) NOT NULL,
    "trigger_heart_rate" INTEGER NOT NULL,
    "alert_time" TIMESTAMP(3) NOT NULL,
    "is_sos_sent" BOOLEAN DEFAULT false,

    CONSTRAINT "alert_log_pkey" PRIMARY KEY ("alert_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- AddForeignKey
ALTER TABLE "relative" ADD CONSTRAINT "relative_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device" ADD CONSTRAINT "device_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session" ADD CONSTRAINT "workout_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_metric" ADD CONSTRAINT "health_metric_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_metric" ADD CONSTRAINT "health_metric_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "workout_session"("work_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_log" ADD CONSTRAINT "alert_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_log" ADD CONSTRAINT "alert_log_work_id_fkey" FOREIGN KEY ("work_id") REFERENCES "workout_session"("work_id") ON DELETE SET NULL ON UPDATE CASCADE;
