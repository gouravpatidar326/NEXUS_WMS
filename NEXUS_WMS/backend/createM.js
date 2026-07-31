const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const email = 'm@gmail.com';
  
  // Find super admin's company to attach to
  const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      status: 'ACTIVE',
      role: 'WAREHOUSE_MANAGER'
    },
    create: {
      name: 'Manager M',
      email: email,
      password: hashedPassword,
      role: 'WAREHOUSE_MANAGER',
      status: 'ACTIVE',
      companyId: superAdmin ? superAdmin.companyId : null
    }
  });
  
  console.log(`Created/Updated user ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
