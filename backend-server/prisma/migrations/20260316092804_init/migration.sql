/*
  Warnings:

  - You are about to drop the column `birth` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `diastolic_bp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `systolic_bp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "birth",
DROP COLUMN "diastolic_bp",
DROP COLUMN "gender",
DROP COLUMN "height",
DROP COLUMN "systolic_bp",
DROP COLUMN "weight";

-- CreateTable
CREATE TABLE "health_profile" (
    "profile_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "gender" VARCHAR(10),
    "birth" DATE,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "health_profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "health_profile_user_id_key" ON "health_profile"("user_id");

-- AddForeignKey
ALTER TABLE "health_profile" ADD CONSTRAINT "health_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
