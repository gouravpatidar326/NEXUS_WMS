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

    // Verify product & stock exist in source company
    const sourceProduct = await prisma.product.findFirst({
      where: { id: productId, companyId: req.user.companyId }
    });

    if (!sourceProduct) {
      return res.status(404).json({ message: 'Product not found in your company catalog' });
    }

    if (sourceProduct.availableStock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${sourceProduct.availableStock}, Requested: ${quantity}`
      });
    }

    // Atomic transaction: deduct source, credit destination
    const order = await prisma.$transaction(async (tx) => {
      const to = await tx.transferOrder.create({
        data: {
          sourceCompanyId: req.user.companyId,
          destinationCompanyId,
          productId,
          quantity,
          status: 'COMPLETED'
        }
      });

      // 1. Deduct stock from source company
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

      // 2. Find or auto-create product in destination company catalog
      let destProduct = await tx.product.findFirst({
        where: { sku: sourceProduct.sku, companyId: destinationCompanyId }
      });

      if (!destProduct) {
        destProduct = await tx.product.create({
          data: {
            sku: sourceProduct.sku,
            name: sourceProduct.name,
            category: sourceProduct.category,
            unitCost: sourceProduct.unitCost,
            wholesalePrice: sourceProduct.wholesalePrice,
            availableStock: 0,
            committedStock: 0,
            companyId: destinationCompanyId,
            status: 'ACTIVE',
          }
        });
      }

      // 3. Credit stock to destination company
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

    // Audit log
    await prisma.auditLog.create({
      data: {
        event: 'TRANSFER_ORDER_COMPLETED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    // Return enriched order for UI
    const enriched = await prisma.transferOrder.findUnique({
      where: { id: order.id },
      include: {
        sourceCompany: { select: { name: true } },
        destinationCompany: { select: { name: true } },
        product: { select: { name: true, sku: true } }
      }
    });

    res.status(201).json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = { getTransferOrders, createTransferOrder };
