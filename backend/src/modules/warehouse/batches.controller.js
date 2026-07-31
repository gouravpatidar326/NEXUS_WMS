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
    const { companyId } = req.user;
    const { lotId, productId, mfgDate, expiryDate } = req.body;

    if (!lotId || !productId) {
      return res.status(400).json({ message: 'lotId and productId are required' });
    }

    const newBatch = await prisma.batch.create({
      data: {
        lotId,
        productId,
        companyId,
        mfgDate: mfgDate ? new Date(mfgDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        quarantine: false,
        coaLocked: true,
      },
      include: {
        product: true
      }
    });

    res.status(201).json(newBatch);
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { companyId } = req.user;
    const { id } = req.params;
    const { quarantine } = req.body;

    const batch = await prisma.batch.findFirst({
      where: { id, ...(companyId ? { companyId } : {}) }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const updatedBatch = await prisma.batch.update({
      where: { id },
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
    const { paymentToken } = req.body; // Mock payment token validation

    if (!paymentToken) {
      return res.status(400).json({ message: 'Payment token required to unlock COA' });
    }

    const batch = await prisma.batch.findFirst({
      where: { id, ...(req.user.companyId ? { companyId: req.user.companyId } : {}) }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const updatedBatch = await prisma.batch.update({
      where: { id },
      data: { coaLocked: false }
    });

    await prisma.auditLog.create({
      data: {
        event: 'COA_UNLOCKED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json({ id: updatedBatch.id, coaLocked: false, message: 'Unlocked successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user;

    const batch = await prisma.batch.findFirst({
      where: { id, ...(companyId ? { companyId } : {}) }
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Clear FK-linked records before deletion
    await prisma.barcode.deleteMany({ where: { batchId: id } });
    await prisma.locationInventory.deleteMany({ where: { batchId: id } });
    await prisma.inventoryLedger.deleteMany({ where: { batchId: id } });

    await prisma.batch.delete({ where: { id } });

    // Audit log (userId must exist — logged-in admin)
    await prisma.auditLog.create({
      data: {
        event: 'BATCH_DELETED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json({ message: `Batch ${batch.lotId} deleted successfully`, id });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

module.exports = { getBatches, createBatch, updateBatch, unlockCoa, deleteBatch };
