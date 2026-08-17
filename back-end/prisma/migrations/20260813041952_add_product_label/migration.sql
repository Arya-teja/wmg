-- CreateEnum
CREATE TYPE "ProductLabel" AS ENUM ('BEST_SELLER', 'NEW_ARRIVAL');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "label" "ProductLabel";
