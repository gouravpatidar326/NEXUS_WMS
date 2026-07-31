const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFinal() {
  const locs = await prisma.locationInventory.findMany({
    include: { product: true }
  });

  for (const loc of locs) {
    if (loc.product.name === 'ONEPLUS NORD') {
      await prisma.locationInventory.update({
        where: { id: loc.id },
        data: { quantity: 400, available: 400, reserved: 0 }
      });
      console.log(`Reset ${loc.product.name} LocationInventory to 400`);
    }
  }

  // Sync products
  const products = await prisma.product.findMany();
  for (const product of products) {
    const locInvs = await prisma.locationInventory.findMany({ where: { productId: product.id } });
    const totalQty = locInvs.reduce((acc, l) => acc + l.quantity, 0);
    const totalAvailable = locInvs.reduce((acc, l) => acc + l.available, 0);
    const totalReserved = locInvs.reduce((acc, l) => acc + l.reserved, 0);

    await prisma.product.update({
      where: { id: product.id },
      data: { availableStock: totalAvailable }
    });

    const inv = await prisma.inventory.findFirst({ where: { productId: product.id } });
    if (inv) {
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { totalStock: totalQty, availableStock: totalAvailable, reservedStock: totalReserved }
      });
    }
  }
}

fixFinal().then(() => process.exit(0)).catch(console.error);
