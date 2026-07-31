const prisma = require('../utils/prisma');

class ExpiryRepository {
  async upsertAlert(data) {
    const existing = await prisma.expiryAlert.findFirst({
      where: {
        lotId: data.lotId,
        alertTier: data.alertTier,
        ...(data.companyId ? { companyId: data.companyId } : {}),
      },
    });

    if (existing) {
      return await prisma.expiryAlert.update({
        where: { id: existing.id },
        data: { daysRemaining: data.daysRemaining, expiryDate: data.expiryDate },
      });
    }

    return await prisma.expiryAlert.create({ data });
  }

  async findAll({ companyId, alertTier, resolved, skip, limit }) {
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(alertTier ? { alertTier } : {}),
      ...(resolved !== undefined ? { resolved: resolved === 'true' } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.expiryAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { daysRemaining: 'asc' },
        include: {
          batch: true,
          product: true,
        },
      }),
      prisma.expiryAlert.count({ where }),
    ]);

    return { items, total };
  }

  async resolveAlert(id, companyId) {
    const where = { id, ...(companyId ? { companyId } : {}) };
    return await prisma.expiryAlert.updateMany({
      where,
      data: { resolved: true },
    });
  }
}

module.exports = new ExpiryRepository();
