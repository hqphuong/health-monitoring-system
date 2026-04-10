/*
  Warnings:

  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - Made the column `last_sync_time` on table `device` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gender` to the `health_profile` table without a default value. This is not possible if the table is not empty.
  - Made the column `birth` on table `health_profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `relative` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relationship` on table `relative` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `full_name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "device" ALTER COLUMN "last_sync_time" SET NOT NULL,
ALTER COLUMN "last_sync_time" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "health_profile" DROP COLUMN "gender",
ADD COLUMN     "gender" BOOLEAN NOT NULL,
ALTER COLUMN "birth" SET NOT NULL;

-- AlterTable
ALTER TABLE "relative" ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "relationship" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "full_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3),
ADD COLUMN     "reset_otp" VARCHAR(6),
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100);
