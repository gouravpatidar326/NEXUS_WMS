const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating/verifying seed users...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // Check if company already exists
  let company = await prisma.company.findFirst({
    where: { name: 'Stitch Nexus Corp' },
  });

  if (!company) {
    company = await prisma.company.create({
      data: { name: 'Stitch Nexus Corp', industry: 'Logistics' },
    });
    console.log('✅ Company created:', company.id);
  } else {
    console.log('ℹ️  Company already exists:', company.id);
  }

  // Upsert users
  const users = [
    { name: 'Alex Morgan',    email: 'alex@stitchnexus.com',    role: 'SUPER_ADMIN' },
    { name: 'Jordan Lee',     email: 'jordan@stitchnexus.com',  role: 'WAREHOUSE_MANAGER' },
    { name: 'Casey Rivera',   email: 'casey@stitchnexus.com',   role: 'INVENTORY_CLERK' },
    { name: 'Sam Wilson',     email: 'sam@acmecorp.com',        role: 'CLIENT' },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      // Update password to ensure it matches
      await prisma.user.update({
        where: { email: u.email },
        data: { password: hashedPassword, status: 'ACTIVE' },
      });
      console.log(`✅ Password reset for: ${u.email}`);
    } else {
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          companyId: company.id,
          status: 'ACTIVE',
        },
      });
      console.log(`✅ User created: ${u.email}`);
    }
  }

  console.log('\n🎉 All done! Login with any of these:');
  console.log('  alex@stitchnexus.com     | 123456  (SUPER_ADMIN)');
  console.log('  jordan@stitchnexus.com   | 123456  (WAREHOUSE_MANAGER)');
  console.log('  casey@stitchnexus.com    | 123456  (INVENTORY_CLERK)');
  console.log('  sam@acmecorp.com         | 123456  (CLIENT)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
