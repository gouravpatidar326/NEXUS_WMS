import { useState, useEffect } from 'react';
import { History, ShieldCheck, Download, RefreshCw, Search } from 'lucide-react';
import { auditService } from '@/services/auditService';
import { useNotification } from '@/contexts/NotificationContext';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/feedback/LoadingState';

export const AuditLogsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getLogs({ search, event: eventFilter });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      notifyError('Failed to load system audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventFilter]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      notifyError('No audit log entries to export.');
      return;
    }
    const headers = 'ID,Event,User,Email,Role,IP Address,Timestamp\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.event}","${l.user?.name || 'System'}","${l.user?.email || '-'}","${l.user?.role || '-'}","${l.ipAddress || '-'}","${new Date(l.timestamp).toLocaleString()}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    notifySuccess('Audit trail exported to CSV successfully.');
  };

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.event || '').toLowerCase().includes(q) ||
      (l.user?.name || '').toLowerCase().includes(q) ||
      (l.user?.email || '').toLowerCase().includes(q) ||
      (l.ipAddress || '').toLowerCase().includes(q) ||
      (l.id || '').toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Audit Record ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.id ? `LOG-${row.id.substring(0, 8)}` : 'LOG-GENERIC'}
        </span>
      ),
    },
    {
      header: 'Event Action',
      accessor: 'event',
      cell: (row) => {
        const ev = row.event || 'SYSTEM_EVENT';
        const variant =
          ev.includes('DELETE') || ev.includes('REMOVE')
            ? 'danger'
            : ev.includes('UPDATE') || ev.includes('EDIT')
            ? 'warning'
            : ev.includes('CREATE') || ev.includes('LOGIN')
            ? 'success'
            : 'primary';
        return <Badge variant={variant}>{ev}</Badge>;
      },
    },
    {
      header: 'User / Actor',
      accessor: 'user',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.user?.name || 'System Auto-Task'}</span>
          <span className="text-[11px] text-slate-500">{row.user?.email || 'system@nexus.wms'}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => <Badge variant="info">{row.user?.role || 'SYSTEM'}</Badge>,
    },
    {
      header: 'Client IP Address',
      accessor: 'ipAddress',
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.ipAddress || '127.0.0.1 (Local)'}</span>,
    },
    {
      header: 'Timestamp (UTC/Local)',
      accessor: 'timestamp',
      cell: (row) => (
        <span className="text-xs font-mono text-slate-600">
          {row.timestamp ? new Date(row.timestamp).toLocaleString() : 'Just now'}
        </span>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading immutable security & system audit logs from MySQL..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & System Audit Trail"
        description="Immutable record of user actions, authentication events, role modifications, and inventory stock transactions"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit Logs' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchLogs}>
              Refresh Logs
            </Button>
            <Button variant="primary" leftIcon={Download} onClick={handleExportCSV}>
              Export Security CSV
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
            placeholder="Search by User Name, Email, Action Event, or IP Address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={loading}
        emptyMessage="No security audit log entries recorded in database yet."
      />
    </div>
  );
};

export default AuditLogsPage;
