import { lazy } from 'react';
import { PERMISSIONS } from '@/permissions/permissions';
import { ROLES } from '@/permissions/roles';

// Lazy load module pages for optimal code splitting & performance
export const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
export const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage'));
export const AccessDeniedPage = lazy(() => import('@/modules/auth/pages/AccessDeniedPage'));
export const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
export const ProductsListPage = lazy(() => import('@/modules/products/pages/ProductsListPage'));
export const InventoryListPage = lazy(() => import('@/modules/inventory/pages/InventoryListPage'));
export const BatchTrackingPage = lazy(() => import('@/modules/batch-tracking/pages/BatchTrackingPage'));
export const ExpiryTrackingPage = lazy(() => import('@/modules/expiry-tracking/pages/ExpiryTrackingPage'));
export const PurchaseOrdersPage = lazy(() => import('@/modules/purchase-orders/pages/PurchaseOrdersPage'));
export const TransferOrdersPage = lazy(() => import('@/modules/transfer-orders/pages/TransferOrdersPage'));
export const SalesOrdersPage = lazy(() => import('@/modules/sales-orders/pages/SalesOrdersPage'));
export const WarehouseOpsPage = lazy(() => import('@/modules/warehouse-ops/pages/WarehouseOpsPage'));
export const PickingPage = lazy(() => import('@/modules/warehouse-ops/pages/PickingPage'));
export const BarcodePage = lazy(() => import('@/modules/barcode/pages/BarcodePage'));
export const ShippingPage = lazy(() => import('@/modules/shipping/pages/ShippingPage'));
export const ClientPortalPage = lazy(() => import('@/modules/client-portal/pages/ClientPortalPage'));
export const ReportsPage = lazy(() => import('@/modules/reports/pages/ReportsPage'));
export const UsersPage = lazy(() => import('@/modules/users/pages/UsersPage'));
export const FacilitiesPage = lazy(() => import('@/modules/facilities/pages/FacilitiesPage'));
export const CompaniesPage = lazy(() => import('@/modules/users/pages/CompaniesPage'));
export const ClientsPage = lazy(() => import('@/modules/users/pages/ClientsPage'));
export const RolesPage = lazy(() => import('@/modules/roles/pages/RolesPage'));
export const AuditLogsPage = lazy(() => import('@/modules/audit-logs/pages/AuditLogsPage'));
export const SettingsPage = lazy(() => import('@/modules/settings/pages/SettingsPage'));

export const PROTECTED_ROUTES = [
  { path: 'dashboard', Component: DashboardPage, permission: PERMISSIONS.DASHBOARD_VIEW },
  { path: 'products', Component: ProductsListPage, permission: PERMISSIONS.PRODUCTS_VIEW },
  { path: 'inventory', Component: InventoryListPage, permission: PERMISSIONS.INVENTORY_VIEW },
  { path: 'batch-tracking', Component: BatchTrackingPage, permission: PERMISSIONS.BATCH_VIEW },
  { path: 'expiry-tracking', Component: ExpiryTrackingPage, permission: PERMISSIONS.EXPIRY_VIEW },
  { path: 'purchase-orders', Component: PurchaseOrdersPage, permission: PERMISSIONS.PO_VIEW },
  { path: 'transfer-orders', Component: TransferOrdersPage, permission: PERMISSIONS.TO_VIEW },
  { path: 'sales-orders', Component: SalesOrdersPage, permission: PERMISSIONS.SO_VIEW },
  { path: 'warehouse-ops', Component: WarehouseOpsPage, permission: PERMISSIONS.WAREHOUSE_VIEW },
  { path: 'picking', Component: PickingPage, permission: PERMISSIONS.WAREHOUSE_VIEW },
  { path: 'barcode', Component: BarcodePage, permission: PERMISSIONS.BARCODE_VIEW },
  { path: 'shipping', Component: ShippingPage, permission: PERMISSIONS.SHIPPING_VIEW },
  { path: 'client-portal', Component: ClientPortalPage, permission: PERMISSIONS.CLIENT_PORTAL_VIEW },
  { path: 'reports', Component: ReportsPage, permission: PERMISSIONS.REPORTS_VIEW },
  { path: 'companies', Component: CompaniesPage, permission: PERMISSIONS.USERS_VIEW },
  { path: 'facilities', Component: FacilitiesPage, permission: PERMISSIONS.WAREHOUSE_VIEW },
  { path: 'users', Component: UsersPage, permission: PERMISSIONS.USERS_VIEW },
  { path: 'clients', Component: ClientsPage, permission: PERMISSIONS.USERS_VIEW },
  { path: 'roles', Component: RolesPage, permission: PERMISSIONS.ROLES_VIEW },
  { path: 'audit-logs', Component: AuditLogsPage, permission: PERMISSIONS.AUDIT_VIEW },
  { path: 'settings', Component: SettingsPage, permission: PERMISSIONS.SETTINGS_VIEW },
];
