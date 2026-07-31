const prisma = require('../utils/prisma');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class ExpiryService {
  async scanAndGenerateExpiryAlerts(companyId) {
    const batches = await prisma.batch.findMany({
      where: companyId ? { companyId, status: { not: 'EXPIRED' } } : { status: { not: 'EXPIRED' } },
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

      if (daysRemaining <= 30) {
        // Find existing alert for this batch
        const existingAlert = await prisma.expiryAlert.findFirst({
          where: { lotId: batch.id },
        });

        if (!existingAlert) {
          const tier = daysRemaining <= 0 ? 'Expired' : `${daysRemaining} Days`;

          await prisma.expiryAlert.create({
            data: {
              lotId: batch.id,
              productId: batch.productId,
              expiryDate: batch.expiryDate,
              daysRemaining,
              alertTier: tier,
              companyId: batch.companyId,
            },
          });
          alertsCount++;
        }

        if (daysRemaining <= 0) {
          await prisma.batch.update({
            where: { id: batch.id },
            data: { status: 'EXPIRED' },
          });
        }
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

    const where = {
      ...(companyId ? { companyId } : {}),
      ...(search
        ? {
            batch: {
              OR: [
                { lotNumber: { contains: search } },
                { lotId: { contains: search } },
                { product: { name: { contains: search } } },
                { product: { sku: { contains: search } } },
              ],
            },
          }
        : {}),
    };

    const [alerts, total] = await Promise.all([
      prisma.expiryAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          batch: {
            include: {
              product: true,
              locationInventories: {
                include: { location: true },
              },
            },
          },
          product: true,
        },
      }),
      prisma.expiryAlert.count({ where }),
    ]);

    const now = new Date();

    const items = alerts.map((alert) => {
      const batch = alert.batch;
      const product = alert.product || batch?.product;
      const expiry = alert.expiryDate || batch?.expiryDate;
      let daysRemaining = alert.daysRemaining ?? 0;
      let status = alert.alertTier || 'Safe';

      if (expiry) {
        const diffTime = new Date(expiry).getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) status = 'Expired';
        else if (daysRemaining <= 7) status = '7 Days';
        else if (daysRemaining <= 15) status = '15 Days';
        else if (daysRemaining <= 30) status = '30 Days';
      }

      const locQty = batch?.locationInventories?.reduce((sum, li) => sum + (li.quantity || 0), 0);
      const availableQuantity = locQty > 0 ? locQty : batch?.acceptedQty || 0;

      const locNames = batch?.locationInventories?.map((li) => li.location?.code || `Bin ${li.location?.bin || 'A1'}`).filter(Boolean);
      const storageLocation = locNames?.length > 0 ? locNames.join(', ') : 'Unassigned';

      return {
        id: alert.id,
        alertMessage: `Batch ${batch?.lotId || batch?.lotNumber || ''} is expiring in ${daysRemaining} days.`,
        resolved: false,
        lotNumber: batch?.lotNumber || batch?.lotId || `LOT-${alert.id.substring(0, 6)}`,
        productName: product?.name || 'N/A',
        sku: product?.sku || 'N/A',
        mfgDate: batch?.mfgDate,
        expiryDate: expiry,
        daysRemaining,
        status,
        availableQuantity,
        storageLocation,
        batchStatus: batch?.status || 'ACTIVE',
      };
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async resolveAlert(id, companyId) {
    try {
      await prisma.expiryAlert.deleteMany({
        where: { id, ...(companyId ? { companyId } : {}) },
      });
      return { id, resolved: true };
    } catch (e) {
      return { id, resolved: true };
    }
  }
}

module.exports = new ExpiryService();
