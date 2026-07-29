const prisma = require('../../utils/prisma');

const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      select: { id: true, name: true, industry: true },
      orderBy: { name: 'asc' },
    });
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
        const pickItem = await tx.pickListItem.findUnique({
          where: { id: item.pickListItemId }
        });

        let assignedBatchId = pickItem.batchId;

        if (!assignedBatchId) {
          const batch = await tx.batch.findFirst({
            where: {
              productId: pickItem.productId,
              companyId: req.user.companyId,
              quarantine: false
            },
            orderBy: {
              expiryDate: 'asc'
            }
          });

          if (batch) {
            assignedBatchId = batch.id;
          }
        }

        await tx.pickListItem.update({
          where: { id: item.pickListItemId },
          data: {
            pickedQuantity: item.pickedQuantity,
            picked: true,
            ...(assignedBatchId && { batchId: assignedBatchId })
          }
        });
      }

      await tx.pickList.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      // Update SalesOrder status to PACKING
      if (pickList.orderId) {
        // We assume orderId is the SalesOrder ID
        const salesOrder = await tx.salesOrder.findUnique({
          where: { id: pickList.orderId }
        });
        if (salesOrder) {
          await tx.salesOrder.update({
            where: { id: pickList.orderId },
            data: { status: 'PACKING' }
          });
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        event: 'PICK_LIST_COMPLETED',
        userId: req.user.id,
        ipAddress: req.ip
      }
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

const getShipments = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(shipments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const generateShippingLabel = async (req, res) => {
  try {
    const { orderId, carrier, recipient, destination } = req.body;

    if (!orderId || !carrier) {
      return res.status(400).json({ message: 'Order ID and carrier required' });
    }

    const mockTrackingId = `SS-TRACK-${Math.floor(Math.random() * 90000) + 10000}`;
    const mockLabelUrl = 'https://mock.shipstation.com/labels/sample.pdf';

    const shipment = await prisma.$transaction(async (tx) => {
      const newShipment = await tx.shipment.create({
        data: {
          trackingNumber: mockTrackingId,
          carrier,
          orderId,
          recipient: recipient || 'Unknown',
          destination: destination || 'Unknown',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'LABEL_CREATED',
          labelUrl: mockLabelUrl,
          companyId: req.user.companyId
        }
      });

      await tx.auditLog.create({
        data: {
          event: 'SHIPSTATION_LABEL_GENERATED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });

      // Update SalesOrder status to SHIPPED
      const salesOrder = await tx.salesOrder.findUnique({
        where: { id: orderId }
      });
      if (salesOrder) {
        await tx.salesOrder.update({
          where: { id: orderId },
          data: { status: 'SHIPPED' }
        });
      }

      return newShipment;
    });

    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getCarriers = async (req, res) => {
  try {
    let settings = await prisma.systemSettings.findUnique({ where: { key: 'CARRIERS' } });
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          key: 'CARRIERS',
          value: JSON.stringify(['FedEx Freight', 'UPS Express', 'DHL Supply Chain', 'XPO Logistics', 'Blue Dart', 'Delhivery'])
        }
      });
    }
    res.json(JSON.parse(settings.value));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await prisma.shipment.findFirst({
      where: { id, companyId: req.user.companyId }
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    await prisma.shipment.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        event: 'SHIPMENT_DELETED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPickLists, completePick, updateLocation, generateShippingLabel, getShipments, getCompanies, getCarriers, deleteShipment };
