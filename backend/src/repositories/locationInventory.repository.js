const prisma = require('../utils/prisma');

class LocationInventoryRepository {
  async findOne({ locationId, productId, lotId, companyId }) {
    return await prisma.locationInventory.findUnique({
      where: {
        locationId_productId_lotId: {
          locationId,
          productId,
          lotId,
        },
      },
    });
  }

  async upsertQuantity(tx, { locationId, productId, lotId, companyId, quantityDelta }) {
    const existing = await tx.locationInventory.findUnique({
      where: {
        locationId_productId_lotId: {
          locationId,
          productId,
          lotId,
        },
      },
    });

    const newQty = (existing?.quantity || 0) + quantityDelta;
    if (newQty < 0) {
      throw new Error(`Insufficient stock in bin location (Current: ${existing?.quantity || 0}, Delta: ${quantityDelta})`);
    }

    const updated = await tx.locationInventory.upsert({
      where: {
        locationId_productId_lotId: {
          locationId,
          productId,
          lotId,
        },
      },
      update: {
        quantity: newQty,
        updatedAt: new Date(),
      },
      create: {
        locationId,
        productId,
        lotId,
        quantity: Math.max(0, quantityDelta),
        companyId,
      },
    });

    // Update location occupied capacity
    await tx.location.update({
      where: { id: locationId },
      data: {
        occupied: {
          increment: quantityDelta,
        },
      },
    });

    return updated;
  }

  async findAll({ companyId, productId, locationId, lotId, skip, limit }) {
    const where = {
      companyId,
      ...(productId ? { productId } : {}),
      ...(locationId ? { locationId } : {}),
      ...(lotId ? { lotId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.locationInventory.findMany({
        where,
        skip,
        take: limit,
        include: {
          location: true,
          product: true,
          batch: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.locationInventory.count({ where }),
    ]);

    return { items, total };
  }
}

module.exports = new LocationInventoryRepository();
