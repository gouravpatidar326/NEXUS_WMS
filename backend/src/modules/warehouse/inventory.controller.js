const prisma = require('../../utils/prisma');

const getInventory = async (req, res) => {
  try {
    const ledger = await prisma.inventoryLedger.findMany({
      where: { ...(req.user.companyId ? { ...(req.user.companyId ? { companyId: req.user.companyId } : {}) } : {}) },
      include: { product: true },
      orderBy: { timestamp: 'desc' }
    });
    res.json(ledger);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { productId, location, quantityDelta, reason } = req.body;

    if (!productId || !location || quantityDelta === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Wrap in a transaction to ensure atomic updates
    await prisma.$transaction(async (tx) => {
      // 1. Create Ledger Entry
      await tx.inventoryLedger.create({
        data: {
          productId,
          ...(req.user.companyId ? { companyId: req.user.companyId } : {}),
          location,
          quantityDelta,
          movementType: reason || 'ADJUSTMENT'
        }
      });

      // 2. Update Product Stock
      await tx.product.update({
        where: { id: productId },
        data: {
          availableStock: {
            increment: quantityDelta
          }
        }
      });
    });

    await prisma.auditLog.create({
      data: {
        event: `STOCK_ADJUSTED_${quantityDelta > 0 ? 'UP' : 'DOWN'}`,
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(200).json({ status: 'Adjusted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getInventory, adjustStock };
