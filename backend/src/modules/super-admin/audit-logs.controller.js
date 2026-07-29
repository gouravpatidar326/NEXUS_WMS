const prisma = require('../../utils/prisma');

const getAuditLogs = async (req, res) => {
  try {
    const { search, event } = req.query;

    const where = {
      ...(event ? { event } : {}),
      ...(search
        ? {
            OR: [
              { event: { contains: search } },
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } },
              { ipAddress: { contains: search } },
            ],
          }
        : {}),
    };

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAuditLogs };
