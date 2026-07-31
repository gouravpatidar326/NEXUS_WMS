// Role definitions for the WMS application
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  INVENTORY_CLERK: 'INVENTORY_CLERK',
  CLIENT: 'CLIENT',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.WAREHOUSE_MANAGER]: 'Warehouse Manager',
  [ROLES.INVENTORY_CLERK]: 'Inventory Clerk',
  [ROLES.CLIENT]: 'Client',
};

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: 'danger',
  [ROLES.WAREHOUSE_MANAGER]: 'primary',
  [ROLES.INVENTORY_CLERK]: 'success',
  [ROLES.CLIENT]: 'info',
};

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.WAREHOUSE_MANAGER]: 3,
  [ROLES.INVENTORY_CLERK]: 2,
  [ROLES.CLIENT]: 1,
};
