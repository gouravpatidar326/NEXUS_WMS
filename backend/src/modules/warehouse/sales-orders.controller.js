const prisma = require('../../utils/prisma');
const NotificationService = require('../../utils/notification.service');

const getSalesOrders = async (req, res) => {
  try {
    const { companyId } = req.user;
    const where = companyId ? { companyId } : {};
    const orders = await prisma.salesOrder.findMany({
      where,
      include: {
        items: { include: { product: true } },
        client: { select: { name: true, tier: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const approveSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const where = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const order = await prisma.salesOrder.findFirst({
      where,
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    if (order.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ message: 'Order is not in a pending state' });
    }

    // Wrap in transaction to ensure stock is reserved safely
    await prisma.$transaction(async (tx) => {
      // 1. Check stock and collect warnings — do NOT hard-block approval
      const stockWarnings = [];
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if ((product.availableStock || 0) < item.quantity) {
          stockWarnings.push({
            productId: item.productId,
            sku: product.sku,
            available: product.availableStock || 0,
            requested: item.quantity
          });
        }
      }

      // 2. Deduct available, increment committed — only if stock is available
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const availQty = product.availableStock || 0;
        const deductQty = Math.min(availQty, item.quantity); // Deduct only what is available
        if (deductQty > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              availableStock: { decrement: deductQty },
              committedStock: { increment: deductQty }
            }
          });
        }
      }

      // 3. Create a PickList
      const pickListItems = order.items.map(item => ({
        productId: item.productId,
        binLocation: 'A-01-RACK-1', // Defaulting to a mock location for now
        targetQuantity: item.quantity
      }));

      await tx.pickList.create({
        data: {
          orderId: order.id,
          companyId: req.user.companyId,
          status: 'PENDING',
          items: {
            create: pickListItems
          }
        }
      });

      // 4. Update order status
      await tx.salesOrder.update({
        where: { id },
        data: { status: 'PICKING' }
      });
    });

    await prisma.auditLog.create({
      data: {
        event: 'SALES_ORDER_APPROVED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    // Notify Client
    await NotificationService.send({
      title: 'Order Approved',
      message: `Your order (${order.id}) has been approved and is now being picked.`,
      companyId: order.companyId
    });

    res.json({ id, status: 'PICKING' });
  } catch (error) {
    console.error(error);
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const rejectSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const { companyId } = req.user;
    const where = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const order = await prisma.salesOrder.findFirst({
      where
    });

    if (!order) {
      return res.status(404).json({ message: 'Sales order not found' });
    }

    if (order.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ message: 'Order is not in a pending state' });
    }

    await prisma.salesOrder.update({
      where: { id },
      data: { status: 'REJECTED', rejectionReason: reason }
    });

    await prisma.auditLog.create({
      data: {
        event: 'SALES_ORDER_REJECTED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    // Notify Client
    await NotificationService.send({
      title: 'Order Rejected',
      message: `Your order (${order.id}) was rejected. Reason: ${reason}`,
      companyId: order.companyId
    });

    res.json({ id, status: 'REJECTED' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSalesOrder = async (req, res) => {
  try {
    const { clientId, priority, items, shippingAddress, poNumber, notes } = req.body;

    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Client ID and items are required' });
    }

    // Calculate total cost and generate order number
    let totalCost = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      totalCost += product.wholesalePrice * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity
      });
    }

    const orderNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.salesOrder.create({
      data: {
        orderNumber,
        clientId,
        companyId: req.user.companyId,
        priority: priority || 'NORMAL',
        shippingAddress,
        poNumber,
        notes,
        totalCost,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: { include: { product: true } },
        client: true
      }
    });

    await prisma.auditLog.create({
      data: {
        event: 'SALES_ORDER_CREATED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getSalesOrders, approveSalesOrder, rejectSalesOrder, createSalesOrder };
