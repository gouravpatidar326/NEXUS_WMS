const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a Company
  const company = await prisma.company.create({
    data: {
      name: 'Stitch Nexus Corp',
      industry: 'Logistics',
    },
  });

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.createMany({
    data: [
      {
        name: 'Alex Morgan',
        email: 'alex@stitchnexus.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        companyId: company.id,
      },
      {
        name: 'Jordan Lee',
        email: 'jordan@stitchnexus.com',
        password: hashedPassword,
        role: 'WAREHOUSE_MANAGER',
        companyId: company.id,
      },
      {
        name: 'Casey Rivera',
        email: 'casey@stitchnexus.com',
        password: hashedPassword,
        role: 'INVENTORY_CLERK',
        companyId: company.id,
      }
    ],
  });

  // 3. Create a Client Company & Client User
  const clientCompany = await prisma.client.create({
    data: {
      name: 'Acme Corp',
      creditLimit: 50000.0,
      tier: 'PREMIUM',
    }
  });

  await prisma.user.create({
    data: {
      name: 'Sam Wilson',
      email: 'sam@acmecorp.com',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: company.id, // Usually linked to tenant company for login, but represents a client
    }
  });

  // 4. Create some Products
  await prisma.product.createMany({
    data: [
      {
        sku: 'SKU-ELEC-001',
        name: 'Industrial Barcode Scanner X-200',
        category: 'Electronics',
        unitCost: 149.99,
        wholesalePrice: 249.99,
        availableStock: 145,
        companyId: company.id,
      },
      {
        sku: 'SKU-PKG-042',
        name: 'Heavy Duty Shipping Boxes (Large)',
        category: 'Packaging',
        unitCost: 22.50,
        wholesalePrice: 45.00,
        availableStock: 620,
        companyId: company.id,
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
