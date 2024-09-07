-- CreateTable
CREATE TABLE "BankTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "bank" "BankType" NOT NULL,

    CONSTRAINT "BankTokens_pkey" PRIMARY KEY ("id")
);
