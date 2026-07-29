import { useState, useEffect } from 'react';
import { RefreshCw, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { batchService } from '@/services/batchService';
import { api } from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/feedback/LoadingState';

export const ExpiryTrackingPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await batchService.getExpiringBatches();
      setExpiryAlerts(data || []);
    } catch {
      notifyError('Failed to load expiry alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRunExpiryScan = async () => {
    try {
      const res = await api.post('/v1/expiry/scan');
      notifySuccess(`Automated Expiry Scan completed. Scanned ${res.data?.scannedBatches || 0} batches, generated ${res.data?.alertsGeneratedCount || 0} active alerts.`);
      fetchAlerts();
    } catch {
      notifyError('Failed to execute automated expiry scan');
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await api.patch(`/v1/expiry/alerts/${id}/resolve`);
      notifySuccess('Expiry alert resolved.');
      fetchAlerts();
    } catch {
      notifyError('Failed to resolve alert');
    }
  };

  const columns = [
    {
      header: 'Lot / Batch Code',
      accessor: 'batch',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-red-600">
          {row.batch?.lotNumber || row.batch?.lotId || row.lotId}
        </span>
      ),
    },
    {
      header: 'Product Item',
      accessor: 'product',
      cell: (row) => row.product?.name || 'Product',
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      cell: (row) => (row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'),
    },
    {
      header: 'Days Remaining',
      accessor: 'daysRemaining',
      cell: (row) => (
        <span className={`font-bold font-mono ${row.daysRemaining <= 0 ? 'text-red-600' : row.daysRemaining <= 7 ? 'text-amber-600' : 'text-slate-800'}`}>
          {row.daysRemaining <= 0 ? 'EXPIRED' : `${row.daysRemaining} Days`}
        </span>
      ),
    },
    {
      header: 'Alert Tier',
      accessor: 'alertTier',
      cell: (row) => (
        <Badge variant={row.alertTier === 'EXPIRED' ? 'danger' : row.alertTier === 'ALERT_7D' ? 'warning' : 'info'}>
          {row.alertTier}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={CheckCircle2}
          onClick={() => handleResolveAlert(row.id)}
        >
          Resolve Alert
        </Button>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading Expiry & FEFO Watchlist Alerts..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Expiry & FEFO Control Watchlist"
        description="Monitor near-expiry stock, automated 30d/15d/7d alert tiers, and quarantine holds"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Expiry Control' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchAlerts}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={Calendar} onClick={handleRunExpiryScan}>
              Run Automated Expiry Scan
            </Button>
          </div>
        }
      />

      <div className="flex-1 bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
        <DataTable columns={columns} data={expiryAlerts} />
      </div>
    </section>
  );
};

export default ExpiryTrackingPage;
