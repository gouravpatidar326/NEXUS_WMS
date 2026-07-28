const prisma = require('../../utils/prisma');

const getPickLists = async (req, res) => {
  try {
    const pickLists = await prisma.pickList.findMany({
      where: { companyId: req.user.companyId },
      include: {
        items: {
          include: { product: true, batch: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pickLists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const completePick = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body; // Array of { pickListItemId, pickedQuantity }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid pick items payload' });
    }

    const pickList = await prisma.pickList.findFirst({
      where: { id, companyId: req.user.companyId }
    });

    if (!pickList) {
      return res.status(404).json({ message: 'Pick list not found' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.pickListItem.update({
          where: { id: item.pickListItemId },
          data: {
            pickedQuantity: item.pickedQuantity,
            picked: true
          }
        });
      }

      await tx.pickList.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });
    });

    res.json({ id, status: 'COMPLETED' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateLocation = async (req, res) => {
  // Mock endpoint for barcode scanning location updates
  try {
    const { barcode, newLocation } = req.body;
    
    if (!barcode || !newLocation) {
      return res.status(400).json({ message: 'Barcode and newLocation required' });
    }

    await prisma.auditLog.create({
      data: {
        event: 'BARCODE_LOCATION_UPDATED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json({ status: 'Location Updated', barcode, location: newLocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const generateShippingLabel = async (req, res) => {
  // Interface-compatible mock for ShipStation label generation
  try {
    const { orderId, carrier } = req.body;

    if (!orderId || !carrier) {
      return res.status(400).json({ message: 'Order ID and carrier required' });
    }

    // Mock ShipStation response structure
    const mockResponse = {
      trackingId: `SS-TRACK-${Math.floor(Math.random() * 90000) + 10000}`,
      carrier: carrier,
      labelUrl: 'https://mock.shipstation.com/labels/sample.pdf',
      status: 'LABEL_CREATED',
      timestamp: new Date().toISOString()
    };

    await prisma.auditLog.create({
      data: {
        event: 'SHIPSTATION_LABEL_GENERATED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json(mockResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPickLists, completePick, updateLocation, generateShippingLabel };
