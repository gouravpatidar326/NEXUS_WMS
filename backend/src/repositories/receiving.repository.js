const prisma = require('../utils/prisma');

class ReceivingRepository {
  async create(data, itemsData) {
    return await prisma.receiving.create({
      data: {
        ...data,
        items: {
          create: itemsData,
        },
      },
      include: { items: { include: { product: true } } },
    });
  }

  async findById(id, companyId) {
    return await prisma.receiving.findFirst({
      where: { id, companyId },
      include: {
        inspector: true,
        items: {
          include: {
            product: true,
            batches: true,
          },
        },
      },
    });
  }

  async findAll({ companyId, status, search, skip, limit, sortBy, sortOrder }) {
    const where = {
      companyId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { receivingNumber: { contains: search } },
              { poNumber: { contains: search } },
              { supplier: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.receiving.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          inspector: true,
          _count: { select: { items: true } },
        },
      }),
      prisma.receiving.count({ where }),
    ]);

    return { items, total };
  }

  async updateStatus(id, companyId, status, notes = null, inspectorId = null) {
    return await prisma.receiving.updateMany({
      where: { id, companyId },
      data: {
        status,
        ...(notes ? { notes } : {}),
        ...(inspectorId ? { inspectorId } : {}),
        updatedAt: new Date(),
      },
    });
  }

  async updateItemQty(itemId, companyId, { receivedQty, acceptedQty, rejectedQty, rejectionReason }) {
    return await prisma.receivingItem.updateMany({
      where: { id: itemId, companyId },
      data: {
        receivedQty,
        acceptedQty,
        rejectedQty,
        rejectionReason,
      },
    });
  }
}

module.exports = new ReceivingRepository();
