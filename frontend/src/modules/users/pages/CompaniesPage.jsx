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
  const [code, setCode] = useState('');

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
    setCode('');
    setIsModalOpen(true);
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setName(company.name || '');
    setIndustry(company.industry || 'Consumer Electronics');
    setCode(company.code || '');
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!name) {
      notifyError('Company name is required');
      return;
    }

    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, { name, industry });
        notifySuccess(`Company ${name} updated successfully.`);
      } else {
        await companyService.createCompany({ name, industry });
        notifySuccess(`Company ${name} onboarded successfully.`);
      }
      setIsModalOpen(false);
      setName('');
      setCode('');
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
            <span className="text-xs font-mono text-surface-400">{row.id?.substring(0, 8)}</span>
          </div>
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry', cell: (row) => row.industry || 'N/A' },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
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

          <FormField label="Internal Client Code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. NEX-AI-009" />
          </FormField>

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
