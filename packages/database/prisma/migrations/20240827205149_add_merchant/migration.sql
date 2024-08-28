-- AlterEnum
ALTER TYPE "TxType" ADD VALUE 'SPENT';

-- AlterTable
ALTER TABLE "UserAccount" ADD COLUMN     "balanceM" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MerchantTransactions" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MerchantTransactions_pkey" PRIMARY KEY ("id")
);
