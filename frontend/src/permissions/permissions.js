// Flat permission keys used across the application
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ANALYTICS: 'dashboard.analytics',

  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_IMPORT: 'products.import',
  PRODUCTS_EXPORT: 'products.export',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_MOVEMENTS: 'inventory.movements',
  INVENTORY_EXPORT: 'inventory.export',

  // Batch / Lot Tracking
  BATCH_VIEW: 'batch.view',
  BATCH_CREATE: 'batch.create',
  BATCH_EDIT: 'batch.edit',
  BATCH_DELETE: 'batch.delete',

  // Expiry Tracking
  EXPIRY_VIEW: 'expiry.view',
  EXPIRY_MANAGE: 'expiry.manage',

  // Purchase Orders
  PO_VIEW: 'po.view',
  PO_CREATE: 'po.create',
  PO_EDIT: 'po.edit',
  PO_APPROVE: 'po.approve',
  PO_RECEIVE: 'po.receive',
  PO_DELETE: 'po.delete',

  // Transfer Orders
  TO_VIEW: 'to.view',
  TO_CREATE: 'to.create',
  TO_EDIT: 'to.edit',
  TO_EXECUTE: 'to.execute',
  TO_DELETE: 'to.delete',

  // Sales Orders
  SO_VIEW: 'so.view',
  SO_CREATE: 'so.create',
  SO_EDIT: 'so.edit',
  SO_PICK: 'so.pick',
  SO_SHIP: 'so.ship',
  SO_DELETE: 'so.delete',

  // Warehouse Operations
  WAREHOUSE_VIEW: 'warehouse.view',
  WAREHOUSE_MANAGE: 'warehouse.manage',
  WAREHOUSE_ZONES: 'warehouse.zones',
  WAREHOUSE_LOCATIONS: 'warehouse.locations',

  // Barcode
  BARCODE_VIEW: 'barcode.view',
  BARCODE_GENERATE: 'barcode.generate',
  BARCODE_PRINT: 'barcode.print',

  // Shipping
  SHIPPING_VIEW: 'shipping.view',
  SHIPPING_CREATE: 'shipping.create',
  SHIPPING_TRACK: 'shipping.track',
  SHIPPING_MANAGE: 'shipping.manage',

  // Client Portal
  CLIENT_PORTAL_VIEW: 'client_portal.view',
  CLIENT_ORDERS_VIEW: 'client_portal.orders',
  CLIENT_TRACKING_VIEW: 'client_portal.tracking',
  CLIENT_REPORTS_VIEW: 'client_portal.reports',

  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_FINANCIAL: 'reports.financial',

  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage_roles',

  // Roles & Permissions
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',

  // Audit Logs
  AUDIT_VIEW: 'audit.view',
  AUDIT_EXPORT: 'audit.export',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',
  SETTINGS_SYSTEM: 'settings.system',
};
