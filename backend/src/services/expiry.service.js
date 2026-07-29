const prisma = require('../utils/prisma');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class ExpiryService {
  async scanAndGenerateExpiryAlerts(companyId) {
    const batches = await prisma.batch.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();
    let scannedCount = 0;
    let alertsCount = 0;

    for (const batch of batches) {
      scannedCount++;
      if (!batch.expiryDate) continue;

      const expiry = new Date(batch.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        await prisma.batch.update({
          where: { id: batch.id },
          data: { status: 'EXPIRED' },
        });
        alertsCount++;
      } else if (daysRemaining <= 30) {
        alertsCount++;
      }
    }

    return {
      scannedBatches: scannedCount,
      alertsGeneratedCount: alertsCount,
    };
  }

  async getExpiryAlerts(companyId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const search = query.search || '';
    const statusFilter = query.status || '';

    const where = {
      ...(companyId ? { companyId } : {}),
      ...(search
        ? {
            OR: [
              { lotNumber: { contains: search } },
              { lotId: { contains: search } },
              { product: { name: { contains: search } } },
              { product: { sku: { contains: search } } },
            ],
          }
        : {}),
    };

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expiryDate: 'asc' },
        include: {
          product: true,
          locationInventories: {
            include: { location: true },
          },
        },
      }),
      prisma.batch.count({ where }),
    ]);

    const now = new Date();

    const items = batches.map((batch) => {
      const expiry = batch.expiryDate ? new Date(batch.expiryDate) : null;
      let daysRemaining = 0;
      let status = 'Safe';

      if (expiry) {
        const diffTime = expiry.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
          status = 'Expired';
        } else if (daysRemaining <= 7) {
          status = '7 Days';
        } else if (daysRemaining <= 15) {
          status = '15 Days';
        } else if (daysRemaining <= 30) {
          status = '30 Days';
        } else {
          status = 'Safe';
        }
      }

      // Calculate total available quantity across bin locations or acceptedQty
      const locQty = batch.locationInventories?.reduce((sum, li) => sum + (li.quantity || 0), 0);
      const availableQuantity = locQty > 0 ? locQty : batch.acceptedQty || 0;

      // Storage location formatting
      const locNames = batch.locationInventories?.map((li) => li.location?.code || `Bin ${li.location?.bin || 'A1'}`).filter(Boolean);
      const storageLocation = locNames?.length > 0 ? locNames.join(', ') : 'Unassigned';

      return {
        id: batch.id,
        lotNumber: batch.lotNumber || batch.lotId || `LOT-${batch.id.substring(0, 6)}`,
        productName: batch.product?.name || 'N/A',
        sku: batch.product?.sku || 'N/A',
        mfgDate: batch.mfgDate,
        expiryDate: batch.expiryDate,
        daysRemaining,
        status,
        availableQuantity,
        storageLocation,
        batchStatus: batch.status,
      };
    });

    const filteredItems = statusFilter ? items.filter((i) => i.status.toLowerCase() === statusFilter.toLowerCase()) : items;

    const meta = formatPaginationMeta(total, page, limit);
    return { items: filteredItems, meta };
  }

  async resolveAlert(id, companyId) {
    await prisma.expiryAlert.updateMany({
      where: { id, ...(companyId ? { companyId } : {}) },
      data: { resolved: true },
    });
    return { id, resolved: true };
  }
}

module.exports = new ExpiryService();
