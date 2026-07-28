const prisma = require('../../utils/prisma');

const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    console.error(error);
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
        tier: tier || 'STANDARD'
      }
    });

    await prisma.auditLog.create({
      data: {
        event: 'CLIENT_PROVISIONED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getClients, provisionClient };
