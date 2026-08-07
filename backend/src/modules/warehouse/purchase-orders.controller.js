const prisma = require('../../utils/prisma');

const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: { ...(req.user.companyId ? { ...(req.user.companyId ? { companyId: req.user.companyId } : {}) } : {}) },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format for frontend
    const formattedOrders = orders.map(order => ({
      ...order,
      // Ensure frontend format expects these
      totalAmount: order.totalCost
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, expectedDelivery, totalCost, items } = req.body;
    let companyId = req.user?.companyId || req.body?.companyId;

    if (!companyId) {
      const defaultCompany = await prisma.company.findFirst();
      if (defaultCompany) {
        companyId = defaultCompany.id;
      }
    }

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required to create Purchase Orders' });
    }

    if (!supplier || !items || !items.length) {
      return res.status(400).json({ message: 'Supplier and items are required' });
    }

    // Generate unique PO Number
    const count = await prisma.purchaseOrder.count({ where: { companyId } });
    let poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Ensure uniqueness
    const existing = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
    if (existing) {
      poNumber = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    }

    const newPO = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          supplier,
          expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
          totalCost: Number(totalCost) || 0,
          companyId,
          status: 'APPROVED', // Auto-approve for now based on current flow
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              unitCost: Number(item.unitCost) || 0
            }))
          }
        },
        include: {
          items: { include: { product: true } }
        }
      });
      return po;
    });

    const userExists = req.user?.id ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (userExists) {
      await prisma.auditLog.create({
        data: {
          event: 'PO_CREATED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });
    }

    res.status(201).json(newPO);
  } catch (error) {
    console.error('Create PO Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const receiveGoods = async (req, res) => {
  try {
    const { id } = req.params;
    const { lots } = req.body; // Array of { lotId, productId, mfgDate, expiryDate, binLocation, quantity }

    if (!lots || !Array.isArray(lots) || lots.length === 0) {
      return res.status(400).json({ message: 'Must provide lots to receive' });
    }

    const order = await prisma.purchaseOrder.findFirst({
      where: { id, ...(req.user.companyId ? { ...(req.user.companyId ? { companyId: req.user.companyId } : {}) } : {}) }
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
            companyId: order.companyId,
            mfgDate: lot.mfgDate ? new Date(lot.mfgDate) : null,
            expiryDate: lot.expiryDate ? new Date(lot.expiryDate) : null,
            coaLocked: false, // Inbound docs might not need lock if they trust vendor, or keep it true based on business rule
            quarantine: false
          }
        });

        // Add to inventory ledger
        await tx.inventoryLedger.create({
          data: {
            productId: lot.productId,
            companyId: order.companyId,
            location: lot.binLocation,
            quantityDelta: Number(lot.quantity),
            movementType: 'PO_RECEIPT'
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: lot.productId },
          data: {
            availableStock: { increment: Number(lot.quantity) }
          }
        });
      }
    });

    const userExists = req.user?.id ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (userExists) {
      await prisma.auditLog.create({
        data: {
          event: 'PO_RECEIVED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });
    }

    res.json({ id, status: 'RECEIVED' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const order = await prisma.purchaseOrder.findFirst({
      where: { id, companyId }
    });

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (order.status === 'RECEIVED') {
      return res.status(400).json({ message: 'Cannot delete a received purchase order' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id }
      });
      await tx.purchaseOrder.delete({
        where: { id }
      });
    });

    const userExists = req.user?.id ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (userExists) {
      await prisma.auditLog.create({
        data: {
          event: 'PO_DELETED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });
    }

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete PO Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPurchaseOrders, createPurchaseOrder, receiveGoods, deletePurchaseOrder };
