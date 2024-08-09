-- CreateEnum
CREATE TYPE "BankType" AS ENUM ('INPAY', 'HDFC');

-- CreateTable
CREATE TABLE "UserOTP" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "bank" "BankType" NOT NULL,

    CONSTRAINT "UserOTP_pkey" PRIMARY KEY ("id")
);
