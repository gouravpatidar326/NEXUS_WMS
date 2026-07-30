const prisma = require('../utils/prisma');

class InventoryRepository {
  async upsertAggregate(tx, { productId, companyId, totalDelta = 0, reservedDelta = 0 }) {
    const client = tx || prisma;

    const existing = await client.inventory.findUnique({
      where: {
        productId_companyId: {
          productId,
          ...(companyId ? { companyId } : {}),
        },
      },
    });

    const currentTotal = existing?.totalStock || 0;
    const currentReserved = existing?.reservedStock || 0;

    const newTotal = Math.max(0, currentTotal + totalDelta);
    const newReserved = Math.max(0, currentReserved + reservedDelta);
    const newAvailable = Math.max(0, newTotal - newReserved);

    if (newTotal < newReserved) {
      throw new Error(`Cannot reserve stock exceeding total available stock (Total: ${newTotal}, Requested Reserved: ${newReserved})`);
    }

    return await client.inventory.upsert({
      where: {
        productId_companyId: {
          productId,
          ...(companyId ? { companyId } : {}),
        },
      },
      update: {
        totalStock: newTotal,
        reservedStock: newReserved,
        availableStock: newAvailable,
        updatedAt: new Date(),
      },
      create: {
        productId,
        ...(companyId ? { companyId } : {}),
        totalStock: newTotal,
        reservedStock: newReserved,
        availableStock: newAvailable,
      },
    });
  }

  async findByProduct(productId, companyId) {
    return await prisma.inventory.findUnique({
      where: {
        productId_companyId: {
          productId,
          ...(companyId ? { companyId } : {}),
        },
      },
      include: { product: true },
    });
  }

  async findAll({ companyId, skip, limit }) {
    const where = { companyId };

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        include: { product: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where }),
    ]);

    return { items, total };
  }
}

module.exports = new InventoryRepository();
