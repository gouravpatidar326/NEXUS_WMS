const barcodeRepository = require('../repositories/barcode.repository');
const { generateWmsBarcode } = require('../utils/barcodeGenerator');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class BarcodeService {
  async generateBarcode(companyId, payload) {
    if (!payload.productId || !payload.batchId) {
      throw new Error('Product ID and Batch/Lot ID are required');
    }

    const code = payload.code || generateWmsBarcode({ companyId, productId: payload.productId, lotId: payload.batchId });

    const data = {
      code,
      barcodeType: payload.barcodeType || 'CODE128',
      productId: payload.productId,
      batchId: payload.batchId,
      companyId,
    };

    return await barcodeRepository.create(data);
  }

  async scanBarcode(code, companyId) {
    const barcode = await barcodeRepository.findByCode(code, companyId);
    if (!barcode) {
      throw new Error(`Barcode '${code}' not found or unauthorized`);
    }
    return barcode;
  }

  async getBarcodes(companyId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const productId = query.productId || null;
    const batchId = query.batchId || null;

    const { items, total } = await barcodeRepository.findAll({
      companyId,
      productId,
      batchId,
      skip,
      limit,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }
}

module.exports = new BarcodeService();
