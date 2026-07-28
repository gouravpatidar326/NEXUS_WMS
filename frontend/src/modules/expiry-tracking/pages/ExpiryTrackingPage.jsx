import { useState, useEffect } from 'react';
import { Calendar, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { batchService } from '@/services/batchService';
import { useNotification } from '@/contexts/NotificationContext';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import KPICard from '@/components/data-display/KPICard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export const ExpiryTrackingPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await batchService.getExpiringBatches();
        setExpiringBatches(data);
      } catch {
        notifyError('Failed to load expiring batches');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleQuarantine = (lotNumber) => {
    notifySuccess(`Lot ${lotNumber} moved to FEFO Quarantine Hold Zone.`);
  };

  const columns = [
    {
      header: 'Lot Code',
      accessor: 'lotNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-danger-600 dark:text-danger-400">
          {row.lotNumber}
        </span>
      ),
    },
    { header: 'Product Item', accessor: 'productName' },
    { header: 'Expiry Date', accessor: 'expiryDate' },
    { header: 'Current Stock Qty', accessor: 'currentQty' },
    { header: 'Location Bin', accessor: 'location' },
    {
      header: 'Alert Level',
      accessor: 'status',
      cell: (row) => <Badge variant="danger">{row.status}</Badge>,
    },
    {
      header: 'FEFO Action',
      accessor: 'action',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={ShieldAlert}
          onClick={() => handleQuarantine(row.lotNumber)}
        >
          Quarantine Lot
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expiry & FEFO Control"
        description="Monitor near-expiry stock, FEFO rotation policies, and quarantine holds"
        breadcrumbs={[{ label: 'Inventory & Stock' }, { label: 'Expiry Tracking' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Near Expiry (30 Days)" value="2 Lots" change="Action Urgent" changeType="negative" icon={Calendar} iconBg="bg-warning-100 text-warning-600" />
        <KPICard title="Expired Stock In Vault" value="0 Lots" change="Clean" changeType="positive" icon={CheckCircle2} />
        <KPICard title="Quarantined Lots" value="1 Lot" change="On Hold" changeType="neutral" icon={AlertOctagon} iconBg="bg-danger-100 text-danger-600" />
      </div>

      <div className="card p-5 space-y-4">
        <h3 className="text-base font-bold text-surface-900 dark:text-white">
          Active FEFO Expiry Watchlist
        </h3>
        <DataTable columns={columns} data={expiringBatches} isLoading={loading} />
      </div>
    </div>
  );
};

export default ExpiryTrackingPage;
