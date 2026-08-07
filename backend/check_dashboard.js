const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const activeCompanies = await prisma.company.count();
  
  const products = await prisma.product.findMany();
  const globalInventoryValue = products.reduce((acc, prod) => {
    return acc + (prod.availableStock || 0) * (prod.unitCost || prod.wholesalePrice || 0);
  }, 0);

  const salesOrders = await prisma.salesOrder.findMany();
  const calculatedRevenue = salesOrders.reduce((acc, order) => acc + (order.totalCost || 0), 0);

  console.log({
    activeCompanies,
    globalInventoryValue,
    calculatedRevenue
  });

  await prisma.$disconnect();
}
main();
