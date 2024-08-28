/*
  Warnings:

  - A unique constraint covering the columns `[firstName,lastName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_firstName_lastName_key" ON "User"("firstName", "lastName");
