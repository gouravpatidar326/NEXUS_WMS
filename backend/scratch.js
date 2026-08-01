const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, company: { select: { name: true } } }
  });
  console.log(users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
