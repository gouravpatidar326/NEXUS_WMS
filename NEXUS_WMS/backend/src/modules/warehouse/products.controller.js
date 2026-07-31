const prisma = require('../../utils/prisma');

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { 
        companyId: req.user.companyId,
        status: { not: 'DELETED' }
      },
      include: {
        specification: true
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
    const { sku, name, barcode, categoryId, brand, uom, storageType, trackingMethod, unitCost, wholesalePrice, description, specification } = req.body;
    
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        barcode,
        categoryId,
        brand,
        uom,
        storageType,
        trackingMethod,
        description,
        unitCost: unitCost || 0,
        wholesalePrice: wholesalePrice || 0,
        companyId: req.user.companyId,
        ...(specification && Object.keys(specification).some(k => specification[k] !== null) ? {
          specification: {
            create: {
              weight: specification.weight,
              length: specification.length,
              width: specification.width,
              height: specification.height,
              volume: specification.volume
            }
          }
        } : {})
      },
      include: {
        specification: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, barcode, categoryId, brand, uom, storageType, trackingMethod, unitCost, wholesalePrice, description, specification } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        name,
        barcode,
        categoryId,
        brand,
        uom,
        storageType,
        trackingMethod,
        description,
        unitCost: unitCost !== undefined ? unitCost : undefined,
        wholesalePrice: wholesalePrice !== undefined ? wholesalePrice : undefined,
        ...(specification ? {
          specification: {
            upsert: {
              create: {
                weight: specification.weight,
                length: specification.length,
                width: specification.width,
                height: specification.height,
                volume: specification.volume
              },
              update: {
                weight: specification.weight,
                length: specification.length,
                width: specification.width,
                height: specification.height,
                volume: specification.volume
              }
            }
          }
        } : {})
      },
      include: {
        specification: true
      }
    });

    res.json(product);
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

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
