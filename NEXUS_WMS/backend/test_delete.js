const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.company.findFirst({where:{name:'Stitch Nexus Corp'}});
  if(!c) return console.log('not found');
  const id = c.id;
  try {
    await prisma.$transaction(async (tx) => {
      const companyUsers = await tx.user.findMany({ where: { companyId: id }, select: { id: true } });
      const userIds = companyUsers.map(u => u.id);

      await tx.pickListItem.deleteMany({ where: { pickList: { companyId: id } } });
      await tx.pickList.deleteMany({ where: { companyId: id } });
      await tx.shipment.deleteMany({ where: { companyId: id } });
      await tx.notification.deleteMany({ where: { companyId: id } });
      await tx.transferOrder.deleteMany({ where: { OR: [{ sourceCompanyId: id }, { destinationCompanyId: id }] } });

      await tx.locationInventory.deleteMany({ where: { companyId: id } });
      await tx.inventoryLedger.deleteMany({ where: { companyId: id } });
      await tx.inventory.deleteMany({ where: { companyId: id } });
      await tx.stockAdjustment.deleteMany({ where: { companyId: id } });
      await tx.expiryAlert.deleteMany({ where: { companyId: id } });
      await tx.barcode.deleteMany({ where: { companyId: id } });
      await tx.transferItem.deleteMany({ where: { transfer: { companyId: id } } });
      await tx.inventoryTransfer.deleteMany({ where: { companyId: id } });
      await tx.batch.deleteMany({ where: { companyId: id } });
      await tx.receivingItem.deleteMany({ where: { companyId: id } });
      await tx.receiving.deleteMany({ where: { companyId: id } });
      
      // Delete orders that reference Product
      await tx.salesOrderItem.deleteMany({ where: { salesOrder: { companyId: id } } });
      await tx.salesOrder.deleteMany({ where: { companyId: id } });
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { companyId: id } } });
      await tx.purchaseOrder.deleteMany({ where: { companyId: id } });

      // Now Product can be deleted
      await tx.product.deleteMany({ where: { companyId: id } });
      await tx.category.deleteMany({ where: { companyId: id } });
      await tx.location.deleteMany({ where: { companyId: id } });

      if (userIds.length > 0) {
        await tx.auditLog.deleteMany({ where: { userId: { in: userIds } } });
      }

      await tx.user.deleteMany({ where: { companyId: id } });
      await tx.company.delete({ where: { id } });
    });
    console.log('Success');
  } catch (e) {
    console.error(e.message);
    console.log(e.meta);
  }
}
main();
