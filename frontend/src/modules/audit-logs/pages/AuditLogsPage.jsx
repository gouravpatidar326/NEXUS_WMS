import { useState, useEffect } from 'react';
import { History, ShieldCheck, Download, RefreshCw, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { auditService } from '@/services/auditService';
import { useNotification } from '@/contexts/NotificationContext';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LoadingState from '@/components/feedback/LoadingState';

export const AuditLogsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, limit: 50 });
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [page, setPage] = useState(1);

  // View Details Modal State
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getLogs({
        search,
        module: moduleFilter,
        page,
        limit: 50,
      });
      setLogs(res.items || []);
      setPagination(res.pagination || { currentPage: page, totalPages: 1, totalItems: res.items?.length || 0, limit: 50 });
    } catch (err) {
      notifyError('Failed to load system audit trail from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      notifyError('No audit log entries to export.');
      return;
    }
    const headers = 'Audit ID,Timestamp,User Name,User Email,Company,Warehouse,Module,Action,Record ID,Role,Status,Client IP,Description\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${new Date(l.timestamp).toLocaleString()}","${l.userName}","${l.userEmail}","${l.company}","${l.warehouse}","${l.module}","${l.action}","${l.recordId}","${l.role}","${l.status}","${l.clientIp}","${(l.description || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wms_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    notifySuccess('Filtered audit trail exported to CSV successfully.');
  };

  const columns = [
    {
      header: 'Audit ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.id ? `LOG-${row.id.substring(0, 8)}` : 'LOG-GENERIC'}
        </span>
      ),
    },
    {
      header: 'Date & Time',
      accessor: 'timestamp',
      cell: (row) => (
        <span className="text-xs font-mono text-slate-600">
          {row.timestamp ? new Date(row.timestamp).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'User Name',
      accessor: 'userName',
      cell: (row) => <span className="font-semibold text-slate-800">{row.userName}</span>,
    },
    {
      header: 'User Email',
      accessor: 'userEmail',
      cell: (row) => <span className="text-xs text-slate-500 font-mono">{row.userEmail}</span>,
    },
    {
      header: 'Company',
      accessor: 'company',
      cell: (row) => <span className="text-xs font-medium text-slate-700">{row.company}</span>,
    },
    {
      header: 'Warehouse',
      accessor: 'warehouse',
      cell: (row) => <span className="text-xs text-slate-600">{row.warehouse}</span>,
    },
    {
      header: 'Module',
      accessor: 'module',
      cell: (row) => <Badge variant="info">{row.module}</Badge>,
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (row) => {
        const ev = row.action || 'SYSTEM_EVENT';
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
      header: 'Record ID',
      accessor: 'recordId',
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.recordId}</span>,
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (row) => <Badge variant="secondary">{row.role}</Badge>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge variant="success">{row.status}</Badge>,
    },
    {
      header: 'Client IP',
      accessor: 'clientIp',
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.clientIp}</span>,
    },
    {
      header: 'Actions',
      accessor: 'view',
      cell: (row) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={Eye}
          onClick={() => setSelectedLog(row)}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading && logs.length === 0) return <LoadingState message="Reading system history audit logs from MySQL database..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & System Audit Trail"
        description="Immutable system history of user actions, permission modifications, and stock adjustments"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Audit Logs' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchLogs}>
              Refresh Data
            </Button>
            <Button variant="primary" leftIcon={Download} onClick={handleExportCSV}>
              Export Filtered CSV
            </Button>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-outline-variant">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Backend Search by User Name, Email, Action, or Client IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="">All WMS Modules</option>
          <option value="Authentication">Authentication</option>
          <option value="Products Catalog">Products Catalog</option>
          <option value="Warehouse Ops">Warehouse Ops</option>
          <option value="Inventory Stock">Inventory Stock</option>
          <option value="User & Company Admin">User & Company Admin</option>
          <option value="System History">System History</option>
        </select>
        <Button type="submit" variant="secondary" size="sm">
          Search Backend
        </Button>
      </form>

      {/* Audit Log Table */}
      <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
        <DataTable
          columns={columns}
          data={logs}
          isLoading={loading}
          emptyMessage="No system audit history log records found in database."
        />

        {/* Backend Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-outline-variant text-xs text-slate-600">
            <span>
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total audit records)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                rightIcon={ChevronRight}
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record Details — ${selectedLog.recordId}`}
          size="md"
          footer={
            <Button variant="primary" onClick={() => setSelectedLog(null)}>
              Close Details
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Audit ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Record ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedLog.recordId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Module:</span>
                <span className="font-bold text-slate-800">{selectedLog.module}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Action:</span>
                <span className="font-bold text-primary">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-500 block">User Name & Email:</span>
                <span className="font-semibold text-slate-800">{selectedLog.userName}</span>
                <span className="block text-[11px] text-slate-500">{selectedLog.userEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Role:</span>
                <span className="font-semibold text-slate-800">{selectedLog.role}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Company:</span>
                <span className="font-semibold text-slate-800">{selectedLog.company}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Warehouse:</span>
                <span className="font-semibold text-slate-800">{selectedLog.warehouse}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp:</span>
                <span className="font-mono text-slate-700">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">IP Address:</span>
                <span className="font-mono text-slate-700">{selectedLog.clientIp}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status:</span>
                <Badge variant="success">{selectedLog.status}</Badge>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-900 block mb-1">Description of Action:</span>
              <p className="text-blue-800 leading-relaxed">{selectedLog.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsPage;
