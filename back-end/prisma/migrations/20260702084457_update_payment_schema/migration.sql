/*
  Warnings:

  - Added the required column `provider` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "paymentUrl" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL,
ALTER COLUMN "method" DROP NOT NULL;
