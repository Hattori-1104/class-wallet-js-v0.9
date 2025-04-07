/*
  Warnings:

  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `wallet` DROP FOREIGN KEY `Wallet_eventId_fkey`;

-- DropIndex
DROP INDEX `Wallet_eventId_fkey` ON `wallet`;

-- DropTable
DROP TABLE `event`;
