import { useState } from 'react';
import { UserCheck, Plus, Building, CreditCard, ShieldCheck } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const ClientsPage = () => {
  const { notifySuccess } = useNotification();
  const [clients, setClients] = useState([
    { id: 'cli_001', name: 'Sam Wilson', company: 'Acme Corp', email: 'sam@acmecorp.com', tier: 'Enterprise Tier 1', creditLimit: '$250,000', status: 'Active', totalOrders: 142 },
    { id: 'cli_002', name: 'Rachel Green', company: 'GlobalTech Corp', email: 'rachel@globaltech.com', tier: 'VIP Preferred', creditLimit: '$500,000', status: 'Active', totalOrders: 389 },
    { id: 'cli_003', name: 'Michael Scott', company: 'Dunder Mifflin', email: 'mscott@dundermifflin.com', tier: 'Standard Client', creditLimit: '$50,000', status: 'Active', totalOrders: 68 },
    { id: 'cli_004', name: 'Elena Rostova', company: 'Apex Logistics', email: 'elena@apexlogistics.com', tier: 'Enterprise Tier 2', creditLimit: '$150,000', status: 'Pending Review', totalOrders: 12 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('Standard Client');

  const handleAddClient = (e) => {
    e.preventDefault();
    const newClient = {
      id: `cli_${Date.now()}`,
      name,
      company,
      email,
      tier,
      creditLimit: '$100,000',
      status: 'Active',
      totalOrders: 0,
    };
    setClients([...clients, newClient]);
    notifySuccess(`Client portal account created for ${name} (${company}).`);
    setIsModalOpen(false);
    setName('');
    setCompany('');
    setEmail('');
  };

  const columns = [
    {
      header: 'Client Contact',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs text-surface-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    { header: 'Associated Company', accessor: 'company', cell: (row) => <span className="font-semibold">{row.company}</span> },
    { header: 'Account Tier', accessor: 'tier', cell: (row) => <Badge variant="info">{row.tier}</Badge> },
    { header: 'Approved Credit Limit', accessor: 'creditLimit' },
    { header: 'Total Orders Placed', accessor: 'totalOrders', cell: (row) => row.totalOrders.toLocaleString() },
    {
      header: 'Portal Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'warning'} dot>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Client Account Directory"
        description="Manage portal access for client companies, credit terms, and order approval settings"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Clients' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
            Provision Client Portal Account
          </Button>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={clients} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Client Portal Account"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddClient}>
              Create Client Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <FormField label="Contact Person Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam Wilson" required />
          </FormField>

          <FormField label="Company Name" required>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Corp" required />
          </FormField>

          <FormField label="Client Portal Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sam@acmecorp.com" required />
          </FormField>

          <FormField label="Account Tier" required>
            <Select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              options={[
                { value: 'Standard Client', label: 'Standard Client' },
                { value: 'Enterprise Tier 1', label: 'Enterprise Tier 1' },
                { value: 'Enterprise Tier 2', label: 'Enterprise Tier 2' },
                { value: 'VIP Preferred', label: 'VIP Preferred' },
              ]}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
