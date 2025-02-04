-- DropForeignKey
ALTER TABLE `purchaserequest` DROP FOREIGN KEY `PurchaseRequest_teacherApprovalId_fkey`;

-- AddForeignKey
ALTER TABLE `PurchaseRequest` ADD CONSTRAINT `PurchaseRequest_teacherApprovalId_fkey` FOREIGN KEY (`teacherApprovalId`) REFERENCES `Teacher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `purchaserequest` RENAME INDEX `PurchaseRequest_accountantApprovalId_fkey` TO `PurchaseRequest_accountantApprovalId_idx`;

-- RenameIndex
ALTER TABLE `purchaserequest` RENAME INDEX `PurchaseRequest_partId_fkey` TO `PurchaseRequest_partId_idx`;

-- RenameIndex
ALTER TABLE `purchaserequest` RENAME INDEX `PurchaseRequest_requestedById_fkey` TO `PurchaseRequest_requestedById_idx`;

-- RenameIndex
ALTER TABLE `purchaserequest` RENAME INDEX `PurchaseRequest_teacherApprovalId_fkey` TO `PurchaseRequest_teacherApprovalId_idx`;
