const prisma = require('../../utils/prisma');

// SUPER_ADMIN Dashboard
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const activeCompanies = await prisma.company.count();

    const products = await prisma.product.findMany({
      select: { availableStock: true, unitCost: true, wholesalePrice: true, companyId: true }
    });
    
    const globalInventoryValue = products.reduce((acc, prod) => {
      const val = (prod.availableStock || 0) * (prod.unitCost || prod.wholesalePrice || 0);
      return acc + val;
    }, 0);

    // Revenue calculation from Sales Orders
    const period = req.query.period || '30d';
    let daysToSubtract = 30;
    if (period === '7d') daysToSubtract = 7;
    if (period === 'all') daysToSubtract = 36500; // 100 years for "all time"

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - daysToSubtract);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - (daysToSubtract * 2));

    const salesOrders = await prisma.salesOrder.findMany({
      select: { totalCost: true, status: true, createdAt: true }
    });

    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;

    salesOrders.forEach(order => {
      if (['COMPLETED', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
        if (order.createdAt >= thirtyDaysAgo) {
          currentMonthRevenue += (order.totalCost || 0);
        } else if (order.createdAt >= sixtyDaysAgo && order.createdAt < thirtyDaysAgo) {
          previousMonthRevenue += (order.totalCost || 0);
        }
      }
    });

    const monthlyRevenue = currentMonthRevenue;
    let revenueGrowth = 0;
    if (previousMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    // Fulfillment Rate
    const recentOrders = salesOrders.filter(o => o.createdAt >= thirtyDaysAgo);
    const totalRecentOrders = recentOrders.length;
    const fulfilledOrders = recentOrders.filter(o => !['REJECTED', 'CANCELLED'].includes(o.status)).length;
    const fulfillmentRate = totalRecentOrders > 0 
      ? ((fulfilledOrders / totalRecentOrders) * 100).toFixed(1) + "%" 
      : "100.0%";

    // Warehouse capacity metrics
    const warehouses = await prisma.warehouse.findMany({
      select: { id: true, name: true, capacityValue: true, capacityType: true }
    });

    const locations = await prisma.location.findMany({
      where: { deletedAt: null },
      include: { locationInventories: { select: { quantity: true } } }
    });

    let totalCapacity = locations.reduce((sum, l) => sum + (l.maxCapacity || 0), 0);
    if (totalCapacity === 0) {
      totalCapacity = warehouses.reduce((sum, w) => sum + (w.capacityValue || 0), 0);
      if (totalCapacity === 0) totalCapacity = 25000;
    }

    let occupiedCapacity = locations.reduce((sum, loc) => {
      return sum + loc.locationInventories.reduce((acc, i) => acc + (i.quantity || 0), 0);
    }, 0);

    const utilizationPercent = totalCapacity > 0 ? Math.min(100, Math.round((occupiedCapacity / totalCapacity) * 100)) : 0;

    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    const rawCompanies = await prisma.company.findMany({
      include: {
        _count: { select: { salesOrders: true, users: true, warehouses: true } },
        products: { select: { availableStock: true, unitCost: true, wholesalePrice: true } },
        salesOrders: { select: { totalCost: true, status: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const companiesList = rawCompanies.map(c => {
      const companyInvVal = c.products?.reduce((acc, p) => acc + (p.availableStock || 0) * (p.unitCost || p.wholesalePrice || 0), 0) || 0;
      
      const companyMrr = c.salesOrders?.filter(o => 
        ['COMPLETED', 'SHIPPED', 'DELIVERED'].includes(o.status) && o.createdAt >= thirtyDaysAgo
      ).reduce((acc, o) => acc + (o.totalCost || 0), 0) || 0;

      return {
        id: c.id,
        name: c.name,
        industry: c.industry || 'General Warehouse',
        clientCode: c.clientCode,
        status: c.status || 'ACTIVE',
        isActive: c.status === 'ACTIVE',
        createdAt: c.createdAt,
        _count: c._count,
        inventoryValue: companyInvVal,
        mrrContribution: companyMrr
      };
    });

    res.json({
      activeCompanies,
      globalInventoryValue,
      monthlyRevenue,
      revenueGrowth,
      fulfillmentRate,
      totalCapacity,
      occupiedCapacity,
      utilizationPercent,
      warehousesCount: warehouses.length,
      locationsCount: locations.length,
      auditLogs,
      companiesList
    });
  } catch (error) {
    console.error('Super Admin Dashboard Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch super admin dashboard data.' });
  }
};

// WAREHOUSE_MANAGER Dashboard
exports.getManagerDashboard = async (req, res) => {
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

    // 2. Pending Pick Tasks
    const pendingPickLists = await prisma.salesOrder.count({
      where: {
        ...whereCompany,
        status: { in: ['PICKING', 'PENDING'] },
      },
    });

    // 3. Near Expiry Batches (< 30 days)
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

    const nearExpiryCount = nearExpiryBatches.length;

    // 4. Recent Shipments
    const recentShipments = await prisma.salesOrder.findMany({
      where: {
        ...whereCompany,
        status: 'SHIPPED',
      },
      include: { client: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });
    const todaysShipments = recentShipments.length;

    // 5. Incoming Purchase Orders
    const incomingShipments = await prisma.purchaseOrder.findMany({
      where: {
        ...whereCompany,
        status: { in: ['PENDING', 'APPROVED'] }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 6. Warehouse Capacity
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

    // 7. Gauges (Picking, Packing, Shipping)
    const allOrders = await prisma.salesOrder.findMany({ where: whereCompany });
    const activeOrdersForGauges = allOrders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status));
    const totalActiveOrders = activeOrdersForGauges.length > 0 ? activeOrdersForGauges.length : 1;

    // Packing
    const packedCount = activeOrdersForGauges.filter(o => ['PACKED', 'READY_TO_SHIP', 'SHIPPED'].includes(o.status)).length;
    const packingGauge = { actual: packedCount, total: activeOrdersForGauges.length, percent: Math.round((packedCount / totalActiveOrders) * 100) };

    // Shipping
    const shipments = await prisma.shipment.findMany({ where: whereCompany });
    const activeShipments = shipments.filter(s => !['DELIVERED', 'CANCELLED'].includes(s.status));
    const shippedCount = activeShipments.filter(s => ['SHIPPED', 'IN_TRANSIT'].includes(s.status)).length;
    const totalShipments = activeShipments.length > 0 ? activeShipments.length : 1;
    const shippingGauge = { actual: shippedCount, total: activeShipments.length, percent: Math.round((shippedCount / totalShipments) * 100) };

    // Picking
    const pickLists = await prisma.pickList.findMany({ where: whereCompany, include: { items: true } });
    let pickTotalItems = 0;
    let pickPickedItems = 0;
    pickLists.forEach(pl => {
      if(pl.status !== 'CANCELLED') {
        pl.items.forEach(item => {
          pickTotalItems += item.targetQuantity || 0;
          pickPickedItems += item.pickedQuantity || 0;
        });
      }
    });
    const pickGauge = { actual: pickPickedItems, total: pickTotalItems, percent: pickTotalItems > 0 ? Math.round((pickPickedItems / pickTotalItems) * 100) : 0 };

    // 8. Efficiency Trend (Past 7 Days Shipments)
    const past7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyShipments = past7Days.map(dateStr => {
      return shipments.filter(s => s.createdAt.toISOString().startsWith(dateStr)).length;
    });
    const maxShipments = Math.max(...dailyShipments, 1);
    const efficiencyData = dailyShipments.map(val => Math.round((val / maxShipments) * 100));

    res.json({
      warehouseCapacity: totalMaxCapacity,
      capacityPercentage,
      pendingTasks: pendingPickLists + pendingSalesOrders,
      pendingPickLists,
      pendingSalesOrders,
      todaysShipments,
      nearExpiryCount,
      expiringLots: nearExpiryBatches,
      nearExpiryBatches,
      incomingShipments,
      recentShipments,
      gauges: {
        picking: pickGauge,
        packing: packingGauge,
        shipping: shippingGauge
      },
      efficiencyData
    });
  } catch (error) {
    console.error('Manager Dashboard Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch manager dashboard data.' });
  }
};

// INVENTORY_CLERK Dashboard
exports.getClerkDashboard = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const whereCompany = companyId ? { companyId } : {};

    const totalSkus = await prisma.product.count({ where: whereCompany });
    
    const products = await prisma.product.findMany({ where: whereCompany });
    const lowStockAlerts = products.filter(p => (p.availableStock || 0) < 10).length;
    const stockAlertsList = products.filter(p => (p.availableStock || 0) < 10).slice(0, 5);

    // Active Barcodes
    const barcodesCount = await prisma.barcode.count({ where: whereCompany });
    const barcodesToPrint = barcodesCount > 0 ? barcodesCount : totalSkus;

    // Open Cycle Counts (Pending Transfers / Stock Audit Tasks)
    const openTransfers = await prisma.inventoryTransfer.count({
      where: { ...whereCompany, status: 'PENDING' }
    });
    const openCycleCounts = openTransfers > 0 ? openTransfers : 0;

    const pendingPickLists = await prisma.salesOrder.findMany({
      where: {
        ...whereCompany,
        status: { in: ['PENDING_REVIEW', 'PICKING', 'READY_TO_SHIP', 'PENDING'] },
      },
      include: { client: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    res.json({
      totalSkus,
      openCycleCounts,
      lowStockAlerts,
      barcodesToPrint,
      taskQueue: pendingPickLists,
      pendingPickLists,
      stockAlertsList
    });
  } catch (error) {
    console.error('Clerk Dashboard Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch clerk dashboard data.' });
  }
};

// CLIENT Dashboard
exports.getClientDashboard = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const clientId = req.user?.id;
    const whereCompany = companyId ? { companyId } : (clientId ? { clientId } : {});

    const activeOrders = await prisma.salesOrder.count({
      where: {
        ...whereCompany,
        status: { notIn: ['DELIVERED', 'CANCELLED', 'REJECTED'] }
      }
    });

    const allOrdersRaw = await prisma.salesOrder.findMany({
      where: whereCompany,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Sanitize product details for client (remove unitCost)
    const allOrders = allOrdersRaw.map(order => ({
      ...order,
      items: order.items.map(item => {
        if (item.product) {
          const { unitCost, ...safeProduct } = item.product;
          return { ...item, product: safeProduct };
        }
        return item;
      })
    }));

    const totalSpend = allOrders.reduce((acc, order) => acc + (order.totalCost || 0), 0);

    // Fetch actual credit limit
    const clientRecord = clientId ? await prisma.client.findUnique({ where: { id: clientId } }) : null;
    const availableCredits = clientRecord?.creditLimit || 0;

    // Fetch actual pending COAs
    const coasPending = await prisma.batch.count({
      where: {
        ...whereCompany,
        coaLocked: true
      }
    });

    const recentOrders = allOrders.slice(0, 5);
    const mostRecentOrder = allOrders[0] || null;

    res.json({
      activeOrders,
      totalSpend,
      availableCredits,
      coasPending,
      recentOrders,
      mostRecentOrder
    });
  } catch (error) {
    console.error('Client Dashboard Error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch client dashboard data.' });
  }
};
