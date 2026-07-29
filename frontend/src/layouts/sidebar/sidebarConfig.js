import { ROLES } from '@/permissions/roles';

export const SUPER_ADMIN_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'companies', title: 'Companies', path: '/companies', iconName: 'corporate_fare' },
  { id: 'warehouses', title: 'Warehouse Operations', path: '/warehouse-ops', iconName: 'warehouse' },
  { id: 'products', title: 'Products Catalog', path: '/products', iconName: 'inventory_2' },
  { id: 'inventory', title: 'Inventory Stock', path: '/inventory', iconName: 'inventory' },
  { id: 'lots', title: 'Lots & Batches', path: '/batch-tracking', iconName: 'qr_code_2' },
  { id: 'expiry', title: 'Expiry Tracking', path: '/expiry-tracking', iconName: 'calendar_clock' },
  { id: 'purchase-orders', title: 'Purchase Orders', path: '/purchase-orders', iconName: 'local_shipping' },
  { id: 'sales-orders', title: 'Sales Orders', path: '/sales-orders', iconName: 'shopping_cart' },
  { id: 'transfers', title: 'Transfers', path: '/transfer-orders', iconName: 'sync_alt' },
  { id: 'barcode', title: 'Barcode Scanner', path: '/barcode', iconName: 'qr_code_scanner' },
  { id: 'shipping', title: 'Shipping', path: '/shipping', iconName: 'local_shipping' },
  { id: 'users', title: 'Users Directory', path: '/users', iconName: 'group' },
  { id: 'clients', title: 'Clients Directory', path: '/clients', iconName: 'person_pin' },
  { id: 'rbac', title: 'Roles & Permissions', path: '/roles', iconName: 'security' },
  { id: 'reports', title: 'Reports', path: '/reports', iconName: 'analytics' },
  { id: 'audit-logs', title: 'Audit Logs', path: '/audit-logs', iconName: 'history_edu' },
  { id: 'settings', title: 'Settings', path: '/settings', iconName: 'settings' },
];

export const WAREHOUSE_MANAGER_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'products', title: 'Products', path: '/products', iconName: 'inventory_2' },
  { id: 'inventory', title: 'Inventory', path: '/inventory', iconName: 'inventory' },
  { id: 'lots', title: 'Lots & Batches', path: '/batch-tracking', iconName: 'qr_code_2' },
  { id: 'expiry', title: 'Expiry Tracking', path: '/expiry-tracking', iconName: 'calendar_clock' },
  { id: 'locations', title: 'Locations', path: '/warehouse-ops', iconName: 'location_on' },
  { id: 'sales-orders', title: 'Sales Orders', path: '/sales-orders', iconName: 'shopping_cart' },
  { id: 'picking', title: 'Picking', path: '/picking', iconName: 'conveyor_belt' },
  { id: 'shipping', title: 'Shipping', path: '/shipping', iconName: 'local_shipping' },
  { id: 'transfers', title: 'Transfers', path: '/transfer-orders', iconName: 'sync_alt' },
  { id: 'receiving', title: 'Receiving', path: '/purchase-orders', iconName: 'move_to_inbox' },
  { id: 'barcode', title: 'Barcode', path: '/barcode', iconName: 'qr_code_scanner' },
  { id: 'reports', title: 'Reports', path: '/reports', iconName: 'bar_chart' },
];

export const INVENTORY_CLERK_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'products', title: 'Products', path: '/products', iconName: 'inventory_2' },
  { id: 'inventory', title: 'Inventory', path: '/inventory', iconName: 'inventory' },
  { id: 'lots', title: 'Lots & Batches', path: '/batch-tracking', iconName: 'qr_code_2' },
  { id: 'barcode', title: 'Barcode', path: '/barcode', iconName: 'qr_code_scanner' },
  { id: 'expiry', title: 'Expiry', path: '/expiry-tracking', iconName: 'calendar_clock' },
  { id: 'locations', title: 'Locations', path: '/warehouse-ops', iconName: 'location_on' },
  { id: 'transfers', title: 'Transfers', path: '/transfer-orders', iconName: 'sync_alt' },
  { id: 'receiving', title: 'Receiving', path: '/purchase-orders', iconName: 'move_to_inbox' },
];

export const CLIENT_ITEMS = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
  { id: 'products', title: 'Products', path: '/products', iconName: 'inventory_2' },
  { id: 'client-portal', title: 'Client Portal', path: '/client-portal', iconName: 'storefront' },
  { id: 'my-orders', title: 'My Orders', path: '/sales-orders', iconName: 'shopping_cart' },
  { id: 'coas', title: 'COAs & Quality', path: '/batch-tracking', iconName: 'verified' },
  { id: 'tracking', title: 'Tracking', path: '/shipping', iconName: 'local_shipping' },
];

export const getSidebarForRole = (role) => {
  const normRole = (role || '').toUpperCase();
  switch (normRole) {
    case ROLES.SUPER_ADMIN:
    case 'SUPER_ADMIN':
      return SUPER_ADMIN_ITEMS;
    case ROLES.WAREHOUSE_MANAGER:
    case 'WAREHOUSE_MANAGER':
      return WAREHOUSE_MANAGER_ITEMS;
    case ROLES.INVENTORY_CLERK:
    case 'INVENTORY_CLERK':
      return INVENTORY_CLERK_ITEMS;
    case ROLES.CLIENT:
    case 'CLIENT':
      return CLIENT_ITEMS;
    default:
      return SUPER_ADMIN_ITEMS;
  }
};
