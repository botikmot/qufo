/*
  Warnings:

  - A unique constraint covering the columns `[trackingTokenHash]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "trackingCreatedAt" TIMESTAMP(3),
ADD COLUMN     "trackingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trackingTokenHash" TEXT;

-- AlterTable
ALTER TABLE "JobUpdate" ADD COLUMN     "publicMessage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_trackingTokenHash_key" ON "Job"("trackingTokenHash");
