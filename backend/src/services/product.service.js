const productRepository = require('../repositories/product.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class ProductService {
  async createProduct(companyId, payload) {
    if (!payload.sku || !payload.name) {
      throw new Error('SKU and Product Name are required');
    }

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
    };

    return await productRepository.create(data);
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

    return {
      ...product,
      calculatedTotalStock,
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
        (acc, bin) => acc + (bin.quantity || 0),
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
