const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const locs = await prisma.locationInventory.findMany();
  for (const loc of locs) {
    // If they picked without updating 'available', then 'quantity' is the true value of what's left.
    // So we reset available to quantity - reserved.
    const correctAvailable = loc.quantity - loc.reserved;
    if (loc.available !== correctAvailable) {
      await prisma.locationInventory.update({
        where: { id: loc.id },
        data: { available: correctAvailable }
      });
      console.log(`Fixed LocationInventory ${loc.id}: available -> ${correctAvailable}`);
    }
  }

  // Now sync Product and Inventory aggregate based on LocationInventory.quantity
  const products = await prisma.product.findMany();
  for (const product of products) {
    const locInvs = await prisma.locationInventory.findMany({ where: { productId: product.id } });
    const totalQty = locInvs.reduce((acc, l) => acc + l.quantity, 0);
    const totalAvailable = locInvs.reduce((acc, l) => acc + l.available, 0);
    const totalReserved = locInvs.reduce((acc, l) => acc + l.reserved, 0);

    // Sync Product availableStock
    if (product.availableStock !== totalAvailable) {
      await prisma.product.update({
        where: { id: product.id },
        data: { availableStock: totalAvailable }
      });
      console.log(`Synced Product ${product.name} availableStock to ${totalAvailable}`);
    }

    const inv = await prisma.inventory.findFirst({ where: { productId: product.id } });
    if (inv) {
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { totalStock: totalQty, availableStock: totalAvailable, reservedStock: totalReserved }
      });
    }
  }
}

fix().then(() => process.exit(0)).catch(console.error);
