/*
  Warnings:

  - You are about to drop the column `walletId` on the `teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `teacher` DROP FOREIGN KEY `Teacher_walletId_fkey`;

-- DropIndex
DROP INDEX `Teacher_walletId_idx` ON `teacher`;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `walletId`;

-- CreateTable
CREATE TABLE `TeacherWallet` (
    `id` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,

    INDEX `TeacherWallet_teacherId_idx`(`teacherId`),
    INDEX `TeacherWallet_walletId_idx`(`walletId`),
    UNIQUE INDEX `TeacherWallet_teacherId_walletId_key`(`teacherId`, `walletId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TeacherWallet` ADD CONSTRAINT `TeacherWallet_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherWallet` ADD CONSTRAINT `TeacherWallet_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
