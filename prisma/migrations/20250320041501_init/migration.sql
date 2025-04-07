-- AlterTable
ALTER TABLE `studentcertification` ADD COLUMN `approved` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `teachercertification` ADD COLUMN `approved` BOOLEAN NOT NULL DEFAULT false;
