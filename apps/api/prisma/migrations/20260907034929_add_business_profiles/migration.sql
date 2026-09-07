-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "businessAddressSnapshot" TEXT,
ADD COLUMN     "businessEmailSnapshot" TEXT,
ADD COLUMN     "businessFooterNoteSnapshot" TEXT,
ADD COLUMN     "businessLogoUrlSnapshot" TEXT,
ADD COLUMN     "businessNameSnapshot" TEXT,
ADD COLUMN     "businessPhoneSnapshot" TEXT,
ADD COLUMN     "businessProfileId" TEXT,
ADD COLUMN     "businessTermsSnapshot" TEXT;

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "logoPublicId" TEXT,
    "quotationTerms" TEXT,
    "quotationFooterNote" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessProfile_organizationId_idx" ON "BusinessProfile"("organizationId");

-- CreateIndex
CREATE INDEX "BusinessProfile_organizationId_isActive_idx" ON "BusinessProfile"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "BusinessProfile_organizationId_isDefault_idx" ON "BusinessProfile"("organizationId", "isDefault");

-- CreateIndex
CREATE INDEX "Quotation_businessProfileId_idx" ON "Quotation"("businessProfileId");

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
