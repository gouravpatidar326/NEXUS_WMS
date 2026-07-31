const prisma = require('../utils/prisma');

class InventoryTransactionRepository {
  async create(tx, data) {
    const client = tx || prisma;
    return await client.inventoryLedger.create({
      data,
    });
  }

  async findAll({ companyId, productId, movementType, locationId, skip, limit, sortBy, sortOrder }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(productId ? { productId } : {}),
      ...(movementType ? { movementType } : {}),
      ...(locationId ? { locationId } : {}),
    };

    // InventoryLedger uses `timestamp` field in Prisma schema
    const sortField = (!sortBy || sortBy === 'createdAt') ? 'timestamp' : sortBy;

    const [items, total] = await Promise.all([
      prisma.inventoryLedger.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder || 'desc' },
        include: {
          product: true,
          batch: true,
          locRef: true,
        },
      }),
      prisma.inventoryLedger.count({ where }),
    ]);

    return { items, total };
  }
}

module.exports = new InventoryTransactionRepository();
