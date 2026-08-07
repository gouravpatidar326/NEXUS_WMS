const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProduct() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { sku: 'ASD123' },
        { barcode: '1245365674' }
      ]
    }
  });
  console.log(products);
}

checkProduct().catch(console.error).finally(() => prisma.$disconnect());
