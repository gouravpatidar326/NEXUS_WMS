const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Restoring database seed data safely...');

  // 1. Create or get Company
  let company = await prisma.company.findFirst({
    where: { name: 'Stitch Nexus Corp' }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Stitch Nexus Corp',
        industry: 'Logistics',
      },
    });
    console.log('Created Stitch Nexus Corp.');
  } else {
    console.log('Stitch Nexus Corp already exists.');
  }

  // Ensure Admin Company doesn't clash with user roles
  let fallbackCompany = await prisma.company.findFirst({
    where: { name: 'Admin Company' }
  });
  
  const targetCompanyId = company.id;

  // 2. Upsert Users
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const usersToUpsert = [
    {
      name: 'Alex Morgan',
      email: 'alex@stitchnexus.com',
      role: 'SUPER_ADMIN',
    },
    {
      name: 'Jordan Lee',
      email: 'jordan@stitchnexus.com',
      role: 'WAREHOUSE_MANAGER',
    },
    {
      name: 'Casey Rivera',
      email: 'casey@stitchnexus.com',
      role: 'INVENTORY_CLERK',
    }
  ];

  for (const u of usersToUpsert) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        companyId: targetCompanyId,
        password: hashedPassword,
        status: 'ACTIVE',
        name: u.name,
        role: u.role
      },
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        companyId: targetCompanyId,
        status: 'ACTIVE'
      }
    });
    console.log(`Upserted user ${u.email}`);
  }

  // 3. Upsert Client Company & Client User
  let clientCompany = await prisma.client.findFirst({
    where: { name: 'Acme Corp' }
  });

  if (!clientCompany) {
    clientCompany = await prisma.client.create({
      data: {
        name: 'Acme Corp',
        creditLimit: 50000.0,
        tier: 'PREMIUM',
        companyId: targetCompanyId
      }
    });
    console.log('Created client company Acme Corp.');
  } else {
    // Some schemas don't have companyId on client but just in case
    console.log('Client company Acme Corp already exists.');
  }

  await prisma.user.upsert({
    where: { email: 'sam@acmecorp.com' },
    update: {
      password: hashedPassword,
      status: 'ACTIVE',
      companyId: targetCompanyId
    },
    create: {
      name: 'Sam Wilson',
      email: 'sam@acmecorp.com',
      password: hashedPassword,
      role: 'CLIENT',
      companyId: targetCompanyId,
      status: 'ACTIVE'
    }
  });
  console.log('Upserted client user sam@acmecorp.com');

  // 4. Create some Facilities / Warehouses if they don't exist
  let warehouse = await prisma.warehouse.findFirst({
    where: { companyId: targetCompanyId }
  });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Logistics Hub',
        code: 'WH-MAIN-01',
        city: 'New York',
        country: 'USA',
        capacityValue: 100000,
        companyId: targetCompanyId
      }
    });
    console.log('Created Main Logistics Hub facility.');
  }

  // 5. Create some Products
  const products = [
    {
      sku: 'SKU-ELEC-001',
      name: 'Industrial Barcode Scanner X-200',
      category: 'Electronics',
      unitCost: 149.99,
      wholesalePrice: 249.99,
      availableStock: 145,
    },
    {
      sku: 'SKU-PKG-042',
      name: 'Heavy Duty Shipping Boxes (Large)',
      category: 'Packaging',
      unitCost: 22.50,
      wholesalePrice: 45.00,
      availableStock: 620,
    }
  ];

  for (const p of products) {
    const existingP = await prisma.product.findFirst({ where: { sku: p.sku } });
    if (!existingP) {
      await prisma.product.create({
        data: {
          ...p,
          companyId: targetCompanyId,
        }
      });
      console.log(`Created product ${p.sku}`);
    }
  }

  console.log('Database restored successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
