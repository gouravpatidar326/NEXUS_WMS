const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, companyId: true, name: true }
  });
  
  const companies = await prisma.company.findMany({
    select: { id: true, name: true }
  });
  
  const products = await prisma.product.findMany({
    select: { id: true, sku: true, companyId: true },
    take: 5
  });

  console.log("USERS:", users);
  console.log("COMPANIES:", companies);
  console.log("PRODUCTS (first 5):", products);
}

main().catch(console.error).finally(() => prisma.$disconnect());
