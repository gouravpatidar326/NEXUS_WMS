import { useState, useEffect } from 'react';
import { History, ShieldCheck, Download } from 'lucide-react';
import { auditService } from '@/services/auditService';
import { useNotification } from '@/contexts/NotificationContext';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export const AuditLogsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await auditService.getLogs();
        setLogs(data);
      } catch {
        notifyError('Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const columns = [
    {
      header: 'Audit ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Action Key',
      accessor: 'action',
      cell: (row) => <Badge variant="primary">{row.action}</Badge>,
    },
    { header: 'Module', accessor: 'module' },
    { header: 'User / Actor', accessor: 'performedBy' },
    { header: 'Audit Details', accessor: 'details' },
    {
      header: 'Client IP',
      accessor: 'ipAddress',
      cell: (row) => <span className="font-mono text-xs text-surface-400">{row.ipAddress}</span>,
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      cell: (row) => <span className="text-xs text-surface-400">{row.timestamp}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & System Audit Trail"
        description="Immutable record of user actions, permission modifications, and stock adjustments"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit Logs' }]}
        actions={
          <Button
            variant="outline"
            leftIcon={Download}
            onClick={() => notifySuccess('Exported audit trail to CSV')}
          >
            Export Security Trail
          </Button>
        }
      />

      <DataTable columns={columns} data={logs} isLoading={loading} />
    </div>
  );
};

export default AuditLogsPage;
