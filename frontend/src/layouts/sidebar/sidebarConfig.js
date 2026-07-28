import { ROLES } from '@/permissions/roles';

export const SUPER_ADMIN_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'companies', title: 'Companies', path: '/companies', iconName: 'corporate_fare' },
  { id: 'warehouses', title: 'Warehouses', path: '/warehouse-ops', iconName: 'warehouse' },
  { id: 'users', title: 'Users', path: '/users', iconName: 'group' },
  { id: 'rbac', title: 'RBAC', path: '/roles', iconName: 'security' },
  { id: 'inventory', title: 'Inventory', path: '/inventory', iconName: 'inventory_2' },
  { id: 'orders', title: 'Orders', path: '/sales-orders', iconName: 'conveyor_belt' },
  { id: 'clients', title: 'Clients', path: '/clients', iconName: 'person_pin' },
  { id: 'vendors', title: 'Vendors', path: '/purchase-orders', iconName: 'local_shipping' },
  { id: 'reports', title: 'Reports', path: '/reports', iconName: 'analytics' },
  { id: 'audit-logs', title: 'Audit Logs', path: '/audit-logs', iconName: 'history_edu' },
  { id: 'settings', title: 'Settings', path: '/settings', iconName: 'settings' },
];

export const WAREHOUSE_MANAGER_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'inventory', title: 'Inventory', path: '/inventory', iconName: 'inventory_2' },
  { id: 'lots', title: 'Lots & Batches', path: '/batch-tracking', iconName: 'qr_code_2' },
  { id: 'expiry', title: 'Expiry Tracking', path: '/expiry-tracking', iconName: 'calendar_clock' },
  { id: 'locations', title: 'Locations', path: '/warehouse-ops', iconName: 'location_on' },
  { id: 'sales-orders', title: 'Sales Orders', path: '/sales-orders', iconName: 'shopping_cart' },
  { id: 'picking', title: 'Picking', path: '/warehouse-ops', iconName: 'conveyor_belt' },
  { id: 'shipping', title: 'Shipping', path: '/shipping', iconName: 'local_shipping' },
  { id: 'transfers', title: 'Transfers', path: '/transfer-orders', iconName: 'sync_alt' },
  { id: 'receiving', title: 'Receiving', path: '/purchase-orders', iconName: 'move_to_inbox' },
  { id: 'reports', title: 'Reports', path: '/reports', iconName: 'bar_chart' },
];

export const INVENTORY_CLERK_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'products', title: 'Products', path: '/products', iconName: 'inventory_2' },
  { id: 'inventory', title: 'Inventory', path: '/inventory', iconName: 'inventory_2' },
  { id: 'lots', title: 'Lots & Batches', path: '/batch-tracking', iconName: 'qr_code_2' },
  { id: 'barcode', title: 'Barcode', path: '/barcode', iconName: 'qr_code_scanner' },
  { id: 'expiry', title: 'Expiry', path: '/expiry-tracking', iconName: 'calendar_clock' },
  { id: 'locations', title: 'Locations', path: '/warehouse-ops', iconName: 'location_on' },
];

export const CLIENT_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'products', title: 'Products', path: '/products', iconName: 'inventory_2' },
  { id: 'my-orders', title: 'My Orders', path: '/sales-orders', iconName: 'shopping_cart' },
  { id: 'invoices', title: 'Invoices', path: '/reports', iconName: 'receipt_long' },
  { id: 'coas', title: 'COAs', path: '/expiry-tracking', iconName: 'verified' },
  { id: 'tracking', title: 'Tracking', path: '/shipping', iconName: 'local_shipping' },
  { id: 'support', title: 'Support', path: '/settings', iconName: 'support_agent' },
];

export const getSidebarForRole = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return SUPER_ADMIN_ITEMS;
    case ROLES.WAREHOUSE_MANAGER:
      return WAREHOUSE_MANAGER_ITEMS;
    case ROLES.INVENTORY_CLERK:
      return INVENTORY_CLERK_ITEMS;
    case ROLES.CLIENT:
      return CLIENT_ITEMS;
    default:
      return SUPER_ADMIN_ITEMS;
  }
};
