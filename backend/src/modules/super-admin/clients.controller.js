const prisma = require('../../utils/prisma');

const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
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
    const { name, creditLimit, tier } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const client = await prisma.client.create({
      data: {
        name,
        creditLimit: creditLimit ? parseFloat(creditLimit) : 0.0,
        tier: tier || 'STANDARD',
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'CLIENT_PROVISIONED',
        userId: req.user?.id || null,
        ipAddress: req.ip,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, creditLimit, tier } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(creditLimit !== undefined ? { creditLimit: parseFloat(creditLimit) } : {}),
        ...(tier ? { tier } : {}),
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'CLIENT_UPDATED',
        userId: req.user?.id || null,
        ipAddress: req.ip,
      },
    });

    res.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(400).json({ message: error.message || 'Failed to update client' });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        event: 'CLIENT_DELETED',
        userId: req.user?.id || null,
        ipAddress: req.ip,
      },
    });

    res.json({ message: 'Client deleted successfully', id });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(400).json({ message: error.message || 'Failed to delete client' });
  }
};

module.exports = { getClients, provisionClient, updateClient, deleteClient };
