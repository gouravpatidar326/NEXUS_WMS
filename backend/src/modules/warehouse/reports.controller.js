const prisma = require('../../utils/prisma');

const getStockValuation = async (req, res) => {
  try {
    const { companyId } = req.user;

    const products = await prisma.product.findMany({
      where: { companyId }
    });

    const valuationByCategory = {};

    for (const product of products) {
      const category = product.category || 'Uncategorized';
      if (!valuationByCategory[category]) {
        valuationByCategory[category] = { totalUnits: 0, totalValue: 0 };
      }
      
      valuationByCategory[category].totalUnits += product.availableStock;
      valuationByCategory[category].totalValue += product.availableStock * product.unitCost;
    }

    const result = Object.entries(valuationByCategory).map(([category, data]) => ({
      category,
      totalUnits: data.totalUnits,
      totalValue: data.totalValue
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in getStockValuation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getInventoryVelocity = async (req, res) => {
  try {
    const { companyId } = req.user;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await prisma.inventoryLedger.groupBy({
      by: ['movementType'],
      where: {
        companyId,
        timestamp: { gte: thirtyDaysAgo }
      },
      _count: {
        movementType: true
      }
    });

    const result = movements.map(m => ({
      movementType: m.movementType,
      count: m._count.movementType
    }));

    res.json(result);
  } catch (error) {
    console.error('Error in getInventoryVelocity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getStockValuation,
  getInventoryVelocity
};
