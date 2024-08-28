-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loginType" "LoginType";
