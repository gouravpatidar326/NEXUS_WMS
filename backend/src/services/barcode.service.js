const prisma = require('../utils/prisma');
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
    let barcode = await barcodeRepository.findByCode(code, companyId);
    if (!barcode) {
      // Fallback: Check if the code is a Product SKU or Product Barcode
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { barcode: code },
            { sku: code }
          ],
          companyId: companyId ?? undefined
        }
      });

      if (!product) {
        throw new Error(`Barcode or SKU '${code}' not found or unauthorized`);
      }

      // We found a product, but it's a generic UPC/SKU, not a tracked lot barcode.
      // Return a mock response for the product to satisfy the scanner.
      return {
        id: 'mock-product-scan',
        code: code,
        barcodeType: 'PRODUCT_UPC',
        trackingStatus: 'IN_TRANSIT',
        product: product,
        batch: { lotNumber: 'Generic Product Scan' },
        shipStation: {
          trackingNumber: `SS-PROD-${code}`,
          carrier: 'FedEx Freight',
          status: 'IN_TRANSIT',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }
      };
    }

    // Mock ShipStation API integration: Cycle through tracking states on each scan
    let nextStatus = 'IN_TRANSIT';
    if (barcode.trackingStatus === 'IN_TRANSIT') nextStatus = 'DELIVERED';
    else if (barcode.trackingStatus === 'DELIVERED') nextStatus = 'GENERATED';

    // Persist the updated tracking status
    barcode = await prisma.barcode.update({
      where: { id: barcode.id },
      data: { trackingStatus: nextStatus },
      include: {
        product: true,
        batch: {
          include: { locationInventories: { include: { location: true } } }
        }
      }
    });

    // Mock ShipStation Payload
    barcode.shipStation = {
      trackingNumber: `SS-${barcode.code}`,
      carrier: 'FedEx Freight',
      status: nextStatus,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

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

    // Fallback: Also show Products with UPC barcodes in the registry for visibility
    const productsWithBarcode = await prisma.product.findMany({
      where: { companyId: companyId ?? undefined, barcode: { not: null } }
    });

    const validProducts = productsWithBarcode.filter(p => p.barcode && p.barcode.trim() !== '');
    
    const mockBarcodes = validProducts.map(p => ({
      id: `prod-${p.id}`,
      code: p.barcode,
      barcodeType: 'PRODUCT_UPC',
      trackingStatus: 'IN_TRANSIT',
      product: p,
      batch: { lotNumber: 'N/A (Product)' },
      createdAt: p.createdAt
    }));

    const combinedItems = [...mockBarcodes, ...items];

    const meta = formatPaginationMeta(total + mockBarcodes.length, page, limit);
    return { items: combinedItems, meta };
  }
}

module.exports = new BarcodeService();
