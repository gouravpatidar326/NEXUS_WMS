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
    const { zone, aisle, rack, shelf, maxCapacity } = req.body;

    if (!zone || !aisle || !rack || !shelf || maxCapacity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const location = await prisma.$transaction(async (tx) => {
      const newLoc = await tx.location.create({
        data: {
          zone,
          aisle,
          rack,
          shelf,
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

module.exports = {
  getLocations,
  createLocation
};
