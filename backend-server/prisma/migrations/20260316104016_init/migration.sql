/*
  Warnings:

  - The primary key for the `relative` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `relative_id` was added to the `relative` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "relative" DROP CONSTRAINT "relative_pkey",
ADD COLUMN     "relative_id" VARCHAR(50) NOT NULL,
ADD CONSTRAINT "relative_pkey" PRIMARY KEY ("relative_id");
