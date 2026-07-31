const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const users = await prisma.user.count();
    console.log('Database connected, users count:', users);
  } catch (e) {
    console.error('Error querying the database:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
