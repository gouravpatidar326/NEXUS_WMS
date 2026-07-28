const prisma = require('../../utils/prisma');

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { companyId: req.user.companyId }
    });

    const isClient = req.user.role === 'CLIENT';

    const formattedProducts = products.map(product => {
      const p = { ...product };
      if (isClient) {
        delete p.unitCost;
      }
      return p;
    });

    res.json(formattedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { sku, name, category, unitCost, wholesalePrice } = req.body;
    
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category,
        unitCost: unitCost || 0,
        wholesalePrice: wholesalePrice || 0,
        companyId: req.user.companyId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProducts, createProduct };
