const prisma = require('./prisma');

/**
 * Safely logs an event to AuditLog table without causing FK constraint errors
 * if the user ID is invalid or no longer exists in DB.
 */
const logAudit = async (req, event, details = {}) => {
  try {
    let userId = req?.user?.id || null;

    if (userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!userExists) {
        userId = null;
      }
    }

    return await prisma.auditLog.create({
      data: {
        event,
        userId,
        ipAddress: req?.ip || null,
        ...(details || {}),
      },
    });
  } catch (error) {
    console.error('AuditLog creation failed silently:', error.message);
    return null;
  }
};

module.exports = { logAudit };
