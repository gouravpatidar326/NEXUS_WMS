const prisma = require('../../utils/prisma');

const getStockValuation = async (req, res) => {
  try {
    const { companyId } = req.user;

    const where = companyId ? { companyId } : {};

    const products = await prisma.product.findMany({
      where,
      include: { categoryRef: true },
    });

    const valuationByCategory = {};

    for (const product of products) {
      const categoryName = product.categoryRef?.name || product.category || 'General Inventory';
      if (!valuationByCategory[categoryName]) {
        valuationByCategory[categoryName] = { totalUnits: 0, totalValue: 0 };
      }

      const stock = product.availableStock || 0;
      const cost = product.unitCost || 0;
      valuationByCategory[categoryName].totalUnits += stock;
      valuationByCategory[categoryName].totalValue += stock * cost;
    }

    const result = Object.entries(valuationByCategory).map(([category, data]) => ({
      category,
      name: category,
      totalUnits: data.totalUnits,
      totalValue: Math.round(data.totalValue * 100) / 100,
      value: data.totalUnits > 0 ? data.totalUnits : 1,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in getStockValuation:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const getInventoryVelocity = async (req, res) => {
  try {
    const { companyId } = req.user;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where = {
      ...(companyId ? { companyId } : {}),
      timestamp: { gte: thirtyDaysAgo },
    };

    const movements = await prisma.inventoryLedger.groupBy({
      by: ['movementType'],
      where,
      _count: {
        movementType: true,
      },
    });

    const result = movements.map((m) => ({
      movementType: m.movementType,
      count: m._count.movementType,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in getInventoryVelocity:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getStockValuation,
  getInventoryVelocity,
};
