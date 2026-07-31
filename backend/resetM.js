const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const email = 'm@gmail.com';
  
  const result = await prisma.user.updateMany({
    where: { email },
    data: { password: hashedPassword, status: 'ACTIVE' }
  });
  
  console.log(`Reset password for ${email}. Matched records: ${result.count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
