const prisma = require('../../utils/prisma');

const getBatches = async (req, res) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { companyId: req.user.companyId },
      include: { product: true }
    });
    res.json(batches);
  } catch (error) {
    console.error(error);
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
      where: { id, companyId: req.user.companyId }
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

module.exports = { getBatches, unlockCoa };
