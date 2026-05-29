/*
  Warnings:

  - A unique constraint covering the columns `[user_id,record_time]` on the table `health_metric` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id` on table `health_metric` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "health_metric" ADD COLUMN     "blood_oxygen" DOUBLE PRECISION,
ADD COLUMN     "calories" DOUBLE PRECISION,
ADD COLUMN     "distance" DOUBLE PRECISION,
ALTER COLUMN "user_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "health_profile" ADD COLUMN     "blood_type" VARCHAR(10),
ADD COLUMN     "phone_number" VARCHAR(20),
ALTER COLUMN "birth" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "gender" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "relative" ADD COLUMN     "is_primary" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "relative_id" SET DEFAULT (gen_random_uuid())::character varying;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "verify_otp" VARCHAR(6),
ALTER COLUMN "full_name" SET DEFAULT 'Người dùng vô danh';

-- CreateIndex
CREATE UNIQUE INDEX "health_metric_user_id_record_time_key" ON "health_metric"("user_id", "record_time");
