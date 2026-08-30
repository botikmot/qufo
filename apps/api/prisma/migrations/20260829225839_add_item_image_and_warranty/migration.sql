-- CreateEnum
CREATE TYPE "WarrantyUnit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- AlterTable
ALTER TABLE "JobItem" ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "warrantyDuration" INTEGER,
ADD COLUMN     "warrantyTerms" TEXT,
ADD COLUMN     "warrantyUnit" "WarrantyUnit";

-- AlterTable
ALTER TABLE "QuotationItem" ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "warrantyDuration" INTEGER,
ADD COLUMN     "warrantyTerms" TEXT,
ADD COLUMN     "warrantyUnit" "WarrantyUnit";
