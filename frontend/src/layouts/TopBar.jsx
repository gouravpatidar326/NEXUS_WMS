import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import { notificationService } from '@/services/notificationService';

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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, permissions, logout } = useAuth();
  const navigate = useNavigate();
  const { notifySuccess } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      if (!user) return;
      const data = await notificationService.fetchNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll notifications every 15 seconds to sync actions in real time
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await notificationService.markAsRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      }
      setShowNotifications(false);

      const titleLower = notif.title.toLowerCase();
      const msgLower = notif.message.toLowerCase();

      if (titleLower.includes('sales order') || msgLower.includes('so-')) {
        navigate('/sales-orders');
      } else if (titleLower.includes('purchase order') || msgLower.includes('po-')) {
        navigate('/purchase-orders');
      } else if (titleLower.includes('expiry') || msgLower.includes('expire')) {
        navigate('/expiry-tracking');
      } else if (titleLower.includes('batch') || msgLower.includes('lot')) {
        navigate('/batch-tracking');
      }
    } catch (err) {
      console.error('Failed to handle notification click:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      notifySuccess('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleGlobalSearch = (event) => {
    if (event.key !== 'Enter' || !searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();
    const match = SEARCH_DESTINATIONS.find(
      (item) => item.matches.some((term) => query.includes(term)) && permissions.includes(item.permission)
    );
    const destination = match?.path || '/dashboard';
    navigate(destination);
    setShowMobileSearch(false);
    notifySuccess(`Showing results for “${searchQuery}”.`);
  };

  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-outline-variant bg-white px-2 sm:h-16 sm:px-4 lg:px-6">
      {showMobileSearch ? (
        <div className="flex w-full items-center gap-2 px-1">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              autoFocus
              placeholder="Search SKUs, POs, Orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleGlobalSearch}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-1.5 pl-9 pr-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl">
            <button
              onClick={onOpenSidebar}
              className="p-2 text-on-surface-variant hover:text-on-surface lg:hidden rounded-lg hover:bg-surface-container"
              aria-label="Open Navigation Menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="p-2 text-on-surface-variant hover:text-on-surface sm:hidden rounded-lg hover:bg-surface-container"
              aria-label="Open Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            {/* Tablet & Laptop Desktop Search Bar */}
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

            {/* Notifications Icon */}
            <div className="relative">
              <button
                aria-label="Notifications"
                onClick={() => setShowNotifications((value) => !value)}
                className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-surface-200 bg-white p-3 shadow-xl max-h-96 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <p className="text-xs font-bold text-surface-900">Notifications</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 mt-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-surface-500 text-center py-4">No notifications available</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                            notif.read
                              ? 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                              : 'bg-primary-50/40 border-primary-100 text-slate-850 hover:bg-primary-50/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <p className={`text-[11px] font-bold ${notif.read ? 'text-slate-700' : 'text-primary'}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-[10px] leading-relaxed mt-0.5 text-slate-600">{notif.message}</p>
                          <p className="text-[8px] text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>





            {/* User Avatar & Name */}
            <div className="relative pl-2 sm:pl-3 border-l border-outline-variant">
              <button
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="flex items-center gap-2 sm:gap-3.5 text-left focus:outline-none hover:bg-slate-50 p-1 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                  alt={user?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-outline-variant"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-on-surface leading-tight">{user?.name || 'Super Admin'}</div>
                  <div className="text-[10px] text-on-surface-variant capitalize">{user?.role?.replace('_', ' ') || 'Role'}</div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-slate-500 hidden sm:inline select-none">
                  keyboard_arrow_down
                </span>
              </button>

              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    
                    {permissions.includes(PERMISSIONS.SETTINGS_VIEW) && (
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowProfileDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Account Settings
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default TopBar;
