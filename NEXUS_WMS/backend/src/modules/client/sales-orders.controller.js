const prisma = require('../../utils/prisma');
const NotificationService = require('../../utils/notification.service');

const getSalesOrders = async (req, res) => {
  try {
    // In a real app, req.user would have a clientId if role === CLIENT.
    // For this mockup, we assume the user represents the client for their company.
    // If you had a distinct clientId on the JWT, filter by that.
    const orders = await prisma.salesOrder.findMany({
      where: { ...(req.user.companyId ? { ...(req.user.companyId ? { companyId: req.user.companyId } : {}) } : {}) },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createSalesOrder = async (req, res) => {
  try {
    const { clientId, items } = req.body; // items: [{ productId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // In a real app, clientId would be strictly enforced by the auth token
    const effectiveClientId = clientId || "unknown-client"; // Mocking clientId for phase 3 test without full client auth state

    let totalCost = 0;
    
    // Validate products exist and calculate total (using wholesale price for clients)
    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, ...(req.user.companyId ? { companyId: req.user.companyId } : {}) }
      });
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found in catalog` });
      }
      totalCost += product.wholesalePrice * item.quantity;
    }

    const order = await prisma.salesOrder.create({
      data: {
        clientId: effectiveClientId,
        ...(req.user.companyId ? { companyId: req.user.companyId } : {}),
        status: 'PENDING_REVIEW',
        totalCost,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });

    await prisma.auditLog.create({
      data: {
        event: 'SALES_ORDER_REQUESTED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    // Notify Warehouse Managers
    await NotificationService.send({
      title: 'New Order Request',
      message: `A new order request (${order.id}) has been placed and is pending review.`,
      ...(req.user.companyId ? { companyId: req.user.companyId } : {})
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getSalesOrders, createSalesOrder };
