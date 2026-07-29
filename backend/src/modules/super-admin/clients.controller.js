const prisma = require('../../utils/prisma');
const { logAudit } = require('../../utils/auditLogger');

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
    const { name, creditLimit, tier } = req.body;

    const existingClient = await prisma.client.findUnique({ where: { id } });
    if (!existingClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(creditLimit !== undefined ? { creditLimit: parseFloat(creditLimit) } : {}),
        ...(tier ? { tier } : {}),
        updatedAt: new Date(),
      },
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
