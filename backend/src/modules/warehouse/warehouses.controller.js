const prisma = require('../../utils/prisma');

const getWarehouses = async (req, res) => {
  try {
    const { companyId } = req.user;
    const where = companyId ? { companyId } : {};
    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { manager: true, company: { select: { name: true } } }
    });

    const enrichedWarehouses = await Promise.all(warehouses.map(async (warehouse) => {
      const locations = await prisma.location.findMany({
        where: { warehouse: warehouse.name, companyId: warehouse.companyId, deletedAt: null },
        include: { locationInventories: { select: { quantity: true } } }
      });
      
      const totalCapacity = warehouse.capacityValue || locations.reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0) || 0;
      let occupiedCapacity = 0;
      
      const bins = locations.map(loc => {
        const occupied = loc.locationInventories.reduce((acc, inv) => acc + (inv.quantity || 0), 0);
        occupiedCapacity += occupied;
        const maxCapacity = loc.maxCapacity || 0;
        return {
          locationCode: loc.code || loc.bin,
          maxCapacity,
          occupied,
          available: maxCapacity - occupied,
          utilizationPercent: maxCapacity > 0 ? Math.round((occupied / maxCapacity) * 100) : 0
        };
      });
      
      const utilizationPercent = totalCapacity > 0 ? Math.round((occupiedCapacity / totalCapacity) * 100) : 0;

      return {
        ...warehouse,
        totalCapacity,
        occupiedCapacity,
        freeCapacity: totalCapacity - occupiedCapacity,
        utilizationPercent,
        bins
      };
    }));

    res.json(enrichedWarehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const createWarehouse = async (req, res) => {
  try {
    let companyId = req.user.role === 'SUPER_ADMIN' && req.body.companyId ? req.body.companyId : req.user.companyId;
    let managerId = req.user.role === 'SUPER_ADMIN' && req.body.managerId ? req.body.managerId : req.user.id;
    const { name, code, address, city, state, country, zipCode, contactPhone, capacityType, capacityValue, facilityType, supportedItems } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Facility Name is required' });
    }

    if (!companyId) {
      const defaultCompany = await prisma.company.findFirst();
      if (defaultCompany) {
        companyId = defaultCompany.id;
      } else {
        return res.status(400).json({ message: 'No company found in database to associate warehouse with' });
      }
    }

    let finalCode = code;
    if (!finalCode) {
      const count = await prisma.warehouse.count({ where: { companyId } });
      finalCode = `FAC-${(count + 1).toString().padStart(3, '0')}`;
    } else {
      const existing = await prisma.warehouse.findFirst({ where: { companyId, code: finalCode } });
      if (existing) {
        return res.status(400).json({ message: 'Facility code already exists' });
      }
    }

    const warehouse = await prisma.$transaction(async (tx) => {
      const newWarehouse = await tx.warehouse.create({
        data: {
          name,
          code: finalCode,
          address,
          city,
          state,
          country,
          zipCode,
          managerId,
          contactPhone,
          capacityType,
          capacityValue,
          facilityType,
          supportedItems,
          companyId
        },
        include: { manager: true, company: { select: { name: true } } }
      });

      // Safely check if user exists before logging to avoid FK constraint errors with stale JWTs
      const userExists = req.user?.id ? await tx.user.findUnique({ where: { id: req.user.id } }) : null;
      if (userExists) {
        await tx.auditLog.create({
          data: {
            event: 'WAREHOUSE_FACILITY_CREATED',
            userId: req.user.id,
            ipAddress: req.ip
          }
        });
      }

      return newWarehouse;
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, facilityType, capacityType, capacityValue, supportedItems, contactPhone, address, city, state, country, zipCode } = req.body;
    
    let updateData = {
      name, code, facilityType, capacityType, capacityValue, supportedItems, contactPhone, address, city, state, country, zipCode
    };
    if (req.user.role === 'SUPER_ADMIN' && req.body.managerId) {
      updateData.managerId = req.body.managerId;
    }

    const warehouse = await prisma.warehouse.update({
      where: { id, ...(req.user.companyId ? { companyId: req.user.companyId } : {}) },
      data: updateData,
      include: { manager: true, company: { select: { name: true } } }
    });

    res.json(warehouse);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.warehouse.delete({
      where: { id, ...(req.user.companyId ? { companyId: req.user.companyId } : {}) }
    });

    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};
