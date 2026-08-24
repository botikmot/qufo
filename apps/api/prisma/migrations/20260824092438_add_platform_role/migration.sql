-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN', 'SUPPORT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "platformRole" "PlatformRole";
