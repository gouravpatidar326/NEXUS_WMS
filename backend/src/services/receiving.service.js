const receivingRepository = require('../repositories/receiving.repository');
const lotRepository = require('../repositories/lot.repository');
const barcodeRepository = require('../repositories/barcode.repository');
const locationInventoryRepository = require('../repositories/locationInventory.repository');
const inventoryRepository = require('../repositories/inventory.repository');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const { generateWmsBarcode } = require('../utils/barcodeGenerator');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');
const prisma = require('../utils/prisma');

class ReceivingService {
  async createReceiving(companyId, userId, payload) {
    if (!payload.supplier || !payload.items || !payload.items.length) {
      throw new Error('Supplier and receiving items are required');
    }

    const receivingNumber = `RCV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const data = {
      receivingNumber,
      poNumber: payload.poNumber || null,
      supplier: payload.supplier,
      status: 'PENDING',
      notes: payload.notes || null,
      companyId,
      createdBy: userId,
    };

    const itemsData = payload.items.map((item) => ({
      productId: item.productId,
      expectedQty: parseInt(item.expectedQty, 10),
      receivedQty: parseInt(item.receivedQty || '0', 10),
      companyId,
    }));

    return await receivingRepository.create(data, itemsData);
  }

  async processInspection(receivingId, companyId, inspectorId, payload) {
    const receiving = await receivingRepository.findById(receivingId, companyId);
    if (!receiving) {
      throw new Error('Receiving order not found');
    }

    if (!payload.items || !payload.items.length) {
      throw new Error('Inspection item details required');
    }

    for (const item of payload.items) {
      const recItem = receiving.items.find((i) => i.id === item.receivingItemId);
      if (!recItem) continue;

      const receivedQty = parseInt(item.receivedQty || recItem.receivedQty, 10);
      const acceptedQty = parseInt(item.acceptedQty || 0, 10);
      const rejectedQty = parseInt(item.rejectedQty || 0, 10);

      if (acceptedQty + rejectedQty > receivedQty) {
        throw new Error(`Accepted + Rejected quantity (${acceptedQty + rejectedQty}) cannot exceed Received Qty (${receivedQty}) for product ${recItem.productId}`);
      }

      await receivingRepository.updateItemQty(recItem.id, companyId, {
        receivedQty,
        acceptedQty,
        rejectedQty,
        rejectionReason: item.rejectionReason || null,
      });
    }

    await receivingRepository.updateStatus(receivingId, companyId, 'IN_INSPECTION', payload.notes, inspectorId);
    return await receivingRepository.findById(receivingId, companyId);
  }

  async completeReceivingAndPutaway(receivingId, companyId, userId, payload) {
    const receiving = await receivingRepository.findById(receivingId, companyId);
    if (!receiving) {
      throw new Error('Receiving order not found');
    }

    if (!payload.putaway || !payload.putaway.length) {
      throw new Error('Putaway bin location assignments required to complete receiving');
    }

    return await prisma.$transaction(async (tx) => {
      const createdLots = [];

      for (const putaway of payload.putaway) {
        const recItem = receiving.items.find((i) => i.id === putaway.receivingItemId);
        if (!recItem) continue;

        const acceptedQty = putaway.acceptedQty || recItem.acceptedQty;
        if (acceptedQty <= 0) continue;

        // Capacity Validations
        const destLoc = await tx.location.findUnique({ where: { id: putaway.locationId } });
        if (!destLoc) throw new Error('Destination bin not found');

        const currentBinStock = await tx.locationInventory.aggregate({
          where: { locationId: destLoc.id, companyId },
          _sum: { quantity: true }
        });
        const currentBinQty = currentBinStock._sum.quantity || 0;
        
        if (currentBinQty + acceptedQty > destLoc.maxCapacity) {
          throw new Error(`Bin ${destLoc.code || destLoc.bin} has only ${destLoc.maxCapacity - currentBinQty} items of space available. You are trying to receive ${acceptedQty} items.`);
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
           
           if (currentFacilityQty + acceptedQty > destFacility.capacityValue) {
             throw new Error(`Warehouse ${destFacility.name} has only ${destFacility.capacityValue - currentFacilityQty} items of space available. You are trying to receive ${acceptedQty} items.`);
           }
        }

        // 1. Create Lot / Batch
        const lotNumber = putaway.lotNumber || `LOT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const batch = await tx.batch.create({
          data: {
            lotNumber,
            lotId: lotNumber,
            productId: recItem.productId,
            receivingItemId: recItem.id,
            companyId,
            mfgDate: putaway.mfgDate ? new Date(putaway.mfgDate) : null,
            expiryDate: putaway.expiryDate ? new Date(putaway.expiryDate) : null,
            acceptedQty,
            status: 'RELEASED',
            quarantine: false,
          },
        });

        // 2. Generate Barcode for Product + Lot + Company
        const barcodeCode = generateWmsBarcode({ companyId, productId: recItem.productId, lotId: batch.id });
        await tx.barcode.create({
          data: {
            code: barcodeCode,
            barcodeType: 'CODE128',
            productId: recItem.productId,
            batchId: batch.id,
            companyId,
          },
        });

        // 3. Assign Storage Bin (LocationInventory)
        await locationInventoryRepository.upsertQuantity(tx, {
          locationId: putaway.locationId,
          productId: recItem.productId,
          lotId: batch.id,
          companyId,
          quantityDelta: acceptedQty,
        });

        // 4. Update Inventory Aggregate (Company Product Total)
        await inventoryRepository.upsertAggregate(tx, {
          productId: recItem.productId,
          companyId,
          totalDelta: acceptedQty,
        });

        // 5. Record Immutable Inventory Transaction (RECEIVE)
        await inventoryTransactionRepository.create(tx, {
          productId: recItem.productId,
          lotId: batch.id,
          companyId,
          locationId: putaway.locationId,
          destLocationId: putaway.locationId,
          quantityDelta: acceptedQty,
          movementType: 'RECEIVE',
          referenceId: receiving.receivingNumber,
          notes: `Goods received and putaway to bin location ${putaway.locationId}`,
          createdBy: userId,
        });

        createdLots.push(batch);
      }

      await tx.receiving.update({
        where: { id: receivingId },
        data: { status: 'COMPLETED', updatedAt: new Date() },
      });

      return {
        receivingId,
        status: 'COMPLETED',
        lotsCreated: createdLots.length,
      };
    });
  }

  async getReceivings(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const status = query.status || null;
    const search = query.search || null;

    const { items, total } = await receivingRepository.findAll({
      companyId,
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

  async getReceivingById(id, companyId) {
    const receiving = await receivingRepository.findById(id, companyId);
    if (!receiving) {
      throw new Error('Receiving record not found');
    }
    return receiving;
  }
}

module.exports = new ReceivingService();
