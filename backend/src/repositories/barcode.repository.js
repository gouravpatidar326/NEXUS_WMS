const prisma = require('../utils/prisma');

class BarcodeRepository {
  async create(data) {
    return await prisma.barcode.create({
      data,
      include: { product: true, batch: true },
    });
  }

  async findByCode(code, companyId) {
    return await prisma.barcode.findFirst({
      where: { code, ...(companyId ? { companyId } : {}) },
      include: {
        product: true,
        batch: {
          include: {
            locationInventories: { include: { location: true } },
          },
        },
      },
    });
  }

  async findAll({ companyId, productId, batchId, skip, limit }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(productId ? { productId } : {}),
      ...(batchId ? { batchId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.barcode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { product: true, batch: true },
      }),
      prisma.barcode.count({ where }),
    ]);

    return { items, total };
  }
}

module.exports = new BarcodeRepository();
