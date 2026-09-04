-- CreateTable
CREATE TABLE "OrganizationEmailUsage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "periodStart" DATE NOT NULL,
    "customerEmailsSent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationEmailUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationEmailUsage_organizationId_idx" ON "OrganizationEmailUsage"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationEmailUsage_periodStart_idx" ON "OrganizationEmailUsage"("periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationEmailUsage_organizationId_periodStart_key" ON "OrganizationEmailUsage"("organizationId", "periodStart");

-- AddForeignKey
ALTER TABLE "OrganizationEmailUsage" ADD CONSTRAINT "OrganizationEmailUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
