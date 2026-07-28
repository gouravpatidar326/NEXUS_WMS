const prisma = require('../../utils/prisma');

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const receiveGoods = async (req, res) => {
  try {
    const { id } = req.params;
    const { lots } = req.body; // Array of { lotId, productId, mfgDate, binLocation, quantity }

    if (!lots || !Array.isArray(lots) || lots.length === 0) {
      return res.status(400).json({ message: 'Must provide lots to receive' });
    }

    const order = await prisma.purchaseOrder.findFirst({
      where: { id, companyId: req.user.companyId }
    });

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (order.status === 'RECEIVED') {
      return res.status(400).json({ message: 'Order is already received' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update order status
      await tx.purchaseOrder.update({
        where: { id },
        data: { status: 'RECEIVED' }
      });

      // 2. For each lot, create batch, update inventory ledger, and increment product stock
      for (const lot of lots) {
        // Create batch
        const batch = await tx.batch.create({
          data: {
            lotId: lot.lotId,
            productId: lot.productId,
            companyId: req.user.companyId,
            mfgDate: lot.mfgDate ? new Date(lot.mfgDate) : null,
            coaLocked: true, // Default locked
            quarantine: false
          }
        });

        // Add to inventory ledger
        await tx.inventoryLedger.create({
          data: {
            productId: lot.productId,
            companyId: req.user.companyId,
            location: lot.binLocation,
            quantityDelta: lot.quantity,
            movementType: 'PO_RECEIPT'
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: lot.productId },
          data: {
            availableStock: { increment: lot.quantity }
          }
        });
      }
    });

    await prisma.auditLog.create({
      data: {
        event: 'PO_RECEIVED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json({ id, status: 'RECEIVED' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPurchaseOrders, receiveGoods };
