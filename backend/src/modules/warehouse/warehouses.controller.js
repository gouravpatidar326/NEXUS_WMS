const prisma = require('../../utils/prisma');

const getWarehouses = async (req, res) => {
  try {
    const { companyId } = req.user;
    const where = companyId ? { companyId } : {};
    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createWarehouse = async (req, res) => {
  try {
    let { companyId } = req.user;
    const { name, code, address, city, state, country, zipCode, managerName, contactPhone, capacityType, capacityValue, facilityType, supportedItems } = req.body;

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

    const warehouse = await prisma.$transaction(async (tx) => {
      const newWarehouse = await tx.warehouse.create({
        data: {
          name,
          code,
          address,
          city,
          state,
          country,
          zipCode,
          managerName,
          contactPhone,
          capacityType,
          capacityValue,
          facilityType,
          supportedItems,
          companyId
        }
      });

      await tx.auditLog.create({
        data: {
          event: 'WAREHOUSE_FACILITY_CREATED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });

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
    const { name, code, facilityType, capacityType, capacityValue, supportedItems, managerName, contactPhone, address, city, state, country, zipCode } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id, ...(req.user.companyId ? { companyId: req.user.companyId } : {}) },
      data: {
        name,
        code,
        facilityType,
        capacityType,
        capacityValue,
        supportedItems,
        managerName,
        contactPhone,
        address,
        city,
        state,
        country,
        zipCode,
      }
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
