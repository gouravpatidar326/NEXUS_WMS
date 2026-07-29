const expiryRepository = require('../repositories/expiry.repository');
const lotRepository = require('../repositories/lot.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class ExpiryService {
  async scanAndGenerateExpiryAlerts(companyId) {
    const { items: batches } = await lotRepository.findAll({
      companyId,
      skip: 0,
      limit: 1000,
      sortBy: 'expiryDate',
      sortOrder: 'asc',
    });

    const now = new Date();
    const alertsGenerated = [];

    for (const batch of batches) {
      if (!batch.expiryDate) continue;

      const expiry = new Date(batch.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let alertTier = null;
      if (daysRemaining <= 0) {
        alertTier = 'EXPIRED';
      } else if (daysRemaining <= 7) {
        alertTier = 'ALERT_7D';
      } else if (daysRemaining <= 15) {
        alertTier = 'ALERT_15D';
      } else if (daysRemaining <= 30) {
        alertTier = 'ALERT_30D';
      }

      if (alertTier) {
        const alert = await expiryRepository.upsertAlert({
          lotId: batch.id,
          productId: batch.productId,
          expiryDate: expiry,
          daysRemaining,
          alertTier,
          companyId,
        });

        // Update batch status to EXPIRED if expired
        if (alertTier === 'EXPIRED') {
          await lotRepository.updateStatus(batch.id, companyId, 'EXPIRED');
        }

        alertsGenerated.push(alert);
      }
    }

    return {
      scannedBatches: batches.length,
      alertsGeneratedCount: alertsGenerated.length,
      alerts: alertsGenerated,
    };
  }

  async getExpiryAlerts(companyId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const alertTier = query.alertTier || null;
    const resolved = query.resolved;

    const { items, total } = await expiryRepository.findAll({
      companyId,
      alertTier,
      resolved,
      skip,
      limit,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async resolveAlert(id, companyId) {
    await expiryRepository.resolveAlert(id, companyId);
    return { id, resolved: true };
  }
}

module.exports = new ExpiryService();
