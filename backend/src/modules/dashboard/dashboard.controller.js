const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// SUPER_ADMIN Dashboard
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const activeCompanies = await prisma.company.count();

    const batches = await prisma.batch.findMany({
      include: { product: true }
    });
    
    const globalInventoryValue = batches.reduce((acc, batch) => {
      const val = batch.quantity * (batch.product.unitCost || 0);
      return acc + val;
    }, 0);

    const monthlyRevenue = 0; // Not implemented
    const systemUptime = "N/A"; // Not modeled in DB

    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true, company: true }
    });

    const companiesList = await prisma.company.findMany({
      include: {
        _count: { select: { salesOrders: true, users: true } }
      },
      take: 10
    });

    res.json({
      activeCompanies,
      globalInventoryValue,
      monthlyRevenue,
      systemUptime,
      auditLogs,
      companiesList
    });
  } catch (error) {
    console.error('Super Admin Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch super admin dashboard data.' });
  }
};

// WAREHOUSE_MANAGER Dashboard
exports.getManagerDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const warehouseCapacity = 0; // Not modeled

    const pendingTasks = await prisma.salesOrder.count({
      where: {
        companyId,
        status: { in: ['PENDING_APPROVAL', 'PICKING', 'PACKING'] }
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysShipments = await prisma.salesOrder.count({
      where: {
        companyId,
        status: 'SHIPPED',
        updatedAt: { gte: today }
      }
    });

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringLots = await prisma.batch.findMany({
      where: {
        companyId,
        expiryDate: { lte: thirtyDaysFromNow, gte: new Date() }
      },
      include: { product: true },
      orderBy: { expiryDate: 'asc' },
      take: 10
    });
    
    const nearExpiryCount = expiringLots.length;

    const incomingShipments = await prisma.purchaseOrder.findMany({
      where: {
        companyId,
        status: { in: ['PENDING', 'APPROVED'] }
      },
      take: 5,
      orderBy: { expectedDate: 'asc' }
    });

    res.json({
      warehouseCapacity,
      pendingTasks,
      todaysShipments,
      nearExpiryCount,
      expiringLots,
      incomingShipments
    });
  } catch (error) {
    console.error('Manager Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch manager dashboard data.' });
  }
};

// INVENTORY_CLERK Dashboard
exports.getClerkDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const totalSkus = await prisma.product.count({
      where: { companyId }
    });

    const openCycleCounts = 0; // Not modeled

    const products = await prisma.product.findMany({
      where: { companyId }
    });
    const lowStockAlerts = products.filter(p => p.totalStock < 50).length;
    const stockAlertsList = products.filter(p => p.totalStock < 50).slice(0, 5);

    const barcodesToPrint = 0; // Not modeled

    res.json({
      totalSkus,
      openCycleCounts,
      lowStockAlerts,
      barcodesToPrint,
      taskQueue: [], // Not modeled
      stockAlertsList
    });
  } catch (error) {
    console.error('Clerk Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch clerk dashboard data.' });
  }
};

// CLIENT Dashboard
exports.getClientDashboard = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const activeOrders = await prisma.salesOrder.count({
      where: {
        companyId,
        status: { notIn: ['DELIVERED', 'CANCELLED', 'REJECTED'] }
      }
    });

    const allOrders = await prisma.salesOrder.findMany({
      where: { companyId }
    });
    
    const totalSpend = allOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const availableCredits = 0; // Not modeled
    const coasPending = 0; // Not modeled

    const recentOrders = await prisma.salesOrder.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      activeOrders,
      totalSpend,
      availableCredits,
      coasPending,
      recentOrders
    });
  } catch (error) {
    console.error('Client Dashboard Error:', error);
    res.status(500).json({ error: 'Failed to fetch client dashboard data.' });
  }
};
