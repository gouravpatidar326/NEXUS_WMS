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
        company: { connect: { id: req.user.companyId || (await prisma.company.findFirst()).id } },
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

const createBulkProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products provided for bulk creation.' });
    }

    let companyId = req.user.companyId;
    if (!companyId) {
      const defaultCompany = await prisma.company.findFirst();
      if (!defaultCompany) return res.status(400).json({ message: 'No company found' });
      companyId = defaultCompany.id;
    }

    // Format products for Prisma createMany
    const productsData = products.map((p) => ({
      sku: p.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: p.name || 'Unnamed Product',
      barcode: p.barcode || null,
      status: p.status || 'ACTIVE',
      companyId: companyId,
      unitCost: 0.0,
      wholesalePrice: 0.0,
      uom: 'Piece',
      storageType: 'General Storage',
      trackingMethod: 'None',
      availableStock: 0,
      committedStock: 0
    }));

    // Filter out SKUs that already exist to prevent Unique Constraint errors if SKU was marked unique (though schema says ID is PK, SKU isn't strictly unique in schema, but good practice)
    // Actually, SKU isn't marked @unique in schema.prisma, so createMany will just work.
    
    const result = await prisma.product.createMany({
      data: productsData,
      skipDuplicates: true // Helpful if SKU becomes unique later
    });

    res.status(201).json({ message: `Successfully imported ${result.count} products.`, count: result.count });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error during bulk import' });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, createBulkProducts };
