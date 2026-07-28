import { useState } from 'react';
import { Building2, Plus, Globe, Warehouse, CheckCircle2 } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const CompaniesPage = () => {
  const { notifySuccess } = useNotification();
  const [companies, setCompanies] = useState([
    { id: 'cmp_001', code: 'NEX-GT-001', name: 'GlobalTech Corp', industry: 'Consumer Electronics', activeOrders: 45204, inventoryVal: '$142.5M', mrr: '$24,500', status: 'Active', warehouses: 'Logistics Hub East, Rotterdam Prime' },
    { id: 'cmp_002', code: 'NEX-AP-002', name: 'Apex Logistics LLC', industry: 'Industrial Parts', activeOrders: 28910, inventoryVal: '$89.2M', mrr: '$18,200', status: 'Active', warehouses: 'Logistics Hub East, Singapore Central' },
    { id: 'cmp_003', code: 'NEX-ZR-003', name: 'Zenith Retailers', industry: 'Apparel & Goods', activeOrders: 14050, inventoryVal: '$54.0M', mrr: '$12,800', status: 'Active', warehouses: 'Tokyo Alpha' },
    { id: 'cmp_004', code: 'NEX-AC-004', name: 'Acme Corp', industry: 'Chemicals & Materials', activeOrders: 9820, inventoryVal: '$31.4M', mrr: '$9,500', status: 'Active', warehouses: 'Logistics Hub East' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Consumer Electronics');
  const [code, setCode] = useState('');

  const handleAddCompany = (e) => {
    e.preventDefault();
    const newCompany = {
      id: `cmp_${Date.now()}`,
      code: code || `NEX-${name.slice(0,2).toUpperCase()}-005`,
      name,
      industry,
      activeOrders: 0,
      inventoryVal: '$0.00',
      mrr: '$5,000',
      status: 'Active',
      warehouses: 'Logistics Hub East',
    };
    setCompanies([...companies, newCompany]);
    notifySuccess(`Company ${name} onboarded successfully.`);
    setIsModalOpen(false);
    setName('');
    setCode('');
  };

  const columns = [
    {
      header: 'Company Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 font-bold flex items-center justify-center text-xs">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs font-mono text-surface-400">{row.code}</span>
          </div>
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry' },
    { header: 'Assigned Warehouses', accessor: 'warehouses' },
    { header: 'Active Orders', accessor: 'activeOrders', cell: (row) => row.activeOrders.toLocaleString() },
    { header: 'Inventory Value', accessor: 'inventoryVal' },
    { header: 'MRR Contribution', accessor: 'mrr' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge variant="success" dot>{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Enterprise Companies Directory"
        description="Onboard client companies, manage multi-tenant accounts, and assign warehouse allocations"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Companies' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
            Onboard New Company
          </Button>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={companies} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Enterprise Client Company"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddCompany}>
              Save & Provision Company Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCompany} className="space-y-4">
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
              ]}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
