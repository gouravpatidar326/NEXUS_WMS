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
    const { companyId } = req.user;
    const where = companyId ? { companyId } : {};
    const pickLists = await prisma.pickList.findMany({
      where,
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

    const { companyId } = req.user;
    const where = { id };
    if (companyId) where.companyId = companyId;

    const pickList = await prisma.pickList.findFirst({ where });

    if (!pickList) {
      return res.status(404).json({ message: 'Pick list not found' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const pickItem = await tx.pickListItem.findUnique({
          where: { id: item.pickListItemId }
        });

        if (!pickItem) continue;

        let assignedBatchId = pickItem.batchId;

        if (!assignedBatchId) {
          const batch = await tx.batch.findFirst({
            where: { productId: pickItem.productId, ...(companyId ? { companyId } : {}), quarantine: false },
            orderBy: { expiryDate: 'asc' }
          });
          if (batch) assignedBatchId = batch.id;
        }

        const pickedQty = item.pickedQuantity || pickItem.targetQuantity;

        await tx.pickListItem.update({
          where: { id: item.pickListItemId },
          data: {
            pickedQuantity: pickedQty,
            picked: true,
            ...(assignedBatchId && { batchId: assignedBatchId })
          }
        });

        // Deduct from LocationInventory
        const locInvs = await tx.locationInventory.findMany({
          where: {
            productId: pickItem.productId,
            ...(companyId ? { companyId } : {}),
            quantity: { gt: 0 }
          },
          orderBy: { quantity: 'desc' }
        });

        let remainingToDeduct = pickedQty;
        for (const locInv of locInvs) {
          if (remainingToDeduct <= 0) break;
          const deductFromThisBin = Math.min(locInv.quantity, remainingToDeduct);

          await tx.locationInventory.update({
            where: { id: locInv.id },
            data: {
              quantity: { decrement: deductFromThisBin },
              available: { decrement: deductFromThisBin }
            }
          });

          remainingToDeduct -= deductFromThisBin;

          // Record Immutable Inventory Transaction (SHIP)
          await tx.inventoryLedger.create({
            data: {
              productId: pickItem.productId,
              lotId: assignedBatchId || locInv.lotId || null,
              companyId: companyId || locInv.companyId,
              locationId: locInv.locationId,
              quantityDelta: -deductFromThisBin,
              movementType: 'SHIP',
              referenceId: `ORDER-${pickList.orderId || Date.now()}`,
              notes: `Outbound pick & ship from location bin ${locInv.locationId}`,
            }
          });
        }

        // Deduct totalStock and reservedStock from company aggregate
        const inv = await tx.inventory.findFirst({
          where: { productId: pickItem.productId, ...(companyId ? { companyId } : {}) }
        });
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              totalStock: { decrement: pickedQty },
              reservedStock: { decrement: Math.min(inv.reservedStock, pickedQty) },
              availableStock: { decrement: Math.min(inv.availableStock, pickedQty) }
            }
          });
        }

        // Sync Product.availableStock cache dynamically
        const allLocs = await tx.locationInventory.findMany({
          where: { productId: pickItem.productId }
        });
        const totalAvailable = allLocs.reduce((sum, l) => sum + (l.available || 0), 0);
        await tx.product.update({
          where: { id: pickItem.productId },
          data: { availableStock: Math.max(0, totalAvailable) }
        });
      }

      await tx.pickList.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      // Update SalesOrder status to PACKING
      if (pickList.orderId) {
        const salesOrder = await tx.salesOrder.findUnique({ where: { id: pickList.orderId } });
        if (salesOrder) {
          await tx.salesOrder.update({
            where: { id: pickList.orderId },
            data: { status: 'PACKING' }
          });
        }
      }
    });

    const userExists = req.user?.id ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (userExists) {
      await prisma.auditLog.create({
        data: { event: 'PICK_LIST_COMPLETED', userId: req.user.id, ipAddress: req.ip }
      });
    }

    res.json({ id, status: 'COMPLETED' });
  } catch (error) {
    console.error('completePick error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updateLocation = async (req, res) => {
  // Mock endpoint for barcode scanning location updates
  try {
    const { barcode, newLocation } = req.body;
    
    if (!barcode || !newLocation) {
      return res.status(400).json({ message: 'Barcode and newLocation required' });
    }

    const userExists = req.user?.id ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (userExists) {
      await prisma.auditLog.create({
        data: { event: 'BARCODE_LOCATION_UPDATED', userId: req.user.id, ipAddress: req.ip }
      });
    }

    res.json({ status: 'Location Updated', barcode, location: newLocation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getShipments = async (req, res) => {
  try {
    const { companyId } = req.user;
    const where = companyId ? { companyId } : {};
    const shipments = await prisma.shipment.findMany({
      where,
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
          ...(req.user.companyId ? { companyId: req.user.companyId } : {})
        }
      });

      const userExists = req.user?.id ? await tx.user.findUnique({ where: { id: req.user.id } }) : null;
      if (userExists) {
        await tx.auditLog.create({
          data: { event: 'SHIPSTATION_LABEL_GENERATED', userId: req.user.id, ipAddress: req.ip }
        });
      }

      // Update SalesOrder status to SHIPPED
      const salesOrder = await tx.salesOrder.findUnique({ where: { id: orderId } });
      if (salesOrder) {
        await tx.salesOrder.update({ where: { id: orderId }, data: { status: 'SHIPPED' } });
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
      where: { id, ...(req.user.companyId ? { ...(req.user.companyId ? { companyId: req.user.companyId } : {}) } : {}) }
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    await prisma.shipment.delete({ where: { id } });

    const userExists = req.user?.id ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
    if (userExists) {
      await prisma.auditLog.create({
        data: { event: 'SHIPMENT_DELETED', userId: req.user.id, ipAddress: req.ip }
      });
    }

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getPickLists, completePick, updateLocation, generateShippingLabel, getShipments, getCompanies, getCarriers, deleteShipment };
