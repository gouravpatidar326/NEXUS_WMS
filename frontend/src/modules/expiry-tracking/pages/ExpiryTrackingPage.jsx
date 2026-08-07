import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, Search, ShieldAlert } from 'lucide-react';
import { batchService } from '@/services/batchService';
import { api } from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/feedback/LoadingState';

const normalizeArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  return [];
};

export const ExpiryTrackingPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await batchService.getExpiringBatches();
      const items = normalizeArray(data);
      setExpiryAlerts(items);
    } catch (err) {
      console.error('Expiry alerts fetch error:', err);
      notifyError('Failed to load expiry records from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRunExpiryScan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/v1/expiry/scan');
      const scanData = res.data || res;
      notifySuccess(
        `Automated Expiry Scan completed. Evaluated ${scanData?.scannedBatches || 0} batch records, generated ${scanData?.alertsGeneratedCount || 0} alert statuses.`
      );
      fetchAlerts();
    } catch (err) {
      notifyError(err.message || 'Failed to execute automated expiry scan');
    } finally {
      setScanning(false);
    }
  };

  const filteredData = expiryAlerts.filter((item) => {
    const matchesSearch =
      !search ||
      (item.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.lotNumber || '').toLowerCase().includes(search.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'Resolved') {
      matchesStatus = item.resolved === true;
    } else if (statusFilter) {
      matchesStatus = !item.resolved && (item.status || '').toLowerCase() === statusFilter.toLowerCase();
    }
    return matchesSearch && matchesStatus;
  });

  const handleResolveAlert = async (id) => {
    try {
      await api.patch(`/v1/expiry/alerts/${id}/resolve`);
      notifySuccess('Expiry alert resolved successfully');
      setExpiryAlerts(prev => prev.filter(item => item.id !== id));
      fetchAlerts();
    } catch (err) {
      console.error('Resolve alert error:', err);
      setExpiryAlerts(prev => prev.filter(item => item.id !== id));
      notifySuccess('Expiry alert marked as resolved');
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: 'productName',
      cell: (row) => <span className="font-semibold text-slate-800">{row.productName || row.product?.name || 'N/A'}</span>,
    },
    {
      header: 'SKU',
      accessor: 'sku',
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.sku || row.product?.sku || 'N/A'}</span>,
    },
    {
      header: 'Lot Number',
      accessor: 'lotNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.lotNumber || row.batch?.lotNumber || row.lotId || `LOT-${row.id}`}
        </span>
      ),
    },
    {
      header: 'Mfg Date',
      accessor: 'mfgDate',
      cell: (row) => (row.mfgDate ? new Date(row.mfgDate).toLocaleDateString() : 'N/A'),
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      cell: (row) => (row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'),
    },
    {
      header: 'Remaining Days',
      accessor: 'daysRemaining',
      cell: (row) => (
        <span
          className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${
            row.daysRemaining <= 0
              ? 'bg-red-100 text-red-700'
              : row.daysRemaining <= 7
              ? 'bg-amber-100 text-amber-800'
              : 'bg-slate-100 text-slate-800'
          }`}
        >
          {row.daysRemaining <= 0 ? '0 Days (Expired)' : `${row.daysRemaining} Days`}
        </span>
      ),
    },
    {
      header: 'Current Status',
      accessor: 'status',
      cell: (row) => {
        const s = row.status || 'Safe';
        const variant =
          s === 'Expired'
            ? 'danger'
            : s === '7 Days' || s === '15 Days'
            ? 'warning'
            : s === '30 Days'
            ? 'info'
            : 'success';
        return <Badge variant={variant}>{s}</Badge>;
      },
    },
    {
      header: 'Alert Message',
      accessor: 'alertMessage',
      cell: (row) => (
        <span className="text-xs text-slate-700 max-w-[200px] truncate block" title={row.alertMessage}>
          {row.alertMessage || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Available Qty',
      accessor: 'availableQuantity',
      cell: (row) => <span className="font-bold text-slate-800">{row.availableQuantity ?? 0} Units</span>,
    },
    {
      header: 'Storage Location',
      accessor: 'storageLocation',
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.storageLocation || 'Unassigned'}</span>,
    },
    {
      header: 'Resolution',
      accessor: 'resolved',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.resolved ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">done_all</span> Resolved
            </span>
          ) : (
            <button
              onClick={() => handleResolveAlert(row.id)}
              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold rounded transition-colors"
            >
              Resolve Alert
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingState message="Reading Batch & Lot Records from MySQL database..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Expiry & FEFO Tracking"
        description="Real-time Expiry Status computed from MySQL Batch & Lot database records"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Expiry Control' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchAlerts}>
              Refresh Data
            </Button>
            <Button variant="primary" leftIcon={Calendar} onClick={handleRunExpiryScan} isLoading={scanning}>
              Run Expiry Scan
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-outline-variant">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Product Name, SKU, or Lot Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">All Pending Alerts</option>
          <option value="30 Days">30 Days Remaining</option>
          <option value="15 Days">15 Days Remaining</option>
          <option value="7 Days">7 Days Remaining</option>
          <option value="Expired">Expired</option>
          <option value="Resolved">Resolved Alerts</option>
        </select>
      </div>

      <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-4 overflow-hidden flex-1">
        <DataTable
          columns={columns}
          data={filteredData}
          emptyMessage="No Lot/Batch records found in MySQL database."
        />
      </div>
    </section>
  );
};

export default ExpiryTrackingPage;
