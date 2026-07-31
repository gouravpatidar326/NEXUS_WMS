const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const email = 'u@gmail.com';
  
  // Delete from User table if it exists
  try {
    await prisma.user.delete({ where: { email } });
    console.log('Deleted from User table');
  } catch (e) {
    console.log('Not found in User table');
  }

  // Create in Client table
  const hashedPassword = await bcrypt.hash('123456', 10);
  // Check if client exists
  const existingClient = await prisma.client.findFirst({ where: { email } });
  if (existingClient) {
    console.log('Client already exists');
    return;
  }

  const client = await prisma.client.create({
    data: {
      name: 'Client U',
      email: email,
      phone: '1234567890',
      address: 'Client Address',
      password: hashedPassword,
      status: 'ACTIVE',
      companyId: 'b4b65243-eda4-4656-8348-0c12a2b8ccd7', // kiaan company
      tier: 'STANDARD'
    }
  });
  
  console.log(`Created Client ${email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
