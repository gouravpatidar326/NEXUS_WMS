const prisma = require('../../utils/prisma');

const getManagerSummary = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    // 1. Pending Sales Orders
    const pendingSalesOrders = await prisma.salesOrder.count({
      where: {
        ...(companyId ? { companyId } : {}),
        status: 'PENDING_REVIEW'
      }
    });

    // 2. Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        availableStock: { lt: 10 }
      },
      select: {
        id: true,
        sku: true,
        name: true,
        availableStock: true
      }
    });

    // 3. Near Expiry Batches
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const nearExpiryBatches = await prisma.batch.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        quarantine: false,
        expiryDate: { lte: thirtyDaysFromNow }
      },
      select: {
        id: true,
        lotId: true,
        productId: true,
        expiryDate: true
      }
    });

    // 4. Pending Pick Lists
    const pendingPickLists = await prisma.pickList.count({
      where: {
        ...(companyId ? { companyId } : {}),
        status: { not: 'COMPLETED' }
      }
    });

    // 5. Pending Purchase Orders
    const pendingPurchaseOrders = await prisma.purchaseOrder.count({
      where: {
        ...(companyId ? { companyId } : {}),
        status: 'PENDING'
      }
    });

    res.json({
      pendingSalesOrders,
      lowStockProducts,
      nearExpiryBatches,
      pendingPickLists,
      pendingPurchaseOrders
    });
  } catch (error) {
    console.error('Error fetching manager summary:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getManagerSummary
};
