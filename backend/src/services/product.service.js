const productRepository = require('../repositories/product.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class ProductService {
  async createProduct(companyId, payload) {
    if (!payload.sku || !payload.name) {
      throw new Error('SKU and Product Name are required');
    }

    const prisma = require('../utils/prisma');
    const existingSku = await productRepository.findBySku(payload.sku, companyId);
    if (existingSku) {
      throw new Error(`Product with SKU '${payload.sku}' already exists`);
    }

    const data = {
      sku: payload.sku,
      barcode: payload.barcode || null,
      name: payload.name,
      description: payload.description || null,
      category: payload.category || null,
      categoryId: payload.categoryId || null,
      unitCost: parseFloat(payload.unitCost || '0'),
      wholesalePrice: parseFloat(payload.wholesalePrice || '0'),
      status: payload.status || 'ACTIVE',
      companyId,
      attributes: payload.attributes || null,
    };

    const product = await productRepository.create(data);

    // Handle Opening Stock
    const openingStock = parseInt(payload.openingStock || '0', 10);
    if (openingStock > 0) {
      // Create a default batch
      const batch = await prisma.batch.create({
        data: {
          lotId: `OPENING-${Date.now()}`,
          lotNumber: `OPENING-${product.sku}`,
          productId: product.id,
          companyId,
          status: 'RELEASED',
          acceptedQty: openingStock,
          mfgDate: new Date(),
          coaLocked: false,
        }
      });

      let locId = payload.locationId;
      if (!locId) {
        // Find or create default "Unassigned" location
        let unassigned = await prisma.location.findFirst({
          where: { name: 'Unassigned', companyId, deletedAt: null }
        });
        if (!unassigned) {
          unassigned = await prisma.location.create({
            data: {
              name: 'Unassigned',
              warehouse: 'Default Warehouse',
              zone: 'A',
              aisle: '1',
              rack: '1',
              shelf: '1',
              bin: '1',
              companyId,
            }
          });
        }
        locId = unassigned.id;
      }

      // Add to LocationInventory
      await prisma.locationInventory.create({
        data: {
          locationId: locId,
          productId: product.id,
          lotId: batch.id,
          quantity: openingStock,
          available: openingStock,
          companyId,
        }
      });

      // Add to InventoryLedger
      await prisma.inventoryLedger.create({
        data: {
          productId: product.id,
          lotId: batch.id,
          companyId,
          locationId: locId,
          quantityDelta: openingStock,
          movementType: 'OPENING_STOCK',
          notes: 'Initial opening stock',
        }
      });
      
      // Update Total Inventory
      const inv = await prisma.inventory.findFirst({ where: { productId: product.id, companyId } });
      if (inv) {
        await prisma.inventory.update({
          where: { id: inv.id },
          data: { totalStock: { increment: openingStock }, availableStock: { increment: openingStock } }
        });
      } else {
        await prisma.inventory.create({
          data: {
            productId: product.id,
            companyId,
            totalStock: openingStock,
            availableStock: openingStock,
          }
        });
      }
    }

    return product;
  }

  async getProductById(id, companyId) {
    const product = await productRepository.findById(id, companyId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate dynamic available stock from bin location inventory
    const calculatedTotalStock = (product.locationInventories || []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const calculatedAvailableStock = (product.locationInventories || []).reduce(
      (sum, item) => sum + (item.available || 0),
      0
    );

    return {
      ...product,
      calculatedTotalStock,
      availableStock: calculatedAvailableStock,
    };
  }

  async getProducts(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const categoryId = query.categoryId || null;
    const status = query.status || null;
    const search = query.search || null;

    const { items, total } = await productRepository.findAll({
      companyId,
      categoryId,
      status,
      search,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const enrichedItems = items.map((prod) => {
      const stock = (prod.locationInventories || []).reduce(
        (acc, bin) => acc + (bin.available || 0),
        0
      );
      return {
        ...prod,
        availableStock: stock,
      };
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items: enrichedItems, meta };
  }

  async updateProduct(id, companyId, payload) {
    await this.getProductById(id, companyId);
    
    const updateData = {};
    if (payload.name) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.categoryId !== undefined) updateData.categoryId = payload.categoryId;
    if (payload.unitCost !== undefined) updateData.unitCost = parseFloat(payload.unitCost);
    if (payload.wholesalePrice !== undefined) updateData.wholesalePrice = parseFloat(payload.wholesalePrice);
    if (payload.status) updateData.status = payload.status;
    if (payload.barcode !== undefined) updateData.barcode = payload.barcode;

    await productRepository.update(id, companyId, updateData);
    return await this.getProductById(id, companyId);
  }

  async deleteProduct(id, companyId) {
    await this.getProductById(id, companyId);
    await productRepository.softDelete(id, companyId);
    return { id, deleted: true };
  }
}

module.exports = new ProductService();
