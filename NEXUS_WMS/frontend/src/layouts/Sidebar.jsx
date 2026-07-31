import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getSidebarForRole } from './sidebar/sidebarConfig';
import { PERMISSIONS } from '@/permissions/permissions';

const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.DASHBOARD_VIEW,
  '/companies': PERMISSIONS.USERS_VIEW,
  '/warehouse-ops': PERMISSIONS.WAREHOUSE_VIEW,
  '/facilities': PERMISSIONS.FACILITIES_VIEW,
  '/users': PERMISSIONS.USERS_VIEW,
  '/roles': PERMISSIONS.ROLES_VIEW,
  '/inventory': PERMISSIONS.INVENTORY_VIEW,
  '/products': PERMISSIONS.PRODUCTS_VIEW,
  '/batch-tracking': PERMISSIONS.BATCH_VIEW,
  '/expiry-tracking': PERMISSIONS.EXPIRY_VIEW,
  '/purchase-orders': PERMISSIONS.PO_VIEW,
  '/transfer-orders': PERMISSIONS.TO_VIEW,
  '/sales-orders': PERMISSIONS.SO_VIEW,
  '/picking': PERMISSIONS.SO_PICK,
  '/barcode': PERMISSIONS.BARCODE_VIEW,
  '/shipping': PERMISSIONS.SHIPPING_VIEW,
  '/reports': PERMISSIONS.REPORTS_VIEW,
  '/clients': PERMISSIONS.CLIENTS_VIEW,
  '/audit-logs': PERMISSIONS.AUDIT_VIEW,
  '/settings': PERMISSIONS.SETTINGS_VIEW,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, permissions, logout } = useAuth();

  const roleItems = getSidebarForRole(user?.role).filter((item) => {
    const requiredPermission = ROUTE_PERMISSIONS[item.path];
    return !requiredPermission || permissions.includes(requiredPermission);
  });

  const getSubTitle = () => {
    if (user?.role === 'super_admin') return 'Super Admin Portal';
    if (user?.role === 'warehouse_manager') return 'Warehouse Alpha';
    if (user?.role === 'inventory_clerk') return 'Inventory Clerk';
    if (user?.role === 'client') return 'Client Portal';
    return 'Logistics Portal';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[240px] shrink-0 flex-col overflow-hidden border-r border-[#d8e2d3] bg-[#f7f6ef] text-[#2f4937] shadow-[4px_0_18px_rgba(47,73,55,0.04)] transform transition-transform duration-300 lg:relative ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Logo */}
        <div className="flex items-start justify-between border-b border-[#d8e2d3] px-4 py-4">
          <div className="min-w-0 flex-1">
            <img src="/images/brand/orbitrex-peptides-logo-transparent.png" alt="Orbitrex Peptides" className="h-20 w-full object-contain" />
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#9a7a2e]">
              {getSubTitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-1 text-[#647568] hover:bg-[#e5efdf] hover:text-[#2f4937] lg:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {roleItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                `mx-2 my-1 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  isActive
                    ? 'bg-[#4f8f32] text-white shadow-[0_5px_14px_rgba(79,143,50,0.18)] font-semibold'
                    : 'text-[#2f4937] hover:bg-[#e5efdf] hover:text-[#315a23]'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.iconName || 'dashboard'}
              </span>
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer in Sidebar */}
        <div className="flex items-center justify-between border-t border-[#d8e2d3] bg-[#edf2e9] p-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#4f8f32] text-white font-bold flex items-center justify-center text-xs shrink-0 uppercase">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="truncate">
              <div className="truncate text-xs font-semibold text-[#26362c]">{user?.name || 'User'}</div>
              <div className="truncate text-[10px] capitalize text-[#647568]">{user?.role?.replace('_', ' ') || 'Guest'}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="cursor-pointer rounded p-1 text-[#526b59] transition-colors hover:bg-white hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
