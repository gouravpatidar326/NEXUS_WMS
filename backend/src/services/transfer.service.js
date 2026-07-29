const transferRepository = require('../repositories/transfer.repository');
const locationInventoryRepository = require('../repositories/locationInventory.repository');
const inventoryTransactionRepository = require('../repositories/inventoryTransaction.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');
const prisma = require('../utils/prisma');

class TransferService {
  async createTransfer(companyId, userId, payload) {
    if (!payload.sourceLocationId || !payload.destLocationId || !payload.items || !payload.items.length) {
      throw new Error('Source location, destination location, and transfer items are required');
    }

    if (payload.sourceLocationId === payload.destLocationId) {
      throw new Error('Source and destination locations cannot be identical');
    }

    const transferNumber = `TRF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return await prisma.$transaction(async (tx) => {
      const data = {
        transferNumber,
        transferType: payload.transferType || 'BIN_TO_BIN',
        sourceLocationId: payload.sourceLocationId,
        destLocationId: payload.destLocationId,
        status: 'COMPLETED',
        companyId,
        createdBy: userId,
      };

      const itemsData = payload.items.map((item) => ({
        productId: item.productId,
        lotId: item.lotId,
        quantity: parseInt(item.quantity, 10),
      }));

      const transfer = await tx.inventoryTransfer.create({
        data: {
          ...data,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Execute inventory movements for each item atomically
      for (const item of itemsData) {
        // 1. Deduct stock from source bin location
        await locationInventoryRepository.upsertQuantity(tx, {
          locationId: payload.sourceLocationId,
          productId: item.productId,
          lotId: item.lotId,
          companyId,
          quantityDelta: -item.quantity,
        });

        // 2. Add stock to destination bin location
        await locationInventoryRepository.upsertQuantity(tx, {
          locationId: payload.destLocationId,
          productId: item.productId,
          lotId: item.lotId,
          companyId,
          quantityDelta: item.quantity,
        });

        // 3. Create TRANSFER InventoryTransaction
        await inventoryTransactionRepository.create(tx, {
          productId: item.productId,
          lotId: item.lotId,
          companyId,
          locationId: payload.destLocationId,
          sourceLocationId: payload.sourceLocationId,
          destLocationId: payload.destLocationId,
          quantityDelta: item.quantity,
          movementType: 'TRANSFER',
          referenceId: transferNumber,
          notes: `Transferred ${item.quantity} units from ${payload.sourceLocationId} to ${payload.destLocationId}`,
          createdBy: userId,
        });
      }

      return transfer;
    });
  }

  async getTransfers(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const status = query.status || null;
    const transferType = query.transferType || null;

    const { items, total } = await transferRepository.findAll({
      companyId,
      status,
      transferType,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async getTransferById(id, companyId) {
    const transfer = await transferRepository.findById(id, companyId);
    if (!transfer) {
      throw new Error('Inventory transfer record not found');
    }
    return transfer;
  }
}

module.exports = new TransferService();
