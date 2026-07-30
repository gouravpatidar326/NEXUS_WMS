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
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [tier, setTier] = useState('STANDARD');
  const [creditLimit, setCreditLimit] = useState('100000');
  const [errors, setErrors] = useState({});

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
    setPhone('');
    setAddress('');
    setStatus('ACTIVE');
    setTier('STANDARD');
    setCreditLimit('100000');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cli) => {
    setEditingClient(cli);
    setName(cli.name || '');
    setEmail(cli.email || '');
    setPhone(cli.phone || '');
    setAddress(cli.address || '');
    setStatus(cli.status || 'ACTIVE');
    setTier(cli.tier || 'STANDARD');
    setCreditLimit(String(cli.creditLimit || '100000'));
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!name) newErrors.name = 'Contact name is required';
    if (!email) newErrors.email = 'Email address is required';
    if (!phone) newErrors.phone = 'Phone number is required';
    if (!address) newErrors.address = 'Billing address is required';
    if (!status) newErrors.status = 'Status is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notifyError('Please fill in all required fields highlighted in red.');
      return;
    }

    setErrors({});

    try {
      const payload = {
        name,
        email,
        phone,
        address,
        status,
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
      cell: (row) => <Badge variant={row.status === 'ACTIVE' ? 'success' : 'warning'} dot>{row.status || 'ACTIVE'}</Badge>,
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client Contact Name" required error={errors.name}>
              <Input value={name} onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}); }} placeholder="e.g. Sam Wilson" error={errors.name} />
            </FormField>
            <FormField label="Email Address" required error={errors.email}>
              <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }} placeholder="sam@acmecorp.com" error={errors.email} />
            </FormField>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" required error={errors.phone}>
              <Input value={phone} onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: ''}); }} placeholder="e.g. +1 555-0198" error={errors.phone} />
            </FormField>
            <FormField label="Account Status" required error={errors.status}>
              <Select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setErrors({...errors, status: ''}); }}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive / Suspended' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Billing Address" required error={errors.address}>
            <Input value={address} onChange={(e) => { setAddress(e.target.value); setErrors({...errors, address: ''}); }} placeholder="123 Corporate Blvd, Suite 100" error={errors.address} />
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
                required
              />
            </FormField>
            <FormField label="Approved Credit Limit ($)" required>
              <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} required />
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
