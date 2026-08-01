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
    const activeLocations = await prisma.location.findMany({
      where: { ...whereCompany, deletedAt: null },
      include: { locationInventories: { select: { quantity: true } } }
    });

    let totalMaxCapacity = 0;
    let totalOccupied = 0;

    activeLocations.forEach(loc => {
      totalMaxCapacity += (loc.maxCapacity || 0);
      const locOccupied = loc.locationInventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
      totalOccupied += locOccupied;
    });

    let capacityPercentage = 0;
    if (totalMaxCapacity > 0) {
      capacityPercentage = Math.round((totalOccupied / totalMaxCapacity) * 100);
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

const getClerkDashboard = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const whereCompany = companyId ? { companyId } : {};

    const totalSkus = await prisma.product.count({ where: whereCompany });
    
    const lowStockAlerts = await prisma.product.count({
      where: {
        ...whereCompany,
        availableStock: { lt: 10 }
      }
    });

    const stockAlertsList = await prisma.product.findMany({
      where: {
        ...whereCompany,
        availableStock: { lt: 10 }
      },
      select: {
        id: true,
        sku: true,
        name: true,
        availableStock: true
      },
      take: 5
    });

    const pendingPickLists = await prisma.salesOrder.findMany({
      where: {
        ...whereCompany,
        status: { in: ['PENDING_APPROVAL', 'PICKING', 'READY_TO_SHIP'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    res.json({
      totalSkus,
      lowStockAlerts,
      stockAlertsList,
      pendingPickLists
    });
  } catch (error) {
    console.error('Error fetching clerk summary:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = {
  getManagerSummary,
  getClerkDashboard
};
