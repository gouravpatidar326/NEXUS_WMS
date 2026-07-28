import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Sidebar — 240px static at lg+, fixed/overlay below lg */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area — takes all remaining width */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Full-width content — no max-w constraint, no mx-auto */}
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface-50">
          <div className="page-shell">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
