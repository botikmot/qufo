-- AlterEnum
ALTER TYPE "QuotationStatus" ADD VALUE 'CHANGES_REQUESTED';

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "changesRequestedAt" TIMESTAMP(3),
ADD COLUMN     "revisionNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sourceQuotationId" TEXT;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_sourceQuotationId_fkey" FOREIGN KEY ("sourceQuotationId") REFERENCES "Quotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
