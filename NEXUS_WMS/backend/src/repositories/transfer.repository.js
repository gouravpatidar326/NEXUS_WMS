const prisma = require('../utils/prisma');

class TransferRepository {
  async create(data, itemsData) {
    return await prisma.inventoryTransfer.create({
      data: {
        ...data,
        items: {
          create: itemsData,
        },
      },
      include: {
        sourceLocation: true,
        destLocation: true,
        items: { include: { product: true, batch: true } },
      },
    });
  }

  async findById(id, companyId) {
    return await prisma.inventoryTransfer.findFirst({
      where: { id, companyId },
      include: {
        sourceLocation: true,
        destLocation: true,
        creator: true,
        items: { include: { product: true, batch: true } },
      },
    });
  }

  async findAll({ companyId, status, transferType, skip, limit, sortBy, sortOrder }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(status ? { status } : {}),
      ...(transferType ? { transferType } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryTransfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          sourceLocation: true,
          destLocation: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.inventoryTransfer.count({ where }),
    ]);

    return { items, total };
  }

  async updateStatus(id, companyId, status) {
    return await prisma.inventoryTransfer.updateMany({
      where: { id, companyId },
      data: { status, updatedAt: new Date() },
    });
  }
}

module.exports = new TransferRepository();
