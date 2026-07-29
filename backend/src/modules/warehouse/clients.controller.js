const prisma = require('../../utils/prisma');

const getClients = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getClients };
