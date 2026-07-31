const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // 1. Reset and fetch ALL Users
  await prisma.user.updateMany({
    data: { password: hashedPassword, status: 'ACTIVE' }
  });
  
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true, company: { select: { name: true } } }
  });

  // 2. Reset and fetch ALL Clients
  await prisma.client.updateMany({
    data: { password: hashedPassword, status: 'ACTIVE' }
  });

  const clients = await prisma.client.findMany({
    select: { email: true, name: true, company: { select: { name: true } } }
  });

  console.log("=== ALL USERS (Password for all: 123456) ===");
  users.forEach(u => {
    console.log(`Email: ${u.email.padEnd(25)} | Role: ${u.role.padEnd(18)} | Company: ${u.company?.name || 'None'}`);
  });

  console.log("\n=== ALL CLIENTS (Password for all: 123456) ===");
  clients.forEach(c => {
    console.log(`Email: ${c.email.padEnd(25)} | Role: CLIENT             | Company: ${c.company?.name || 'None'}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
