const prisma = require('../utils/prisma');

class AdjustmentRepository {
  async create(data) {
    return await prisma.stockAdjustment.create({
      data,
      include: { product: true, batch: true, location: true },
    });
  }

  async findAll({ companyId, reasonCode, productId, skip, limit, sortBy, sortOrder }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(reasonCode ? { reasonCode } : {}),
      ...(productId ? { productId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: true,
          batch: true,
          location: true,
          creator: true,
        },
      }),
      prisma.stockAdjustment.count({ where }),
    ]);

    return { items, total };
  }
}

module.exports = new AdjustmentRepository();
