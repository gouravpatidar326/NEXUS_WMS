import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';

const SEARCH_DESTINATIONS = [
  { matches: ['user'], path: '/users', permission: PERMISSIONS.USERS_VIEW },
  { matches: ['purchase', 'vendor', 'po-'], path: '/purchase-orders', permission: PERMISSIONS.PO_VIEW },
  { matches: ['order'], path: '/sales-orders', permission: PERMISSIONS.SO_VIEW },
  { matches: ['lot', 'batch'], path: '/batch-tracking', permission: PERMISSIONS.BATCH_VIEW },
  { matches: ['ship'], path: '/shipping', permission: PERMISSIONS.SHIPPING_VIEW },
  { matches: ['product', 'sku'], path: '/products', permission: PERMISSIONS.PRODUCTS_VIEW },
];

export const TopBar = ({ onOpenSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, permissions } = useAuth();
  const navigate = useNavigate();
  const { notifySuccess } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleGlobalSearch = (event) => {
    if (event.key !== 'Enter' || !searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    const match = SEARCH_DESTINATIONS.find((item) => item.matches.some((term) => query.includes(term)) && permissions.includes(item.permission));
    const destination = match?.path || '/dashboard';
    navigate(destination);
    notifySuccess(`Showing the most relevant results for “${searchQuery}”.`);
  };

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-outline-variant bg-white px-2 sm:h-16 sm:px-4 lg:px-6">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-on-surface-variant hover:text-on-surface lg:hidden rounded-lg hover:bg-surface-container"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search across all companies, SKUs, or shipments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleGlobalSearch}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-1 sm:gap-3 lg:gap-4">
        {/* System Health Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-[11px]">System Health: Fully Operational</span>
        </div>

        {/* Icon Controls */}
        <div className="relative">
        <button aria-label="Notifications" onClick={() => setShowNotifications((value) => !value)} className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        {showNotifications && <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-surface-200 bg-white p-3 shadow-xl"><p className="text-xs font-bold text-surface-900">Notifications</p><div className="mt-2 space-y-2 text-xs text-surface-600">{permissions.includes(PERMISSIONS.EXPIRY_VIEW) && <button onClick={() => { navigate('/expiry-tracking'); setShowNotifications(false); }} className="w-full rounded-lg bg-warning-50 p-2 text-left hover:bg-warning-100">12 lots require expiry review</button>}{permissions.includes(PERMISSIONS.PO_VIEW) && <button onClick={() => { navigate('/purchase-orders'); setShowNotifications(false); }} className="w-full rounded-lg bg-primary-50 p-2 text-left hover:bg-primary-100">Purchase orders awaiting receiving action</button>}{!permissions.includes(PERMISSIONS.EXPIRY_VIEW) && !permissions.includes(PERMISSIONS.PO_VIEW) && <p className="rounded-lg bg-surface-50 p-3 text-surface-500">No notifications available for your role.</p>}</div></div>}
        </div>

        <button aria-label="Help" onClick={() => notifySuccess('Help center: use global search or contact your Nexus WMS administrator.')} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>

        {permissions.includes(PERMISSIONS.SETTINGS_VIEW) && (
          <button aria-label="Settings" onClick={() => navigate('/settings')} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-3.5 pl-3 border-l border-outline-variant">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-on-surface leading-tight">{user?.name || 'Super Admin'}</div>
            <div className="text-[10px] text-on-surface-variant capitalize">{user?.role?.replace('_', ' ') || 'Role'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
