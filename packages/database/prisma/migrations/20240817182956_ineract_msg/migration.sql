-- CreateTable
CREATE TABLE "UserInteractions" (
    "id" SERIAL NOT NULL,
    "userId_1" INTEGER NOT NULL,
    "userId_2" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInteractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMessages" (
    "id" SERIAL NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMessages_pkey" PRIMARY KEY ("id")
);
