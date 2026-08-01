const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.receiving.findMany();
  console.log('Total receivings:', all.length);
  console.log('Receivings by status:');
  const grouped = await prisma.receiving.groupBy({
    by: ['status'],
    _count: { id: true }
  });
  console.log(grouped);
}
check().finally(() => prisma.$disconnect());
