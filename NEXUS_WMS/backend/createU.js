const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const email = 'u@gmail.com';
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      status: 'ACTIVE',
      role: 'WAREHOUSE_MANAGER'
    },
    create: {
      name: 'User U',
      email: email,
      password: hashedPassword,
      role: 'WAREHOUSE_MANAGER',
      status: 'ACTIVE',
      companyId: 'b4b65243-eda4-4656-8348-0c12a2b8ccd7' // kiaan company
    }
  });
  
  console.log(`Created/Updated user ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
