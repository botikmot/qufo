-- CreateEnum
CREATE TYPE "DealifyCodeStatus" AS ENUM ('AVAILABLE', 'REDEEMED', 'REVOKED', 'REFUNDED');

-- CreateTable
CREATE TABLE "DealifyCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "codeHint" TEXT NOT NULL,
    "tier" "DealifyTier" NOT NULL,
    "status" "DealifyCodeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "organizationId" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealifyCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DealifyCode_codeHash_key" ON "DealifyCode"("codeHash");

-- CreateIndex
CREATE INDEX "DealifyCode_status_idx" ON "DealifyCode"("status");

-- CreateIndex
CREATE INDEX "DealifyCode_tier_idx" ON "DealifyCode"("tier");

-- CreateIndex
CREATE INDEX "DealifyCode_organizationId_idx" ON "DealifyCode"("organizationId");
