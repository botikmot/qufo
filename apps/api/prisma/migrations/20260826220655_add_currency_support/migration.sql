-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'PHP';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "countryCode" VARCHAR(2),
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'PHP';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'PHP';

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'PHP';
