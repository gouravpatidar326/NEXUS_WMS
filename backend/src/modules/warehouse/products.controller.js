const prisma = require('../../utils/prisma');

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { 
        ...(req.user.companyId ? { companyId: req.user.companyId } : {}),
        status: { not: 'DELETED' }
      }
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
        ...(req.user.companyId ? { companyId: req.user.companyId } : {})
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.update({
      where: { id },
      data: { status: 'DELETED' }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getProducts, createProduct, deleteProduct };
