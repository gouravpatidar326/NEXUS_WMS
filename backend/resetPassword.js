const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  await prisma.user.updateMany({
    where: { email: { in: ['admin@test.com', 'm@gmail.com', 'testmgr@test.com'] } },
    data: { password: hashedPassword }
  });

  console.log('Reset passwords for admin@test.com, m@gmail.com, and testmgr@test.com to 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
