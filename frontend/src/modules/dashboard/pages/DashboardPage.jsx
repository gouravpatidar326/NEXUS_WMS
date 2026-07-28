import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/permissions/roles';

export const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === ROLES.CLIENT) {
    return <ClientPortalDashboard user={user} />;
  }

  if (user?.role === ROLES.WAREHOUSE_MANAGER) {
    return <WarehouseManagerDashboard user={user} />;
  }

  if (user?.role === ROLES.INVENTORY_CLERK) {
    return <InventoryClerkDashboard user={user} />;
  }

  return <SuperAdminDashboard user={user} />;
};

// Super Admin Dashboard (Stitch 1:1)
const SuperAdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotification();

  const handleExportReport = () => {
    notifySuccess('Generating platform report... Download started (CSV).');
  };

  return (
    <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">System Overview</h2>
          <p className="text-sm text-on-surface-variant">
            Welcome back, {user?.name || 'Alex Morgan'}. Global platform metrics and warehouse synchronization status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg flex items-center gap-2 border border-outline-variant hover:bg-surface-container-highest transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            Last 30 Days
          </button>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg flex items-center gap-2 hover:bg-primary-container transition-opacity shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">corporate_fare</span>
            </div>
            <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-0.5 rounded-full">+4.2%</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">Active Companies</p>
          <h3 className="text-3xl font-bold text-on-surface">1,284</h3>
          <div className="mt-2 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-0.5 rounded-full">+12.8%</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">Global Inventory Value</p>
          <h3 className="text-3xl font-bold text-on-surface">$4.2B</h3>
          <div className="mt-2 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-secondary" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-0.5 rounded-full">+8.1%</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">Monthly Revenue (MRR)</p>
          <h3 className="text-3xl font-bold text-on-surface">$12.4M</h3>
          <div className="mt-2 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <span className="text-on-surface-variant text-xs font-bold flex items-center">Target: 99.99%</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">System Uptime (30d)</p>
          <h3 className="text-3xl font-bold text-on-surface">99.98%</h3>
          <div className="mt-2 h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '99.9%' }}></div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Warehouse Capacity */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-lg font-bold text-on-surface">Global Warehouse Capacity</h4>
            <button className="p-1 hover:bg-surface-container rounded transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="p-6 flex-1 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Logistics Hub East (New Jersey, US)</span>
                <span className="text-red-600 font-bold">94% Full</span>
              </div>
              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Rotterdam Prime (NL)</span>
                <span className="text-primary font-bold">78% Full</span>
              </div>
              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Singapore Central (SG)</span>
                <span className="text-primary font-bold">65% Full</span>
              </div>
              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Tokyo Alpha (JP)</span>
                <span className="text-green-600 font-bold">42% Full</span>
              </div>
              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Feed */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-lg font-bold text-on-surface">Audit Feed</h4>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <div className="flex gap-3 p-2.5 hover:bg-surface-container-low transition-colors rounded-lg cursor-pointer" onClick={() => navigate('/audit-logs')}>
              <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined text-[18px]">security</span>
              </div>
              <div>
                <p className="text-xs text-on-surface"><strong className="font-bold">System</strong> updated RBAC for <strong>GlobalTech Corp</strong></p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">2 mins ago • IP: 192.168.1.4</p>
              </div>
            </div>

            <div className="flex gap-3 p-2.5 hover:bg-surface-container-low transition-colors rounded-lg cursor-pointer" onClick={() => navigate('/audit-logs')}>
              <div className="w-8 h-8 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div>
                <p className="text-xs text-on-surface"><strong className="font-bold">Apex Logistics</strong> capacity exceeded 95% at <strong>Site-B</strong></p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">14 mins ago • Alert Triggered</p>
              </div>
            </div>

            <div className="flex gap-3 p-2.5 hover:bg-surface-container-low transition-colors rounded-lg cursor-pointer" onClick={() => navigate('/audit-logs')}>
              <div className="w-8 h-8 shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
              </div>
              <div>
                <p className="text-xs text-on-surface"><strong className="font-bold">Admin</strong> onboarded new company <strong>Zenith Retailers</strong></p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">48 mins ago • Setup Complete</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-outline-variant bg-surface-container-low text-center">
            <button onClick={() => navigate('/audit-logs')} className="text-xs text-primary font-bold hover:underline cursor-pointer">View Full Audit History</button>
          </div>
        </div>
      </div>

      {/* Company Performance Table */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-on-surface">Company Performance</h4>
            <p className="text-xs text-on-surface-variant">Top-tier clients by transaction volume and revenue generation.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-bold text-on-surface-variant">
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Industry</th>
                <th className="px-6 py-4">Active Orders</th>
                <th className="px-6 py-4">Inventory Val.</th>
                <th className="px-6 py-4">MRR Contribution</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-bold text-primary">GT</div>
                    <div>
                      <p className="font-bold text-on-surface">GlobalTech Corp</p>
                      <p className="text-[11px] text-on-surface-variant">ID: NEX-GT-001</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-xs">Consumer Electronics</td>
                <td className="px-6 py-4 text-xs font-semibold">45,204</td>
                <td className="px-6 py-4 text-xs font-semibold">$142.5M</td>
                <td className="px-6 py-4 text-xs font-bold text-primary">$24,500</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">ACTIVE</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => navigate('/users')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="View Company Details">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Warehouse Manager Dashboard (Fixed Overflow & Layout)
const WarehouseManagerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotification();

  const handleClearance = (lotId) => {
    notifySuccess(`Lot ${lotId} marked for priority clearance.`);
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Operational Dashboard</h2>
          <p className="text-xs text-on-surface-variant">
            Welcome back, {user?.name || 'Jordan Lee'}. Warehouse Alpha — East Coast Hub.
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase">LIVE</span>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Warehouse Capacity</p>
          <h3 className="text-2xl font-bold text-primary">84.2%</h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '84.2%' }}></div>
          </div>
          <p className="text-[11px] text-outline mt-1">8,420 / 10,000 bins occupied</p>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Pending Tasks</p>
          <h3 className="text-2xl font-bold text-primary">127</h3>
          <p className="text-[11px] text-red-500 font-bold mt-2">↑ +12% from yesterday</p>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Today's Shipments</p>
          <h3 className="text-2xl font-bold text-primary">48</h3>
          <p className="text-[11px] text-primary font-bold mt-2">✓ 32 Dispatched / 16 remaining</p>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Near Expiry (&lt;30d)</p>
          <h3 className="text-2xl font-bold text-red-600">12</h3>
          <p onClick={() => navigate('/expiry-tracking')} className="text-[11px] text-red-600 font-bold underline mt-2 cursor-pointer">
            View critical lots
          </p>
        </div>
      </div>

      {/* Operational Gauges & Efficiency Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-base font-bold text-on-surface">Operational Status</h4>
            <div className="flex gap-3 text-[11px] font-bold text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span> ACTUAL</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> TARGET</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
            {/* Picking Radial Gauge */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-100" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="10" />
                  <circle className="text-primary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset="75" strokeWidth="10" />
                </svg>
                <span className="absolute text-xl font-bold text-on-surface">75%</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Picking</span>
              <span className="text-xs text-on-surface-variant">450/600 Items</span>
            </div>

            {/* Packing Radial Gauge */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-100" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="10" />
                  <circle className="text-primary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset="150" strokeWidth="10" />
                </svg>
                <span className="absolute text-xl font-bold text-on-surface">50%</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Packing</span>
              <span className="text-xs text-on-surface-variant">32/64 Orders</span>
            </div>

            {/* Shipping Radial Gauge */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-100" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="10" />
                  <circle className="text-primary" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset="90" strokeWidth="10" />
                </svg>
                <span className="absolute text-xl font-bold text-on-surface">70%</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Shipping</span>
              <span className="text-xs text-on-surface-variant">14/20 Trucks</span>
            </div>
          </div>
        </div>

        {/* Efficiency Trend Card */}
        <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Efficiency Trend</h4>
            <div className="flex items-end gap-1.5 h-28 mb-3">
              <div className="flex-1 bg-primary/40 rounded-t h-[40%]"></div>
              <div className="flex-1 bg-primary/40 rounded-t h-[60%]"></div>
              <div className="flex-1 bg-primary/40 rounded-t h-[55%]"></div>
              <div className="flex-1 bg-primary/80 rounded-t h-[80%]"></div>
              <div className="flex-1 bg-primary/60 rounded-t h-[70%]"></div>
              <div className="flex-1 bg-primary rounded-t h-[95%]"></div>
              <div className="flex-1 bg-primary/80 rounded-t h-[85%]"></div>
            </div>
            <p className="text-xs font-medium text-slate-300">Peak Performance reached at 11:30 AM</p>
          </div>
          <button onClick={() => navigate('/reports')} className="w-full py-2 bg-primary text-white rounded text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer mt-4">
            Generate Analytics
          </button>
        </div>
      </div>

      {/* Expiring Lots & Incoming Shipments (Fixed Layout & Overflow) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Expiring Lots Table */}
        <div className="xl:col-span-2 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 sm:p-5 border-b border-outline-variant flex justify-between items-center bg-white">
            <h4 className="text-base font-bold text-on-surface">Expiring Lots (&lt;30 Days)</h4>
            <button onClick={() => navigate('/expiry-tracking')} className="text-primary text-xs font-bold hover:underline cursor-pointer">
              View All
            </button>
          </div>
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-xs">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">LOT-88219</td>
                  <td className="px-4 py-3 font-semibold text-on-surface">Premium Grade Steel Coil</td>
                  <td className="px-4 py-3 text-red-600 font-bold">2023-11-25</td>
                  <td className="px-4 py-3">120 Units</td>
                  <td className="px-4 py-3 font-mono">B1-A4-02</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleClearance('LOT-88219')}
                      className="px-3 py-1 bg-primary/10 text-primary rounded font-bold hover:bg-primary/20 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Mark for Clearance
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">LOT-88402</td>
                  <td className="px-4 py-3 font-semibold text-on-surface">Industrial Lubricant 5L</td>
                  <td className="px-4 py-3 text-red-600 font-bold">2023-11-28</td>
                  <td className="px-4 py-3">45 Units</td>
                  <td className="px-4 py-3 font-mono">A4-G9-11</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleClearance('LOT-88402')}
                      className="px-3 py-1 bg-primary/10 text-primary rounded font-bold hover:bg-primary/20 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Mark for Clearance
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Incoming Shipments (Clean Grid Layout) */}
        <div className="bg-white border border-outline-variant rounded-xl p-4 sm:p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-bold text-on-surface">Incoming Shipments</h4>
            <span className="text-xs text-on-surface-variant font-medium">Nov 22, 2023</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {/* Row 1 */}
            <div className="p-3 border border-outline-variant rounded-lg hover:border-primary transition-all cursor-pointer">
              <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-3 items-center">
                <div className="flex flex-col items-center justify-center bg-slate-100 p-1.5 rounded text-center shrink-0">
                  <span className="text-xs font-bold text-on-surface">14:00</span>
                  <span className="text-[9px] text-on-surface-variant font-bold">ETA</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-on-surface truncate">ASN-2023-881</div>
                  <p className="text-[11px] text-on-surface-variant truncate">SwiftLogistics</p>
                  <p className="text-[10px] text-outline truncate mt-0.5">14 pallets • Dock 4</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                  In Transit
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="p-3 border border-primary/40 bg-blue-50/40 border-l-4 border-l-primary rounded-lg transition-all cursor-pointer">
              <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-3 items-center">
                <div className="flex flex-col items-center justify-center bg-primary/10 p-1.5 rounded text-center shrink-0">
                  <span className="text-xs font-bold text-primary">15:30</span>
                  <span className="text-[9px] text-primary font-bold">ETA</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-on-surface truncate">ASN-2023-894</div>
                  <p className="text-[11px] text-on-surface-variant truncate">Global Freight</p>
                  <p className="text-[10px] text-outline truncate mt-0.5">42 pallets • High-Density</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white shrink-0">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Clerk Dashboard
const InventoryClerkDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotification();

  const handleStartTask = (taskTitle) => {
    notifySuccess(`Started task: ${taskTitle}`);
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-on-surface">Clerk Task Queue</h2>
        <p className="text-xs text-on-surface-variant">
          Welcome back, {user?.name || 'Casey Rivera'}. Assigned daily picking & inventory tasks.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Total SKUs Managed</p>
          <h3 className="text-2xl font-bold text-on-surface">12,842</h3>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Open Cycle Counts</p>
          <h3 className="text-2xl font-bold text-on-surface">24</h3>
        </div>
        <div className="bg-white p-5 border border-red-200 bg-red-50/50 rounded-xl shadow-sm">
          <p className="text-xs text-red-700 font-semibold">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold text-red-600">18</h3>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Barcodes to Print</p>
          <h3 className="text-2xl font-bold text-primary">156</h3>
        </div>
      </div>

      {/* Task Queue & Stock Alerts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Task Queue */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="text-base font-bold text-on-surface">My Task Queue</h3>
            <button onClick={() => navigate('/inventory')} className="text-primary text-xs font-bold hover:underline cursor-pointer">
              View All Work Orders
            </button>
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">move_up</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-on-surface">Relocate Lot B12-X09</h4>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase">High Priority</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">Transfer 50 units of "Thermal Gaskets" from Receipt Area A to Bin 402-B.</p>
              </div>
              <button
                onClick={() => handleStartTask('Relocate Lot B12-X09')}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Start
              </button>
            </div>

            <div className="p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <span className="material-symbols-outlined">inventory</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-on-surface">Cycle Count Aisle 4</h4>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">Recurring</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">Verify quantities for 12 SKUs in Section 4-A to 4-F. Last count: 30 days ago.</p>
              </div>
              <button
                onClick={() => handleStartTask('Cycle Count Aisle 4')}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer"
              >
                Start
              </button>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-outline-variant flex items-center gap-2 bg-red-50">
            <span className="material-symbols-outlined text-red-600">notifications_active</span>
            <h3 className="text-base font-bold text-on-surface">Stock Alerts</h3>
          </div>
          <div className="p-4 space-y-3 flex-1">
            <div className="flex justify-between items-center p-2.5 bg-surface-container-low rounded-lg">
              <div>
                <p className="font-bold text-xs text-on-surface">SKU-4921</p>
                <p className="text-[10px] text-on-surface-variant">Copper Wire 12G</p>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-bold text-xs">12</span>
                <span className="text-[10px] text-on-surface-variant"> / 200 min</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-surface-container-low rounded-lg">
              <div>
                <p className="font-bold text-xs text-on-surface">SKU-8810</p>
                <p className="text-[10px] text-on-surface-variant">Silicon Sealant</p>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-bold text-xs">5</span>
                <span className="text-[10px] text-on-surface-variant"> / 50 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Portal Dashboard (Fixed Card Padding & Actions)
const ClientPortalDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess } = useNotification();

  const handleCreateOrder = () => {
    notifySuccess('Opening New Order Creation Modal...');
    navigate('/sales-orders');
  };

  const handleQuickOrder = (productName) => {
    notifySuccess(`Quick Order placed for: ${productName}`);
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Overview</h2>
          <p className="text-xs text-on-surface-variant">
            Welcome back, {user?.name || 'Sam Wilson'}. Your supply chain is currently stable.
          </p>
        </div>
        <button
          onClick={handleCreateOrder}
          className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary-container shadow-sm cursor-pointer"
        >
          Create New Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">package_2</span>
            <span className="text-xs text-green-600 font-bold">+2 since yesterday</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Active Orders</h3>
            <p className="text-2xl font-bold text-on-surface">14</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-slate-700 bg-slate-100 p-2 rounded-lg">payments</span>
            <span className="text-xs text-on-surface-variant font-medium">Month to Date</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Total Spend</h3>
            <p className="text-2xl font-bold text-on-surface">$142,850.00</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg">account_balance_wallet</span>
            <button className="text-primary text-xs font-bold hover:underline cursor-pointer">Refill</button>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Available Credits</h3>
            <p className="text-2xl font-bold text-on-surface">$25,000.00</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-red-600 bg-red-100 p-2 rounded-lg">description</span>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">URGENT</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">COAs Pending Download</h3>
            <p className="text-2xl font-bold text-on-surface">3</p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Order Tracker & Recent Orders */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-base font-bold text-on-surface">Track Most Recent Order</h3>
              <span className="text-xs text-on-surface-variant">Order ID: #NX-99201-B</span>
            </div>
            <div className="responsive-scroll p-4 sm:p-6">
              <div className="relative flex min-w-[560px] items-center justify-between">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-[66%] h-[2px] bg-primary -translate-y-1/2 z-0"></div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-1">Confirmed</p>
                  <p className="text-[10px] text-on-surface-variant">May 12, 09:00 AM</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[20px]">inventory</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-1">Processing</p>
                  <p className="text-[10px] text-on-surface-variant">May 13, 02:45 PM</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-4 border-primary bg-white text-primary flex items-center justify-center shadow animate-pulse">
                    <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-1">In Transit</p>
                  <p className="text-[10px] text-on-surface-variant">Expected May 15</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">home_work</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-1">Delivered</p>
                  <p className="text-[10px] text-on-surface-variant">Estimated May 16</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/80 p-3.5 px-4 flex items-center gap-3 border-t border-blue-100">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-xs text-primary font-medium">
                Your shipment has left the East Coast Regional Hub and is currently en route to the final distribution center.
              </p>
            </div>
          </section>

          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-base font-bold text-on-surface">Recent Orders</h3>
              <button onClick={() => navigate('/sales-orders')} className="text-primary text-xs font-bold hover:underline cursor-pointer">
                View All Orders
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-bold text-on-surface-variant">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-xs">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3.5 text-primary font-bold">#NX-99201-B</td>
                    <td className="px-4 py-3.5 text-on-surface-variant">May 12, 2024</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                        In Transit
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">$4,250.00</td>
                    <td onClick={() => navigate('/shipping')} className="px-4 py-3.5 text-primary font-bold hover:underline cursor-pointer">
                      Track →
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3.5 text-primary font-bold">#NX-99185-A</td>
                    <td className="px-4 py-3.5 text-on-surface-variant">May 08, 2024</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">$12,800.00</td>
                    <td onClick={() => navigate('/reports')} className="px-4 py-3.5 text-primary font-bold hover:underline cursor-pointer">
                      Invoice ↓
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Featured Products */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
              <h3 className="text-base font-bold text-on-surface">New Arrivals</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-all group flex flex-col">
                <div className="h-40 bg-slate-100 overflow-hidden shrink-0">
                  <img
                    src="/images/wms/product-solvent.jpg"
                    alt="Iso-Propyl Solvent A1"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-on-surface text-sm">Iso-Propyl Solvent A1</h4>
                      <span className="text-xs font-bold text-primary">$285.00</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4 leading-normal">
                      High-purity industrial grade cleaning agent. 20L Drum.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickOrder('Iso-Propyl Solvent A1')}
                    className="w-full py-2 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer mt-auto"
                  >
                    Quick Order
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
