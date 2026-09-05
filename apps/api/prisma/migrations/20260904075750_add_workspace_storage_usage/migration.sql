-- CreateEnum
CREATE TYPE "WorkspaceAssetKind" AS ENUM ('BUSINESS_LOGO', 'QUOTATION_SIGNATURE', 'QUOTATION_ITEM');

-- CreateTable
CREATE TABLE "OrganizationStorageUsage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bytesUsed" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationStorageUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationStoredAsset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "storageKey" VARCHAR(500) NOT NULL,
    "kind" "WorkspaceAssetKind" NOT NULL,
    "byteSize" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationStoredAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStorageUsage_organizationId_key" ON "OrganizationStorageUsage"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationStoredAsset_storageKey_key" ON "OrganizationStoredAsset"("storageKey");

-- CreateIndex
CREATE INDEX "OrganizationStoredAsset_organizationId_idx" ON "OrganizationStoredAsset"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationStoredAsset_organizationId_kind_idx" ON "OrganizationStoredAsset"("organizationId", "kind");

-- AddForeignKey
ALTER TABLE "OrganizationStorageUsage" ADD CONSTRAINT "OrganizationStorageUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationStoredAsset" ADD CONSTRAINT "OrganizationStoredAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
