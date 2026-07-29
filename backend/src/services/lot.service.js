const lotRepository = require('../repositories/lot.repository');
const barcodeRepository = require('../repositories/barcode.repository');
const { generateWmsBarcode } = require('../utils/barcodeGenerator');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class LotService {
  async createLot(companyId, payload) {
    if (!payload.productId) {
      throw new Error('Product ID is required to create a lot');
    }

    const lotNumber = payload.lotNumber || `LOT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const data = {
      lotNumber,
      lotId: lotNumber,
      productId: payload.productId,
      companyId,
      mfgDate: payload.mfgDate ? new Date(payload.mfgDate) : null,
      expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
      acceptedQty: parseInt(payload.acceptedQty || '0', 10),
      status: payload.status || 'QUARANTINE',
      quarantine: payload.status === 'QUARANTINE',
      coaLocked: payload.coaLocked !== undefined ? payload.coaLocked : true,
      testCertificateId: payload.testCertificateId || null,
    };

    const lot = await lotRepository.create(data);

    // Auto generate Barcode for Lot
    const barcodeCode = generateWmsBarcode({ companyId, productId: payload.productId, lotId: lot.id });
    await barcodeRepository.create({
      code: barcodeCode,
      barcodeType: 'CODE128',
      productId: payload.productId,
      batchId: lot.id,
      companyId,
    });

    return await lotRepository.findById(lot.id, companyId);
  }

  async getLotById(id, companyId) {
    const lot = await lotRepository.findById(id, companyId);
    if (!lot) {
      throw new Error('Lot/Batch not found');
    }
    return lot;
  }

  async getLots(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const productId = query.productId || null;
    const status = query.status || null;
    const search = query.search || null;

    const { items, total } = await lotRepository.findAll({
      companyId,
      productId,
      status,
      search,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async updateLotStatus(id, companyId, status, coaLocked = null) {
    await this.getLotById(id, companyId);
    await lotRepository.updateStatus(id, companyId, status, coaLocked);
    return await this.getLotById(id, companyId);
  }
}

module.exports = new LotService();
