const prisma = require('../utils/prisma');

class LocationRepository {
  async create(data) {
    return await prisma.location.create({ data });
  }

  async findById(id, companyId) {
    return await prisma.location.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        locationInventories: {
          include: { product: true, batch: true },
        },
      },
    });
  }

  async findAll({ companyId, zone, status, search, skip, limit, sortBy, sortOrder }) {
    const where = {
      companyId,
      deletedAt: null,
      ...(zone ? { zone } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search } },
              { zone: { contains: search } },
              { aisle: { contains: search } },
              { rack: { contains: search } },
              { shelf: { contains: search } },
              { bin: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: { select: { locationInventories: true } },
        },
      }),
      prisma.location.count({ where }),
    ]);

    return { items, total };
  }

  async update(id, companyId, data) {
    return await prisma.location.updateMany({
      where: { id, companyId, deletedAt: null },
      data,
    });
  }

  async softDelete(id, companyId) {
    return await prisma.location.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new LocationRepository();
