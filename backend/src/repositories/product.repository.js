const prisma = require('../utils/prisma');

class ProductRepository {
  async create(data) {
    return await prisma.product.create({ data });
  }

  async findById(id, companyId) {
    return await prisma.product.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        categoryRef: true,
        locationInventories: {
          include: { location: true, batch: true },
        },
      },
    });
  }

  async findBySku(sku, companyId) {
    return await prisma.product.findFirst({
      where: { sku, companyId, deletedAt: null },
    });
  }

  async findAll({ companyId, categoryId, status, search, skip, limit, sortBy, sortOrder }) {
    const where = {
      companyId,
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { sku: { contains: search } },
              { barcode: { contains: search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          categoryRef: true,
          locationInventories: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async update(id, companyId, data) {
    return await prisma.product.updateMany({
      where: { id, companyId, deletedAt: null },
      data,
    });
  }

  async softDelete(id, companyId) {
    return await prisma.product.updateMany({
      where: { id, companyId },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new ProductRepository();
