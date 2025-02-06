/*
  Warnings:

  - You are about to drop the `userwallet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `userwallet` DROP FOREIGN KEY `UserWallet_userId_fkey`;

-- DropForeignKey
ALTER TABLE `userwallet` DROP FOREIGN KEY `UserWallet_walletId_fkey`;

-- DropTable
DROP TABLE `userwallet`;
