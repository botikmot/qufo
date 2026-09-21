-- CreateEnum
CREATE TYPE "EmailAutomationType" AS ENUM ('FIRST_QUOTE_ONBOARDING');

-- CreateEnum
CREATE TYPE "EmailAutomationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'STOPPED', 'PAUSED');

-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailDeliveryType" AS ENUM ('MARKETING', 'TRANSACTIONAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketingEmailsEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "EmailAutomation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "EmailAutomationType" NOT NULL,
    "status" "EmailAutomationStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "nextRunAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAutomation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailDelivery" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "recipient" VARCHAR(320) NOT NULL,
    "templateKey" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "type" "EmailDeliveryType" NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "providerId" TEXT,
    "errorMessage" TEXT,
    "sequenceStep" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailAutomation_status_nextRunAt_idx" ON "EmailAutomation"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "EmailAutomation_organizationId_type_status_idx" ON "EmailAutomation"("organizationId", "type", "status");

-- CreateIndex
CREATE INDEX "EmailAutomation_userId_idx" ON "EmailAutomation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailAutomation_userId_organizationId_type_key" ON "EmailAutomation"("userId", "organizationId", "type");

-- CreateIndex
CREATE INDEX "EmailDelivery_status_scheduledAt_idx" ON "EmailDelivery"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "EmailDelivery_automationId_idx" ON "EmailDelivery"("automationId");

-- CreateIndex
CREATE INDEX "EmailDelivery_recipient_idx" ON "EmailDelivery"("recipient");

-- CreateIndex
CREATE UNIQUE INDEX "EmailDelivery_automationId_templateKey_sequenceStep_key" ON "EmailDelivery"("automationId", "templateKey", "sequenceStep");

-- AddForeignKey
ALTER TABLE "EmailAutomation" ADD CONSTRAINT "EmailAutomation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAutomation" ADD CONSTRAINT "EmailAutomation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailDelivery" ADD CONSTRAINT "EmailDelivery_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "EmailAutomation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
