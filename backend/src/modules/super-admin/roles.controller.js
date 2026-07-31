const prisma = require('../../utils/prisma');

const defaultPermissions = {
  SUPER_ADMIN: [
    'dashboard.view', 'dashboard.analytics',
    'products.view', 'products.create', 'products.edit', 'products.delete', 'products.import', 'products.export',
    'inventory.view', 'inventory.adjust', 'inventory.movements', 'inventory.export',
    'batch.view', 'batch.create', 'batch.edit', 'batch.delete',
    'expiry.view', 'expiry.manage',
    'po.view', 'po.create', 'po.edit', 'po.approve', 'po.receive', 'po.delete',
    'to.view', 'to.create', 'to.edit', 'to.execute', 'to.delete',
    'so.view', 'so.create', 'so.edit', 'so.pick', 'so.ship', 'so.delete', 'so.approve',
    'warehouse.view', 'warehouse.manage', 'warehouse.zones', 'warehouse.locations', 'facilities.view',
    'barcode.view', 'barcode.generate', 'barcode.print',
    'shipping.view', 'shipping.create', 'shipping.track', 'shipping.manage', 'shipping.execute',
    'client_portal.view', 'client_portal.orders', 'client_portal.tracking', 'client_portal.reports',
    'clients.view',
    'reports.view', 'reports.export', 'reports.financial',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
    'roles.view', 'roles.manage',
    'audit.view', 'audit.export',
    'settings.view', 'settings.manage', 'settings.system',
    'receiving.execute', 'picking.execute'
  ],
  WAREHOUSE_MANAGER: [
    'dashboard.view', 'dashboard.analytics',
    'products.view', 'products.create', 'products.edit', 'products.import', 'products.export',
    'inventory.view', 'inventory.adjust', 'inventory.movements', 'inventory.export',
    'batch.view', 'batch.create', 'batch.edit',
    'expiry.view', 'expiry.manage',
    'po.view', 'po.create', 'po.edit', 'po.approve',
    'to.view', 'to.create', 'to.edit', 'to.execute',
    'so.view', 'so.create', 'so.edit', 'so.approve',
    'warehouse.view', 'warehouse.manage', 'warehouse.zones', 'warehouse.locations', 'facilities.view',
    'barcode.view', 'barcode.generate', 'barcode.print',
    'shipping.view', 'shipping.track',
    'reports.view', 'reports.export',
    'users.view', 'clients.view', 'audit.view', 'settings.view'
  ],
  INVENTORY_CLERK: [
    'dashboard.view',
    'products.view', 'products.create', 'products.edit',
    'inventory.view', 'inventory.adjust', 'inventory.movements',
    'batch.view', 'batch.create',
    'expiry.view',
    'po.view', 'po.receive', 'receiving.execute',
    'to.view', 'to.execute',
    'so.view', 'so.pick', 'picking.execute',
    'barcode.view', 'barcode.generate', 'barcode.print',
    'shipping.view', 'shipping.track', 'shipping.execute'
  ],
  CLIENT: [
    'dashboard.view',
    'products.view',
    'batch.view',
    'expiry.view',
    'client_portal.view', 'client_portal.orders', 'client_portal.tracking', 'client_portal.reports',
    'so.view',
    'shipping.track',
    'reports.view',
    'settings.view'
  ]
};

let activePermissionStore = { ...defaultPermissions };

const getRoles = async (req, res) => {
  try {
    const rolesList = [
      { key: 'SUPER_ADMIN', label: 'Super Admin', color: 'danger', permissions: activePermissionStore.SUPER_ADMIN || [] },
      { key: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', color: 'primary', permissions: activePermissionStore.WAREHOUSE_MANAGER || [] },
      { key: 'INVENTORY_CLERK', label: 'Inventory Clerk', color: 'warning', permissions: activePermissionStore.INVENTORY_CLERK || [] },
      { key: 'CLIENT', label: 'Client User', color: 'info', permissions: activePermissionStore.CLIENT || [] },
    ];
    res.json(rolesList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    const { roleKey } = req.params;
    const { permissions } = req.body;

    if (!activePermissionStore[roleKey]) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Permissions array is required' });
    }

    activePermissionStore[roleKey] = permissions;

    await prisma.auditLog.create({
      data: {
        event: 'ROLE_PERMISSIONS_UPDATED',
        userId: req.user.id,
        ipAddress: req.ip,
      },
    });

    res.json({
      roleKey,
      permissions: activePermissionStore[roleKey],
      message: `Permissions for ${roleKey} updated successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getRoles, updateRolePermissions };
