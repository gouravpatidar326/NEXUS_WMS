const prisma = require('../utils/prisma');

class LotRepository {
  async create(data) {
    return await prisma.batch.create({
      data,
      include: { product: true, barcodes: true },
    });
  }

  async findById(id, companyId) {
    return await prisma.batch.findFirst({
      where: { id, companyId },
      include: {
        product: true,
        barcodes: true,
        locationInventories: { include: { location: true } },
      },
    });
  }

  async findAll({ companyId, productId, status, search, skip, limit, sortBy, sortOrder }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(productId ? { productId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { lotNumber: { contains: search } },
              { lotId: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { product: true, barcodes: true },
      }),
      prisma.batch.count({ where }),
    ]);

    return { items, total };
  }

  async updateStatus(id, companyId, status, coaLocked = null) {
    return await prisma.batch.updateMany({
      where: { id, companyId },
      data: {
        status,
        quarantine: status === 'QUARANTINE',
        ...(coaLocked !== null ? { coaLocked } : {}),
        updatedAt: new Date(),
      },
    });
  }
}

module.exports = new LotRepository();
