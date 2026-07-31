const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStock() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    // Calculate total from LocationInventory
    const locInvs = await prisma.locationInventory.findMany({ where: { productId: product.id } });
    const totalQty = locInvs.reduce((acc, loc) => acc + loc.quantity, 0);
    const totalAvailable = locInvs.reduce((acc, loc) => acc + loc.available, 0);

    // Sync Product availableStock
    if (product.availableStock !== totalAvailable) {
      console.log(`Fixing Product ${product.name}: ${product.availableStock} -> ${totalAvailable}`);
      await prisma.product.update({
        where: { id: product.id },
        data: { availableStock: totalAvailable }
      });
    }

    // Sync Inventory aggregate
    const inv = await prisma.inventory.findFirst({ where: { productId: product.id } });
    if (inv && (inv.totalStock !== totalQty || inv.availableStock !== totalAvailable)) {
      console.log(`Fixing Inventory Aggregate for ${product.name}`);
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { totalStock: totalQty, availableStock: totalAvailable, reservedStock: totalQty - totalAvailable }
      });
    }
  }

  const ledgers = await prisma.inventoryLedger.findMany({ orderBy: { timestamp: 'desc' }, take: 10, include: { product: true } });
  console.log("Recent Ledger Entries:");
  for (const l of ledgers) {
    console.log(`[${l.movementType}] ${l.product.name} | Delta: ${l.quantityDelta} | Time: ${l.timestamp}`);
  }
}

fixStock()
  .then(() => process.exit(0))
  .catch(console.error);
