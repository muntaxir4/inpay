/*
  Warnings:

  - A unique constraint covering the columns `[userId_1,userId_2]` on the table `UserInteractions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserInteractions_userId_1_userId_2_key" ON "UserInteractions"("userId_1", "userId_2");
