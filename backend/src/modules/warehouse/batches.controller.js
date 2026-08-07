const prisma = require('../../utils/prisma');

const getBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      where: req.user.companyId ? { companyId: req.user.companyId } : {},
      include: { product: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createBatch = async (req, res) => {
  try {
    let companyId = req.user.companyId;
    const { lotId, productId, mfgDate, expiryDate } = req.body;

    if (!lotId || !productId) {
      return res.status(400).json({ message: 'lotId and productId are required' });
    }

    if (!companyId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product) {
        companyId = product.companyId;
      }
      if (!companyId) {
        const defaultCompany = await prisma.company.findFirst();
        if (defaultCompany) {
          companyId = defaultCompany.id;
        }
      }
    }

    const newBatch = await prisma.batch.create({
      data: {
        lotId,
        productId,
        companyId,
        mfgDate: mfgDate ? new Date(mfgDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        quarantine: false,
        coaLocked: false,
      },
      include: {
        product: true
      }
    });

    // Auto-generate a Tracking Barcode for this Batch
    try {
      const barcodeService = require('../../services/barcode.service');
      await barcodeService.generateBarcode(companyId, {
        productId: newBatch.productId,
        batchId: newBatch.id,
        barcodeType: 'CODE128'
      });
    } catch (bcError) {
      console.error('Failed to auto-generate barcode for batch:', bcError);
    }

    res.status(201).json(newBatch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { quarantine } = req.body;

    const batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { id: id },
          { lotId: id }
        ]
      }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const updatedBatch = await prisma.batch.update({
      where: { id: batch.id },
      data: {
        quarantine: quarantine !== undefined ? quarantine : batch.quarantine
      },
      include: {
        product: true
      }
    });

    res.json(updatedBatch);
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const unlockCoa = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { id: id },
          { lotId: id }
        ]
      }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const updatedBatch = await prisma.batch.update({
      where: { id: batch.id },
      data: { coaLocked: false }
    });

    await prisma.auditLog.create({
      data: {
        event: 'COA_UNLOCKED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    }).catch(() => {});

    res.json({ id: updatedBatch.id, coaLocked: false, message: 'Unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking COA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    const batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { id: id },
          { lotId: id }
        ]
      }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const targetId = batch.id;

    // Clear FK-linked records before deletion
    await prisma.barcode.deleteMany({ where: { batchId: targetId } }).catch(() => {});
    await prisma.locationInventory.deleteMany({ where: { lotId: targetId } }).catch(() => {});
    await prisma.inventoryLedger.deleteMany({ where: { lotId: targetId } }).catch(() => {});
    await prisma.transferItem.deleteMany({ where: { lotId: targetId } }).catch(() => {});
    await prisma.stockAdjustment.deleteMany({ where: { lotId: targetId } }).catch(() => {});
    await prisma.expiryAlert.deleteMany({ where: { lotId: targetId } }).catch(() => {});
    await prisma.pickListItem.deleteMany({ where: { batchId: targetId } }).catch(() => {});

    await prisma.batch.delete({ where: { id: targetId } });

    await prisma.auditLog.create({
      data: {
        event: 'BATCH_DELETED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    }).catch(() => {});

    res.json({ message: `Batch ${batch.lotId} deleted successfully`, id: targetId });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = { getBatches, createBatch, updateBatch, unlockCoa, deleteBatch };
