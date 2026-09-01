-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "quotationSignatoryName" TEXT,
ADD COLUMN     "quotationSignatoryTitle" TEXT,
ADD COLUMN     "quotationSignatureKey" TEXT,
ADD COLUMN     "quotationSignatureUrl" TEXT,
ADD COLUMN     "showQuotationSignature" BOOLEAN NOT NULL DEFAULT false;
