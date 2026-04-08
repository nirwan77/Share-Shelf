-- AlterTable
ALTER TABLE "BookPurchase" ADD COLUMN     "commissionAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "sellerAmount" INTEGER NOT NULL DEFAULT 0;
