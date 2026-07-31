import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingState from '@/components/feedback/LoadingState';
import { companyService } from '@/services/companyService';

export const CompaniesPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Consumer Electronics');
  const [clientCode, setClientCode] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Delete Modal States
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      notifyError('Failed to fetch companies from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openAddModal = () => {
    setEditingCompany(null);
    setName('');
    setIndustry('Consumer Electronics');
    setClientCode('');
    setStatus('ACTIVE');
    setEmail('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setName(company.name || '');
    setIndustry(company.industry || 'Consumer Electronics');
    setClientCode(company.clientCode || '');
    setStatus(company.status || 'ACTIVE');
    setEmail(company.email || '');
    setPhone(company.phone || '');
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!name || !clientCode || !email || !phone || !industry || !status) {
      notifyError('All fields (Name, Code, Email, Phone, Industry, Status) are required.');
      return;
    }

    try {
      const payload = { name, industry, clientCode, status, email, phone };
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, payload);
        notifySuccess(`Company ${name} updated successfully.`);
      } else {
        await companyService.createCompany(payload);
        notifySuccess(`Company ${name} onboarded successfully.`);
      }
      setIsModalOpen(false);
      setName('');
      setClientCode('');
      setEmail('');
      setPhone('');
      setEditingCompany(null);
      fetchCompanies();
    } catch (err) {
      notifyError(err.message || 'Failed to save company');
    }
  };

  const openDeleteModal = (company) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompany) return;
    try {
      await companyService.deleteCompany(deletingCompany.id);
      notifySuccess(`Company ${deletingCompany.name} deleted successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingCompany(null);
      fetchCompanies();
    } catch (err) {
      notifyError(err.message || 'Failed to delete company');
    }
  };

  const columns = [
    {
      header: 'Company Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-bold flex items-center justify-center text-xs">
            {(row.name || 'CO').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs font-mono text-surface-400">{row.clientCode || row.id?.substring(0, 8)}</span>
          </div>
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry', cell: (row) => row.industry || 'N/A' },
    {
      header: 'Contact Info',
      accessor: 'email',
      cell: (row) => (
        <div className="text-sm">
          {row.email && <div className="text-surface-700 dark:text-surface-300">{row.email}</div>}
          {row.phone && <div className="text-surface-500 dark:text-surface-400 text-xs">{row.phone}</div>}
          {!row.email && !row.phone && <span className="text-surface-400">N/A</span>}
        </div>
      ),
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'} dot>
          {row.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title="Edit Company"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(row)}
            className="p-1.5 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete Company"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingState message="Fetching real companies from database..." />;

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Enterprise Companies Directory"
        description="Onboard client companies, manage multi-tenant accounts, and assign warehouse allocations"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Companies' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={openAddModal}>
            Onboard New Company
          </Button>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={companies} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? `Edit ${editingCompany.name}` : 'Onboard Enterprise Client Company'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCompany}>
              {editingCompany ? 'Save Changes' : 'Save & Provision Company Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <FormField label="Company Legal Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Apex International Ltd" required />
          </FormField>

          <FormField label="Internal Client Code" required>
            <Input value={clientCode} onChange={(e) => setClientCode(e.target.value)} placeholder="e.g. NEX-AI-009" required />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Email" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@company.com" required />
            </FormField>
            
            <FormField label="Contact Phone" required>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" required />
            </FormField>
          </div>

          <FormField label="Industry Sector" required>
            <Select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={[
                { value: 'Consumer Electronics', label: 'Consumer Electronics' },
                { value: 'Industrial Parts', label: 'Industrial Parts' },
                { value: 'Apparel & Goods', label: 'Apparel & Goods' },
                { value: 'Chemicals & Materials', label: 'Chemicals & Materials' },
                { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
                { value: 'Logistics', label: 'Logistics' },
              ]}
            />
          </FormField>

          <FormField label="Account Status" required>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </FormField>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete Company"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCompany}>
              Delete Company
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600 dark:text-surface-300">
          Are you sure you want to delete company <strong className="text-surface-900 dark:text-surface-100">{deletingCompany?.name}</strong>? This action will remove the company from the system.
        </p>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
