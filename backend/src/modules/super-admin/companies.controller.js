const prisma = require('../../utils/prisma');

const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await prisma.company.create({
      data: { name, industry }
    });

    await prisma.auditLog.create({
      data: {
        event: 'COMPANY_PROVISIONED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(industry !== undefined ? { industry } : {}),
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'COMPANY_UPDATED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.json(company);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Failed to update company' });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      // 1. Delete linked operational records to prevent Foreign Key constraints
      await tx.locationInventory.deleteMany({ where: { companyId: id } });
      await tx.inventoryLedger.deleteMany({ where: { companyId: id } });
      await tx.inventory.deleteMany({ where: { companyId: id } });
      await tx.stockAdjustment.deleteMany({ where: { companyId: id } });
      await tx.expiryAlert.deleteMany({ where: { companyId: id } });
      await tx.barcode.deleteMany({ where: { companyId: id } });
      await tx.transferItem.deleteMany({ where: { transfer: { companyId: id } } });
      await tx.inventoryTransfer.deleteMany({ where: { companyId: id } });
      await tx.batch.deleteMany({ where: { companyId: id } });
      await tx.receivingItem.deleteMany({ where: { companyId: id } });
      await tx.receiving.deleteMany({ where: { companyId: id } });
      await tx.product.deleteMany({ where: { companyId: id } });
      await tx.category.deleteMany({ where: { companyId: id } });
      await tx.location.deleteMany({ where: { companyId: id } });
      await tx.salesOrderItem.deleteMany({ where: { salesOrder: { companyId: id } } });
      await tx.salesOrder.deleteMany({ where: { companyId: id } });
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { companyId: id } } });
      await tx.purchaseOrder.deleteMany({ where: { companyId: id } });
      await tx.user.deleteMany({ where: { companyId: id } });

      // 2. Delete target company record
      await tx.company.delete({
        where: { id },
      });

      // 3. Log audit event
      await tx.auditLog.create({
        data: {
          event: 'COMPANY_DELETED',
          userId: req.user.id,
          ipAddress: req.ip
        }
      });
    });

    res.json({ message: 'Company deleted successfully', id });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(400).json({ message: error.message || 'Failed to delete company due to linked records.' });
  }
};

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany };
