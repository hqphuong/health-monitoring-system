-- CreateTable
CREATE TABLE "AIPredictionLog" (
    "prediction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "work_id" TEXT,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "prediction" TEXT NOT NULL,
    "reasons" JSONB,
    "current_heart_rate" INTEGER,
    "steps" INTEGER,
    "stress_level" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPredictionLog_pkey" PRIMARY KEY ("prediction_id")
);
