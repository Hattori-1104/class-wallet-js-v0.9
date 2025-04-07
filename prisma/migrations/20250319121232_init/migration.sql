/*
  Warnings:

  - You are about to drop the column `checked` on the `purchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `purchase` DROP COLUMN `checked`,
    ADD COLUMN `checkedAt` DATETIME(3) NULL;
