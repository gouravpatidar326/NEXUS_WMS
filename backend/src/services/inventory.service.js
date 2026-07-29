const locationInventoryRepository = require('../repositories/locationInventory.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');
const prisma = require('../utils/prisma');

class InventoryService {
  async getBinInventory(companyId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const productId = query.productId || null;
    const locationId = query.locationId || null;
    const lotId = query.lotId || null;

    const { items, total } = await locationInventoryRepository.findAll({
      companyId,
      productId,
      locationId,
      lotId,
      skip,
      limit,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async getInventorySummary(companyId, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const { items, total } = await inventoryRepository.findAll({ companyId, skip, limit });
    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async getInventoryTransactions(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const productId = query.productId || null;
    const movementType = query.movementType || null;
    const locationId = query.locationId || null;

    const { items, total } = await inventoryTransactionRepository.findAll({
      companyId,
      productId,
      movementType,
      locationId,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  /**
   * INVENTORY ALLOCATION API 1: Reserve Stock for Order Fulfillment (Consumed by Developer 1)
   */
  async reserveStock(companyId, { productId, quantity }) {
    const qty = parseInt(quantity, 10);
    if (!productId || isNaN(qty) || qty <= 0) {
      throw new Error('Product ID and valid positive quantity are required for stock reservation');
    }

    return await prisma.$transaction(async (tx) => {
      return await inventoryRepository.upsertAggregate(tx, {
        productId,
        companyId,
        totalDelta: 0,
        reservedDelta: qty,
      });
    });
  }

  /**
   * INVENTORY ALLOCATION API 2: Release Stock Reservation (Consumed by Developer 1)
   */
  async releaseStock(companyId, { productId, quantity }) {
    const qty = parseInt(quantity, 10);
    if (!productId || isNaN(qty) || qty <= 0) {
      throw new Error('Product ID and valid positive quantity are required to release stock');
    }

    return await prisma.$transaction(async (tx) => {
      return await inventoryRepository.upsertAggregate(tx, {
        productId,
        companyId,
        totalDelta: 0,
        reservedDelta: -qty,
      });
    });
  }

  /**
   * INVENTORY ALLOCATION API 3: Fulfill Order & Outbound Pick/Ship (Consumed by Developer 1)
   */
  async fulfillOrderStock(companyId, userId, { productId, lotId, locationId, quantity, referenceId }) {
    const qty = parseInt(quantity, 10);
    if (!productId || !lotId || !locationId || isNaN(qty) || qty <= 0) {
      throw new Error('Product ID, Lot ID, Location ID, and valid quantity are required for fulfillment');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Deduct bin stock location quantity
      await locationInventoryRepository.upsertQuantity(tx, {
        locationId,
        productId,
        lotId,
        companyId,
        quantityDelta: -qty,
      });

      // 2. Deduct totalStock and reservedStock from company aggregate
      await inventoryRepository.upsertAggregate(tx, {
        productId,
        companyId,
        totalDelta: -qty,
        reservedDelta: -qty,
      });

      // 3. Record Immutable Inventory Transaction (SHIP)
      return await inventoryTransactionRepository.create(tx, {
        productId,
        lotId,
        companyId,
        locationId,
        quantityDelta: -qty,
        movementType: 'SHIP',
        referenceId: referenceId || `ORDER-${Date.now()}`,
        notes: `Outbound order fulfillment pick & ship from bin location ${locationId}`,
        createdBy: userId,
      });
    });
  }
}

module.exports = new InventoryService();
