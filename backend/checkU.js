const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'u@gmail.com' } });
  const client = await prisma.client.findFirst({ where: { email: 'u@gmail.com' } });
  console.log("User:", user);
  console.log("Client:", client);
}
main().catch(console.error).finally(() => prisma.$disconnect());
