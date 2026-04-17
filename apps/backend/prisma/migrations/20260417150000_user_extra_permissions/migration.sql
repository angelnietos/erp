-- AlterTable
ALTER TABLE "users" ADD COLUMN "extra_permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
