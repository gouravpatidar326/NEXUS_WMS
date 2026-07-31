const prisma = require('../utils/prisma');

class CategoryRepository {
  async create(data) {
    return await prisma.category.create({ data });
  }

  async findById(id, companyId) {
    return await prisma.category.findFirst({
      where: { id, ...(companyId ? { companyId } : {}), deletedAt: null },
      include: { _count: { select: { products: true } } },
    });
  }

  async findAll({ companyId, skip, limit, sortBy, sortOrder, search }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { code: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { products: true } } },
      }),
      prisma.category.count({ where }),
    ]);

    return { items, total };
  }

  async update(id, companyId, data) {
    return await prisma.category.updateMany({
      where: { id, ...(companyId ? { companyId } : {}), deletedAt: null },
      data,
    });
  }

  async softDelete(id, companyId) {
    return await prisma.category.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new CategoryRepository();
