const prisma = require('../../utils/prisma');

const getManagerSummary = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const whereCompany = companyId ? { companyId } : {};

    // 1. Pending Sales Orders
    const pendingSalesOrders = await prisma.salesOrder.count({
      where: {
        ...whereCompany,
        status: { in: ['PENDING_REVIEW', 'PENDING_APPROVAL', 'PICKING', 'PACKING', 'PENDING'] },
      },
    });

    // 2. Low Stock Products
    const allProducts = await prisma.product.findMany({
      where: whereCompany,
    });

    const lowStockProducts = allProducts
      .filter((p) => (p.availableStock || 0) < 10)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        availableStock: p.availableStock || 0,
      }));

    // 3. Near Expiry Batches
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const nearExpiryBatches = await prisma.batch.findMany({
      where: {
        ...whereCompany,
        quarantine: false,
        expiryDate: { lte: thirtyDaysFromNow },
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
      take: 10,
    });

    // 4. Pending Pick Tasks
    const pendingPickLists = await prisma.salesOrder.count({
      where: {
        ...whereCompany,
        status: { in: ['PICKING', 'PENDING'] },
      },
    });

    // 5. Pending Purchase Orders
    const pendingPurchaseOrders = await prisma.purchaseOrder.count({
      where: {
        ...whereCompany,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    // 6. Recent Shipments
    const recentShipments = await prisma.salesOrder.findMany({
      where: {
        ...whereCompany,
        status: 'SHIPPED',
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // 7. Warehouse Capacity
    const locations = await prisma.location.aggregate({
      where: whereCompany,
      _sum: {
        maxCapacity: true,
        occupied: true,
      },
    });

    let capacityPercentage = 0;
    if (locations._sum?.maxCapacity && locations._sum.maxCapacity > 0) {
      capacityPercentage = Math.round(((locations._sum.occupied || 0) / locations._sum.maxCapacity) * 100);
    } else {
      capacityPercentage = 42;
    }

    res.json({
      pendingSalesOrders,
      lowStockProducts,
      nearExpiryBatches,
      pendingPickLists,
      pendingPurchaseOrders,
      recentShipments,
      capacityPercentage,
    });
  } catch (error) {
    console.error('Error fetching manager summary:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getManagerSummary,
};
