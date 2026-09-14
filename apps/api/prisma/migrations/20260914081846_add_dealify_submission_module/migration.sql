-- CreateEnum
CREATE TYPE "DealifyTier" AS ENUM ('TIER_2', 'TIER_3');

-- AlterEnum
ALTER TYPE "SubscriptionSource" ADD VALUE 'DEALIFY';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "dealifyActivatedAt" TIMESTAMP(3),
ADD COLUMN     "dealifyTier" "DealifyTier";

-- CreateTable
CREATE TABLE "OrganizationQuotationUsage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "quotationsCreated" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationQuotationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationQuotationUsage_organizationId_idx" ON "OrganizationQuotationUsage"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationQuotationUsage_periodStart_idx" ON "OrganizationQuotationUsage"("periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationQuotationUsage_organizationId_periodStart_key" ON "OrganizationQuotationUsage"("organizationId", "periodStart");

-- CreateIndex
CREATE INDEX "Subscription_dealifyTier_idx" ON "Subscription"("dealifyTier");

-- AddForeignKey
ALTER TABLE "OrganizationQuotationUsage" ADD CONSTRAINT "OrganizationQuotationUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
