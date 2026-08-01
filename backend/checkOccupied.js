const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany({
    include: {
      locationInventories: {
        where: { quantity: { gt: 0 } },
        select: { quantity: true }
      }
    }
  });

  console.dir(locations, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
