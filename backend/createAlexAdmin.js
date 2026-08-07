const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Find an existing company or create one
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Admin Company', industry: 'Tech' }
    });
  }

  const email = 'alex@stitchnexus.com';
  
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`Super admin already exists: ${email}`);
    // Update password just in case
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 'SUPER_ADMIN', status: 'ACTIVE' }
    });
    console.log(`Updated password for ${email}`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Super Admin',
      email: email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: company.id,
      status: 'ACTIVE'
    }
  });

  console.log(`Created Super Admin: ${email} / 123456`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
