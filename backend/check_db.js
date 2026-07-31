const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const p = await prisma.product.findUnique({ 
    where: { id: '7a9febef-fd37-4c9e-a176-9876979a8039' },
    include: { locationInventories: true }
  });
  console.log(JSON.stringify(p, null, 2));
}

check().then(() => process.exit(0)).catch(console.error);
