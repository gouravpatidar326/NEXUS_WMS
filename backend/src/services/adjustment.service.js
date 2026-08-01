const adjustmentRepository = require('../repositories/adjustment.repository');
const locationInventoryRepository = require('../repositories/locationInventory.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');
const prisma = require('../utils/prisma');

const VALID_REASONS = ['DAMAGE', 'DAMAGED', 'LOST', 'MANUAL_CORRECTION', 'AUDIT_CORRECTION', 'PHYSICAL_COUNT', 'EXPIRED'];

class AdjustmentService {
  async createAdjustment(companyId, userId, payload) {
    const { productId, lotId, locationId, quantityDelta, reasonCode, notes } = payload;

    if (!productId || !locationId || quantityDelta === undefined || !reasonCode) {
      throw new Error('Product, Location, Quantity Delta, and Reason Code are required');
    }

    if (!VALID_REASONS.includes(reasonCode.toUpperCase())) {
      throw new Error(`Invalid reason code '${reasonCode}'. Valid codes: ${VALID_REASONS.join(', ')}`);
    }

    const delta = parseInt(quantityDelta, 10);
    if (delta === 0) {
      throw new Error('Quantity delta cannot be zero');
    }

    const adjustmentNumber = `ADJ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return await prisma.$transaction(async (tx) => {
      // Capacity Validations
      if (delta > 0) {
        const destLoc = await tx.location.findUnique({ where: { id: locationId } });
        if (!destLoc) throw new Error('Location not found');

        const currentBinStock = await tx.locationInventory.aggregate({
          where: { locationId: destLoc.id, companyId },
          _sum: { quantity: true }
        });
        const currentBinQty = currentBinStock._sum.quantity || 0;
        
        if (currentBinQty + delta > destLoc.maxCapacity) {
          throw new Error(`Bin ${destLoc.code || destLoc.bin} has only ${destLoc.maxCapacity - currentBinQty} items of space available. You are trying to receive ${delta} items.`);
        }

        const destFacility = await tx.warehouse.findFirst({ where: { name: destLoc.warehouse, companyId } });
        if (destFacility && destFacility.capacityValue !== null) {
           const allFacilityLocs = await tx.location.findMany({ where: { warehouse: destFacility.name, companyId } });
           const locIds = allFacilityLocs.map(l => l.id);
           const totalFacilityStock = await tx.locationInventory.aggregate({
             where: { locationId: { in: locIds }, companyId },
             _sum: { quantity: true }
           });
           const currentFacilityQty = totalFacilityStock._sum.quantity || 0;
           
           if (currentFacilityQty + delta > destFacility.capacityValue) {
             throw new Error(`Warehouse ${destFacility.name} has only ${destFacility.capacityValue - currentFacilityQty} items of space available. You are trying to receive ${delta} items.`);
           }
        }
      }
      // 1. Update bin stock location quantity
      await locationInventoryRepository.upsertQuantity(tx, {
        locationId,
        productId,
        lotId: lotId || null,
        companyId,
        quantityDelta: delta,
      });

      // 2. Update company-wide product aggregate stock
      await inventoryRepository.upsertAggregate(tx, {
        productId,
        companyId,
        totalDelta: delta,
      });

      const userExists = userId ? await tx.user.findUnique({ where: { id: userId } }) : null;

      // 3. Record Stock Adjustment Audit Record
      const adjustment = await tx.stockAdjustment.create({
        data: {
          adjustmentNumber,
          productId,
          lotId: lotId || null,
          locationId,
          quantityDelta: delta,
          reasonCode: reasonCode.toUpperCase(),
          notes: notes || null,
          createdBy: userExists ? userId : null,
          companyId,
        },
        include: { product: true, batch: true, location: true },
      });

      // 4. Record Immutable Inventory Transaction (ADJUSTMENT)
      await inventoryTransactionRepository.create(tx, {
        productId,
        lotId: lotId || null,
        companyId,
        locationId,
        quantityDelta: delta,
        movementType: 'ADJUSTMENT',
        referenceId: adjustmentNumber,
        notes: `Stock adjustment [${reasonCode}]: ${delta > 0 ? '+' : ''}${delta} units. ${notes || ''}`,
        createdBy: userId,
      });

      // 5. Sync Product.availableStock cache dynamically to prevent desync
      const allLocs = await tx.locationInventory.findMany({
        where: { productId }
      });
      const totalAvailable = allLocs.reduce((sum, l) => sum + l.available, 0);
      await tx.product.update({
        where: { id: productId },
        data: { availableStock: totalAvailable }
      });

      return adjustment;
    });
  }

  async getAdjustments(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const reasonCode = query.reasonCode || null;
    const productId = query.productId || null;

    const { items, total } = await adjustmentRepository.findAll({
      companyId,
      reasonCode,
      productId,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }
}

module.exports = new AdjustmentService();
