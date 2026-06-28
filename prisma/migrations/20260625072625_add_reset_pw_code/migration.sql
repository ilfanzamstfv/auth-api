-- AlterTable
ALTER TABLE "user" ADD COLUMN     "resetCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordCode" TEXT;
