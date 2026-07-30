const prisma = require('../../utils/prisma');

const getLocations = async (req, res) => {
  try {
    const { companyId } = req.user;
    const locations = await prisma.location.findMany({
      where: { companyId }
    });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createLocation = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { warehouse, zone, aisle, rack, shelf, bin, capacityType, maxCapacity } = req.body;

    if (!zone || !aisle || !rack || !shelf || maxCapacity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const location = await prisma.$transaction(async (tx) => {
      const newLoc = await tx.location.create({
        data: {
          warehouse: warehouse || 'Main Warehouse',
          zone,
          aisle,
          rack,
          shelf,
          bin,
          capacityType: capacityType || 'Items',
          maxCapacity: parseInt(maxCapacity, 10),
          companyId
        }
      });

      await tx.auditLog.create({
        data: {
          event: 'LOCATION_CREATED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });

      return newLoc;
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouse, zone, aisle, rack, shelf, bin, capacityType, maxCapacity } = req.body;

    const location = await prisma.location.update({
      where: { id, companyId: req.user.companyId },
      data: {
        warehouse,
        zone,
        aisle,
        rack,
        shelf,
        bin,
        capacityType,
        maxCapacity: parseInt(maxCapacity, 10)
      }
    });

    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.location.delete({
      where: { id, companyId: req.user.companyId }
    });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation
};
