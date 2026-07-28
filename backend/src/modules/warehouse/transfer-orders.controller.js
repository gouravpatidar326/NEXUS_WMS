const prisma = require('../../utils/prisma');

const getTransferOrders = async (req, res) => {
  try {
    const orders = await prisma.transferOrder.findMany({
      where: {
        OR: [
          { sourceCompanyId: req.user.companyId },
          { destinationCompanyId: req.user.companyId }
        ]
      },
      include: {
        sourceCompany: { select: { name: true } },
        destinationCompany: { select: { name: true } },
        product: { select: { name: true, sku: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createTransferOrder = async (req, res) => {
  try {
    const { destinationCompanyId, productId, quantity } = req.body;
    
    if (!destinationCompanyId || !productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid transfer parameters' });
    }

    if (destinationCompanyId === req.user.companyId) {
      return res.status(400).json({ message: 'Destination company cannot be the same as source' });
    }

    // Verify stock exists in source
    const product = await prisma.product.findFirst({
      where: { id: productId, companyId: req.user.companyId }
    });

    if (!product || product.availableStock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock for transfer' });
    }

    // Wrap in transaction for double-entry stock movement
    const order = await prisma.$transaction(async (tx) => {
      const to = await tx.transferOrder.create({
        data: {
          sourceCompanyId: req.user.companyId,
          destinationCompanyId,
          productId,
          quantity,
          status: 'COMPLETED' // Simplifying the state machine for Phase 2 implementation
        }
      });

      // Deduct from source
      await tx.product.update({
        where: { id: productId },
        data: { availableStock: { decrement: quantity } }
      });
      await tx.inventoryLedger.create({
        data: {
          productId,
          companyId: req.user.companyId,
          location: 'TRANSFER_OUT',
          quantityDelta: -quantity,
          movementType: 'TRANSFER_OUT'
        }
      });

      // Add to destination (Requires product to exist in dest company catalog too, or we create it)
      // For this implementation, we assume the product SKU exists in dest, or we just fail if not.
      const destProduct = await tx.product.findFirst({
        where: { sku: product.sku, companyId: destinationCompanyId }
      });

      if (!destProduct) {
        throw new Error('Product SKU does not exist in destination company catalog');
      }

      await tx.product.update({
        where: { id: destProduct.id },
        data: { availableStock: { increment: quantity } }
      });
      
      await tx.inventoryLedger.create({
        data: {
          productId: destProduct.id,
          companyId: destinationCompanyId,
          location: 'TRANSFER_IN',
          quantityDelta: quantity,
          movementType: 'TRANSFER_IN'
        }
      });

      return to;
    });

    await prisma.auditLog.create({
      data: {
        event: 'TRANSFER_ORDER_COMPLETED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    if (error.message.includes('destination company catalog')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getTransferOrders, createTransferOrder };
