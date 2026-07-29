import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-surface-50">
      {/* Sidebar — 240px static at lg+, fixed/overlay below lg */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area — takes all remaining width */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Full-width content with bottom safe padding for mobile devices */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface-50 p-2 sm:p-4 lg:p-6 pb-16 sm:pb-10">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
