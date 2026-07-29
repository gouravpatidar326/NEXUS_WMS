import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/permissions/roles';
import { dashboardService } from '@/services/dashboardService';
<<<<<<< HEAD
=======
import LoadingState from '@/components/feedback/LoadingState';
>>>>>>> bfea083027191f1ba39e44601454fe317a16f51a

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

// Super Admin Dashboard
const SuperAdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getSuperAdminDashboard();
        setData(response.data);
      } catch (err) {
        notifyError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  const handleExportReport = () => {
    notifySuccess('Generating platform report... Download started (CSV).');
  };

  if (loading) return <LoadingState message="Loading dashboard metrics..." />;

  return (
    <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">System Overview</h2>
          <p className="text-sm text-on-surface-variant">
            Welcome back, {user?.name}. Global platform metrics and warehouse synchronization status.
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
            <span className="text-green-600 text-xs font-bold flex items-center bg-green-50 px-2 py-0.5 rounded-full">Live</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">Active Companies</p>
          <h3 className="text-3xl font-bold text-on-surface">{data?.activeCompanies || 0}</h3>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">Global Inventory Value</p>
          <h3 className="text-3xl font-bold text-on-surface">${(data?.globalInventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm opacity-60">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold flex items-center bg-slate-100 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">Monthly Revenue (MRR)</p>
          <h3 className="text-3xl font-bold text-on-surface">N/A</h3>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 flex flex-col gap-2 shadow-sm opacity-60">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <span className="text-xs font-bold flex items-center bg-slate-100 px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          <p className="text-xs font-semibold text-on-surface-variant mt-2">System Uptime (30d)</p>
          <h3 className="text-3xl font-bold text-on-surface">N/A</h3>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Warehouse Capacity - Mocked for now since not modeled */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm opacity-60">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-lg font-bold text-on-surface">Global Warehouse Capacity</h4>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold uppercase">Coming Soon</span>
          </div>
          <div className="p-6 flex-1 flex items-center justify-center">
            <p className="text-sm text-on-surface-variant font-medium">Capacity modeling is under development.</p>
          </div>
        </div>

        {/* Audit Feed */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-xl flex flex-col shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-lg font-bold text-on-surface">Audit Feed</h4>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-[300px] max-h-[350px]">
            {data?.auditLogs?.length > 0 ? (
              data.auditLogs.map((log) => (
                <div key={log.id} className="flex gap-3 p-2.5 hover:bg-surface-container-low transition-colors rounded-lg cursor-pointer" onClick={() => navigate('/audit-logs')}>
                  <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface"><strong className="font-bold">{log.user?.name || 'System'}</strong>: {log.action}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{new Date(log.createdAt).toLocaleString()} • {log.company?.name || 'Global'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant p-4 text-center">No recent activity.</p>
            )}
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
              {data?.companiesList?.map((company) => (
                <tr key={company.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-bold text-primary">
                        {company.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{company.name}</p>
                        <p className="text-[11px] text-on-surface-variant">ID: {company.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">Retail</td>
                  <td className="px-6 py-4 text-xs font-semibold">{company._count?.salesOrders || 0}</td>
                  <td className="px-6 py-4 text-xs font-semibold">N/A</td>
                  <td className="px-6 py-4 text-xs font-bold text-primary">N/A</td>
                  <td className="px-6 py-4">
                    {company.isActive ? (
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full">ACTIVE</span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">INACTIVE</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate('/companies')} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer" title="View Company Details">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.companiesList?.length && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-sm text-on-surface-variant">
                    No active companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Warehouse Manager Dashboard
const WarehouseManagerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
<<<<<<< HEAD
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await dashboardService.getManagerSummary();
        setSummary(data);
      } catch (error) {
        notifyError('Failed to fetch dashboard summary');
      }
    };
    fetchSummary();
=======
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getManagerDashboard();
        setData(response.data);
      } catch (err) {
        notifyError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
>>>>>>> bfea083027191f1ba39e44601454fe317a16f51a
  }, [notifyError]);

  const handleClearance = (lotId) => {
    notifySuccess(`Lot ${lotId} marked for priority clearance.`);
  };

  if (loading) return <LoadingState message="Loading dashboard metrics..." />;

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
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm opacity-60">
          <p className="text-xs text-on-surface-variant flex justify-between">Warehouse Capacity <span className="bg-slate-100 px-1 rounded text-[10px]">Coming Soon</span></p>
          <h3 className="text-2xl font-bold text-primary">N/A</h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '0%' }}></div>
          </div>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
<<<<<<< HEAD
          <p className="text-xs text-on-surface-variant">Pending Pick Lists</p>
          <h3 className="text-2xl font-bold text-primary">{summary ? summary.pendingPickLists : '...'}</h3>
          <p className="text-[11px] text-on-surface-variant font-bold mt-2">Active picking tasks</p>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Pending Sales Orders</p>
          <h3 className="text-2xl font-bold text-primary">{summary ? summary.pendingSalesOrders : '...'}</h3>
          <p className="text-[11px] text-primary font-bold mt-2">Needs review</p>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Near Expiry (&lt;30d)</p>
          <h3 className="text-2xl font-bold text-red-600">{summary ? summary.nearExpiryBatches?.length || 0 : '...'}</h3>
=======
          <p className="text-xs text-on-surface-variant">Pending Tasks</p>
          <h3 className="text-2xl font-bold text-primary">{data?.pendingTasks || 0}</h3>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Today's Shipments</p>
          <h3 className="text-2xl font-bold text-primary">{data?.todaysShipments || 0}</h3>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant">Near Expiry (&lt;30d)</p>
          <h3 className="text-2xl font-bold text-red-600">{data?.nearExpiryCount || 0}</h3>
>>>>>>> bfea083027191f1ba39e44601454fe317a16f51a
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
<<<<<<< HEAD
                {summary && summary.nearExpiryBatches && summary.nearExpiryBatches.length > 0 ? (
                  summary.nearExpiryBatches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{batch.lotId}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface">Product {batch.productId.substring(0,8)}</td>
                      <td className="px-4 py-3 text-red-600 font-bold">{new Date(batch.expiryDate).toISOString().split('T')[0]}</td>
                      <td className="px-4 py-3">--</td>
                      <td className="px-4 py-3 font-mono">--</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleClearance(batch.lotId)}
                          className="px-3 py-1 bg-primary/10 text-primary rounded font-bold hover:bg-primary/20 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Mark for Clearance
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-on-surface-variant font-medium">
                      No expiring lots found.
=======
                {data?.expiringLots?.map((lot) => (
                  <tr key={lot.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{lot.batchNumber}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{lot.product?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{new Date(lot.expiryDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{lot.quantity} Units</td>
                    <td className="px-4 py-3 font-mono">N/A</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleClearance(lot.batchNumber)}
                        className="px-3 py-1 bg-primary/10 text-primary rounded font-bold hover:bg-primary/20 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Mark for Clearance
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.expiringLots?.length && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-sm text-on-surface-variant">
                      No lots expiring soon.
>>>>>>> bfea083027191f1ba39e44601454fe317a16f51a
                    </td>
                  </tr>
                )}
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
            {data?.incomingShipments?.map((po) => (
              <div key={po.id} className="p-3 border border-outline-variant rounded-lg hover:border-primary transition-all cursor-pointer">
                <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] gap-3 items-center">
                  <div className="flex flex-col items-center justify-center bg-slate-100 p-1.5 rounded text-center shrink-0">
                    <span className="text-[9px] text-on-surface-variant font-bold">ETA</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-on-surface truncate">{po.orderNumber}</div>
                    <p className="text-[11px] text-on-surface-variant truncate">Expected {new Date(po.expectedDate).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                    {po.status}
                  </span>
                </div>
              </div>
            ))}
            {!data?.incomingShipments?.length && (
              <p className="text-sm text-center text-on-surface-variant p-4">No incoming shipments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory Clerk Dashboard
const InventoryClerkDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getClerkDashboard();
        setData(response.data);
      } catch (err) {
        notifyError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  const handleStartTask = (taskTitle) => {
    notifySuccess(`Started task: ${taskTitle}`);
  };

  if (loading) return <LoadingState message="Loading dashboard metrics..." />;

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
          <h3 className="text-2xl font-bold text-on-surface">{data?.totalSkus || 0}</h3>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm opacity-60">
          <p className="text-xs text-on-surface-variant">Open Cycle Counts <span className="bg-slate-100 px-1 rounded text-[10px]">Coming Soon</span></p>
          <h3 className="text-2xl font-bold text-on-surface">N/A</h3>
        </div>
        <div className="bg-white p-5 border border-red-200 bg-red-50/50 rounded-xl shadow-sm">
          <p className="text-xs text-red-700 font-semibold">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold text-red-600">{data?.lowStockAlerts || 0}</h3>
        </div>
        <div className="bg-white p-5 border border-outline-variant rounded-xl shadow-sm opacity-60">
          <p className="text-xs text-on-surface-variant">Barcodes to Print <span className="bg-slate-100 px-1 rounded text-[10px]">Coming Soon</span></p>
          <h3 className="text-2xl font-bold text-primary">N/A</h3>
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
            {data?.stockAlertsList?.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-2.5 bg-surface-container-low rounded-lg">
                <div>
                  <p className="font-bold text-xs text-on-surface">{product.sku}</p>
                  <p className="text-[10px] text-on-surface-variant">{product.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-red-600 font-bold text-xs">{product.totalStock}</span>
                  <span className="text-[10px] text-on-surface-variant"> / 50 min</span>
                </div>
              </div>
            ))}
            {!data?.stockAlertsList?.length && (
              <p className="text-sm text-center text-on-surface-variant p-4">No low stock alerts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Client Portal Dashboard
const ClientPortalDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getClientDashboard();
        setData(response.data);
      } catch (err) {
        notifyError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [notifyError]);

  const handleCreateOrder = () => {
    notifySuccess('Opening New Order Creation Modal...');
    navigate('/sales-orders');
  };

  const handleQuickOrder = (productName) => {
    notifySuccess(`Quick Order placed for: ${productName}`);
  };

  if (loading) return <LoadingState message="Loading dashboard metrics..." />;

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
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Active Orders</h3>
            <p className="text-2xl font-bold text-on-surface">{data?.activeOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-slate-700 bg-slate-100 p-2 rounded-lg">payments</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Total Spend</h3>
            <p className="text-2xl font-bold text-on-surface">${(data?.totalSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm opacity-60">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg">account_balance_wallet</span>
            <span className="bg-slate-100 px-1 rounded text-[10px]">Coming Soon</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Available Credits</h3>
            <p className="text-2xl font-bold text-on-surface">N/A</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm opacity-60">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-red-600 bg-red-100 p-2 rounded-lg">description</span>
            <span className="bg-slate-100 px-1 rounded text-[10px]">Coming Soon</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">COAs Pending Download</h3>
            <p className="text-2xl font-bold text-on-surface">N/A</p>
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
                  {data?.recentOrders?.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3.5 text-primary font-bold">{order.orderNumber}</td>
                      <td className="px-4 py-3.5 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold">${(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td onClick={() => navigate('/shipping')} className="px-4 py-3.5 text-primary font-bold hover:underline cursor-pointer">
                        Track →
                      </td>
                    </tr>
                  ))}
                  {!data?.recentOrders?.length && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-sm text-on-surface-variant">
                        No recent orders.
                      </td>
                    </tr>
                  )}
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
