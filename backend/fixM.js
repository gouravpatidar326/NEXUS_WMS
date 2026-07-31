const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: 'm@gmail.com' },
    data: { companyId: 'b4b65243-eda4-4656-8348-0c12a2b8ccd7' }
  });
  console.log('Updated m@gmail.com to company kiaan', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
