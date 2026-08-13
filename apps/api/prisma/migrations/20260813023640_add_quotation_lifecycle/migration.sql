/*
  Warnings:

  - A unique constraint covering the columns `[publicTokenHash]` on the table `Quotation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "customerResponseNote" TEXT,
ADD COLUMN     "publicTokenHash" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "viewedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_publicTokenHash_key" ON "Quotation"("publicTokenHash");
