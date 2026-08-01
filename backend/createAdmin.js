const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Find an existing company or create one
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Admin Company', industry: 'Tech' }
    });
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  if (existingAdmin) {
    console.log('Super admin already exists: admin@test.com / admin123');
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: company.id,
      status: 'ACTIVE'
    }
  });

  console.log('Created Super Admin: admin@test.com / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
