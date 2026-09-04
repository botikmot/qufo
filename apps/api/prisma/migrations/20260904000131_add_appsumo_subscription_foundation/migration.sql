-- CreateEnum
CREATE TYPE "SubscriptionSource" AS ENUM ('DIRECT', 'APPSUMO');

-- CreateEnum
CREATE TYPE "SubscriptionAccessType" AS ENUM ('RECURRING', 'LIFETIME');

-- CreateEnum
CREATE TYPE "AppSumoTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3');

-- CreateEnum
CREATE TYPE "AppSumoCodeStatus" AS ENUM ('AVAILABLE', 'REDEEMED', 'REVOKED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "accessType" "SubscriptionAccessType" NOT NULL DEFAULT 'RECURRING',
ADD COLUMN     "appSumoActivatedAt" TIMESTAMP(3),
ADD COLUMN     "appSumoTier" "AppSumoTier",
ADD COLUMN     "source" "SubscriptionSource" NOT NULL DEFAULT 'DIRECT';

-- CreateTable
CREATE TABLE "AppSumoCode" (
    "id" TEXT NOT NULL,
    "codeHash" VARCHAR(64) NOT NULL,
    "codeHint" VARCHAR(20) NOT NULL,
    "tier" "AppSumoTier" NOT NULL,
    "status" "AppSumoCodeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "batchLabel" VARCHAR(100),
    "organizationId" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSumoCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSumoCode_codeHash_key" ON "AppSumoCode"("codeHash");

-- CreateIndex
CREATE INDEX "AppSumoCode_status_idx" ON "AppSumoCode"("status");

-- CreateIndex
CREATE INDEX "AppSumoCode_tier_idx" ON "AppSumoCode"("tier");

-- CreateIndex
CREATE INDEX "AppSumoCode_organizationId_idx" ON "AppSumoCode"("organizationId");

-- CreateIndex
CREATE INDEX "AppSumoCode_batchLabel_idx" ON "AppSumoCode"("batchLabel");

-- CreateIndex
CREATE INDEX "AppSumoCode_redeemedAt_idx" ON "AppSumoCode"("redeemedAt");

-- CreateIndex
CREATE INDEX "Subscription_source_idx" ON "Subscription"("source");

-- CreateIndex
CREATE INDEX "Subscription_accessType_idx" ON "Subscription"("accessType");

-- CreateIndex
CREATE INDEX "Subscription_appSumoTier_idx" ON "Subscription"("appSumoTier");

-- AddForeignKey
ALTER TABLE "AppSumoCode" ADD CONSTRAINT "AppSumoCode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
