/*
  Warnings:

  - You are about to drop the column `signedBy` on the `studentcertification` table. All the data in the column will be lost.
  - You are about to drop the column `signedBy` on the `teachercertification` table. All the data in the column will be lost.
  - Added the required column `signedById` to the `StudentCertification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `signedById` to the `TeacherCertification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `studentcertification` DROP FOREIGN KEY `StudentCertification_signedBy_fkey`;

-- DropForeignKey
ALTER TABLE `teachercertification` DROP FOREIGN KEY `TeacherCertification_signedBy_fkey`;

-- DropIndex
DROP INDEX `StudentCertification_signedBy_idx` ON `studentcertification`;

-- DropIndex
DROP INDEX `TeacherCertification_signedBy_idx` ON `teachercertification`;

-- AlterTable
ALTER TABLE `studentcertification` DROP COLUMN `signedBy`,
    ADD COLUMN `signedById` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `teachercertification` DROP COLUMN `signedBy`,
    ADD COLUMN `signedById` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `StudentCertification_signedById_idx` ON `StudentCertification`(`signedById`);

-- CreateIndex
CREATE INDEX `TeacherCertification_signedById_idx` ON `TeacherCertification`(`signedById`);

-- AddForeignKey
ALTER TABLE `StudentCertification` ADD CONSTRAINT `StudentCertification_signedById_fkey` FOREIGN KEY (`signedById`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherCertification` ADD CONSTRAINT `TeacherCertification_signedById_fkey` FOREIGN KEY (`signedById`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
