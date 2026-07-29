import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingState from '@/components/feedback/LoadingState';
import { clientService } from '@/services/clientService';

export const ClientsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCliState, setDeleteCliState] = useState({ isOpen: false, client: null });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('STANDARD');
  const [creditLimit, setCreditLimit] = useState('100000');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.fetchClients();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      notifyError('Failed to fetch client directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setEmail('');
    setTier('STANDARD');
    setCreditLimit('100000');
    setIsModalOpen(true);
  };

  const openEditModal = (cli) => {
    setEditingClient(cli);
    setName(cli.name || '');
    setEmail(cli.email || '');
    setTier(cli.tier || 'STANDARD');
    setCreditLimit(String(cli.creditLimit || '100000'));
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!name) {
      notifyError('Client contact name is required');
      return;
    }

    try {
      const payload = {
        name,
        email,
        tier,
        creditLimit: parseFloat(creditLimit || '0'),
      };

      if (editingClient) {
        await clientService.updateClient(editingClient.id, payload);
        notifySuccess(`Client ${name} updated successfully.`);
      } else {
        await clientService.createClient(payload);
        notifySuccess(`Client account created for ${name}.`);
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      notifyError(err.message || 'Failed to save client');
    }
  };

  const handleDeleteClient = (cli) => {
    setDeleteCliState({ isOpen: true, client: cli });
  };

  const confirmDeleteClient = async () => {
    if (!deleteCliState.client) return;
    try {
      await clientService.deleteClient(deleteCliState.client.id);
      notifySuccess(`Client ${deleteCliState.client.name} deleted.`);
      setDeleteCliState({ isOpen: false, client: null });
      fetchClients();
    } catch (err) {
      notifyError(err.message || 'Failed to delete client');
    }
  };

  const columns = [
    {
      header: 'Client Contact',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
            {(row.name || 'CL').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs text-surface-400">{row.email || 'No email registered'}</span>
          </div>
        </div>
      ),
    },
    { header: 'Account Tier', accessor: 'tier', cell: (row) => <Badge variant="info">{row.tier}</Badge> },
    {
      header: 'Credit Limit',
      accessor: 'creditLimit',
      cell: (row) => <span className="font-bold text-primary">${(row.creditLimit || 0).toLocaleString()}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: () => <Badge variant="success" dot>Active</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(row)} className="p-1.5 text-slate-400 hover:text-primary">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteClient(row)} className="p-1.5 text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingState message="Fetching client account directory from database..." />;

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Client Account Directory"
        description="Manage portal access for client companies, credit terms, and order approval settings"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Clients' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={openAddModal}>
            Provision Client Portal Account
          </Button>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={clients} />
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit ${editingClient.name}` : 'Provision Client Portal Account'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveClient}>
              {editingClient ? 'Save Changes' : 'Provision Client Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <FormField label="Client Contact Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam Wilson" required />
          </FormField>
          <FormField label="Email Address">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sam@acmecorp.com" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Account Tier" required>
              <Select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                options={[
                  { value: 'STANDARD', label: 'Standard Client' },
                  { value: 'VIP', label: 'VIP Preferred' },
                  { value: 'ENTERPRISE_TIER_1', label: 'Enterprise Tier 1' },
                ]}
              />
            </FormField>
            <FormField label="Approved Credit Limit ($)">
              <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} />
            </FormField>
          </div>
        </form>
      </Modal>
      {/* Delete Client Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCliState.isOpen}
        onClose={() => setDeleteCliState({ isOpen: false, client: null })}
        onConfirm={confirmDeleteClient}
        title="Delete Client Company"
        message={`Are you sure you want to delete client account "${deleteCliState.client?.name}"?`}
        confirmText="Yes, Delete Client"
        variant="danger"
      />
    </div>
  );
};

export default ClientsPage;
