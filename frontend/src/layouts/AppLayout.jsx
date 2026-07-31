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

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Full-width content area with balanced mobile padding */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-surface-50 p-2 sm:p-4 lg:p-6 pb-24 sm:pb-8">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
