const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const emails = ['jordan@stitchnexus.com', 'casey@stitchnexus.com', 'alex@stitchnexus.com', 'c@gmail.com'];
  
  for (const email of emails) {
    await prisma.user.updateMany({
      where: { email },
      data: { password: hashedPassword, status: 'ACTIVE' }
    });
    console.log(`Reset password for ${email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
