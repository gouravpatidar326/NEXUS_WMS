const prisma = require('../../utils/prisma');
const { getPaginationParams, formatPaginationMeta } = require('../../utils/pagination');

const deriveModule = (event) => {
  if (!event) return 'System History';
  const ev = event.toUpperCase();
  if (ev.includes('LOGIN') || ev.includes('AUTH') || ev.includes('PASSWORD')) return 'Authentication';
  if (ev.includes('PRODUCT') || ev.includes('CATEGORY')) return 'Products Catalog';
  if (ev.includes('RECEIVING') || ev.includes('PUTAWAY') || ev.includes('PICK')) return 'Warehouse Ops';
  if (ev.includes('ADJUSTMENT') || ev.includes('STOCK') || ev.includes('INVENTORY') || ev.includes('TRANSFER')) return 'Inventory Stock';
  if (ev.includes('USER') || ev.includes('ROLE') || ev.includes('COMPANY')) return 'User & Company Admin';
  return 'System History';
};

const describeEvent = (event, user) => {
  const actor = user?.name ? `${user.name} (${user.email})` : 'System Process';
  return `Executed action "${event}" by ${actor}. Ledger recorded into immutable MySQL audit log.`;
};

const getAuditLogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const search = req.query.search || '';
    const moduleFilter = req.query.module || '';
    const actionFilter = req.query.action || '';

    const where = {
      ...(actionFilter ? { event: actionFilter } : {}),
      ...(search
        ? {
            OR: [
              { event: { contains: search } },
              { ipAddress: { contains: search } },
              { user: { name: { contains: search } } },
              { user: { email: { contains: search } } },
            ],
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            include: {
              company: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const items = logs.map((log) => {
      const moduleName = deriveModule(log.event);
      return {
        id: log.id,
        timestamp: log.timestamp,
        userName: log.user?.name || 'System Engine',
        userEmail: log.user?.email || 'system@nexus.wms',
        company: log.user?.company?.name || 'Orbitrex Logistics',
        warehouse: 'Main Facility Hub',
        module: moduleName,
        action: log.event,
        recordId: `REC-${log.id.substring(0, 8).toUpperCase()}`,
        role: log.user?.role || 'SYSTEM',
        status: 'SUCCESS',
        clientIp: log.ipAddress || '127.0.0.1',
        description: describeEvent(log.event, log.user),
      };
    });

    const filteredItems = moduleFilter
      ? items.filter((i) => i.module.toLowerCase() === moduleFilter.toLowerCase())
      : items;

    const meta = formatPaginationMeta(total, page, limit);
    return res.json({ success: true, data: filteredItems, pagination: meta });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAuditLogs };
