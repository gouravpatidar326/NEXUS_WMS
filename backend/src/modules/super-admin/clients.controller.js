const prisma = require('../../utils/prisma');
const bcrypt = require('bcrypt');
const { logAudit } = require('../../utils/auditLogger');

const getClients = async (req, res) => {
  try {
    const where = {};
    if (req.user && req.user.role !== 'SUPER_ADMIN' && req.user.companyId) {
      where.companyId = req.user.companyId;
    }
    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const provisionClient = async (req, res) => {
  try {
    const { name, creditLimit, tier, email, phone, address, shippingAddress, gstNumber, warehouseId, password, status, companyId } = req.body;

    if (!name || !email || !phone || !address || !status || !password) {
      return res.status(400).json({ message: 'Name, Email, Phone, Address, Password, and Status are required' });
    }

    let finalCompanyId = companyId || null;
    if (req.user && req.user.role === 'WAREHOUSE_MANAGER') {
      finalCompanyId = req.user.companyId;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        shippingAddress,
        gstNumber,
        warehouseId,
        password: hashedPassword,
        status,
        companyId: finalCompanyId,
        creditLimit: creditLimit ? parseFloat(creditLimit) : 0.0,
        tier: tier || 'STANDARD',
      },
    });

    await logAudit(req, 'CLIENT_PROVISIONED');

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, creditLimit, tier, email, phone, address, status, companyId } = req.body;

    const existingClient = await prisma.client.findUnique({ where: { id } });
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (req.user && req.user.role === 'WAREHOUSE_MANAGER') {
      if (existingClient.companyId !== req.user.companyId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const updateData = {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(address ? { address } : {}),
      ...(status ? { status } : {}),
      ...(creditLimit !== undefined ? { creditLimit: parseFloat(creditLimit) } : {}),
      ...(tier ? { tier } : {}),
      updatedAt: new Date(),
    };

    if (req.user && req.user.role === 'SUPER_ADMIN' && companyId !== undefined) {
      updateData.companyId = companyId || null;
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    await logAudit(req, 'CLIENT_UPDATED');

    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ message: error.message || 'Failed to update client' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClient = await prisma.client.findUnique({ where: { id } });
    if (!existingClient) {
      return res.status(200).json({ message: 'Client already deleted or not found', id });
    }

    if (req.user && req.user.role === 'WAREHOUSE_MANAGER' && existingClient.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.client.delete({
      where: { id },
    });

    await logAudit(req, 'CLIENT_DELETED');

    res.json({ message: 'Client deleted successfully', id });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(400).json({ message: error.message || 'Failed to delete client' });
  }
};

module.exports = { getClients, provisionClient, updateClient, deleteClient };
