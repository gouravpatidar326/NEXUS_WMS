import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
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
import PhoneCountryInput from '@/components/forms/PhoneCountryInput';
import LocationAddressSection from '@/components/forms/LocationAddressSection';
import { clientService } from '@/services/clientService';
import { warehouseService } from '@/services/warehouseService';

export const ClientsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [clients, setClients] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCliState, setDeleteCliState] = useState({ isOpen: false, client: null });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Location Address State (Billing)
  const [country, setCountry] = useState('United States');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  // Location Address State (Shipping)
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [shipCountry, setShipCountry] = useState('United States');
  const [shipState, setShipState] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipZipCode, setShipZipCode] = useState('');
  const [shipStreetAddress, setShipStreetAddress] = useState('');

  const [gstNumber, setGstNumber] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState('ACTIVE');
  const [tier, setTier] = useState('STANDARD');
  const [creditLimit, setCreditLimit] = useState('100000');
  const [errors, setErrors] = useState({});

  const fetchClients = async () => {
    try {
      setLoading(true);
      const [data, whData] = await Promise.all([
        clientService.fetchClients(),
        warehouseService.getWarehouses().catch(() => [])
      ]);
      setClients(Array.isArray(data) ? data : []);
      setWarehouses(Array.isArray(whData) ? whData : []);
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
    setCountry('United States');
    setState('');
    setCity('');
    setZipCode('');
    setStreetAddress('');
    setShipCountry('United States');
    setShipState('');
    setShipCity('');
    setShipZipCode('');
    setShipStreetAddress('');
    setSameAsBilling(true);
    setGstNumber('');
    setWarehouseId('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
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
    
    // Parse address string if available
    setStreetAddress(cli.address || '');
    setCountry('United States');
    setState('');
    setCity('');
    setZipCode('');
    
    setShipStreetAddress(cli.shippingAddress || '');
    setSameAsBilling(!cli.shippingAddress || cli.address === cli.shippingAddress);
    setGstNumber(cli.gstNumber || '');
    setWarehouseId(cli.warehouseId || '');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
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
    if (!streetAddress && !city) newErrors.address = 'Billing address is required';
    if (!status) newErrors.status = 'Status is required';
    if (!editingClient) {
      if (!password) newErrors.password = 'Initial password is required';
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        notifyError('Passwords do not match');
        return;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notifyError('Please fill in all required fields highlighted in red.');
      return;
    }

    setErrors({});

    // Construct full address string with city, state, country, zip
    const formattedBillingAddr = [streetAddress, city, state, country, zipCode ? `PIN: ${zipCode}` : ''].filter(Boolean).join(', ');
    const formattedShippingAddr = sameAsBilling
      ? formattedBillingAddr
      : [shipStreetAddress, shipCity, shipState, shipCountry, shipZipCode ? `PIN: ${shipZipCode}` : ''].filter(Boolean).join(', ');

    try {
      const payload = {
        name,
        email,
        phone,
        address: formattedBillingAddr,
        shippingAddress: formattedShippingAddr,
        gstNumber,
        warehouseId,
        status,
        tier,
        creditLimit: parseFloat(creditLimit || '0'),
      };

      if (!editingClient && password) {
        payload.password = password;
      }

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
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveClient}>
              {editingClient ? 'Save Changes' : 'Provision Client Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-5">
          {/* Section: Basic Profile Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Client Contact Name" required error={errors.name}>
              <Input value={name} onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}); }} placeholder="e.g. Sam Wilson" error={errors.name} />
            </FormField>
            <FormField label="Email Address" required error={errors.email}>
              <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }} placeholder="sam@acmecorp.com" error={errors.email} />
            </FormField>
          </div>

          {/* Section: Password Fields with Eye Icon Toggle */}
          {!editingClient && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-xl border border-surface-200 dark:border-surface-700">
              <FormField label="Initial Password" required error={errors.password}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }}
                  placeholder="client123"
                  error={errors.password}
                  rightIcon={showPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                />
              </FormField>
              <FormField label="Confirm Password" required error={errors.confirmPassword}>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ''}); }}
                  placeholder="client123"
                  error={errors.confirmPassword}
                  rightIcon={showConfirmPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </FormField>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone with Country Dial Code & Flag Dropdown */}
            <FormField label="Phone Number" required error={errors.phone}>
              <PhoneCountryInput
                value={phone}
                onChange={(val) => { setPhone(val); setErrors({...errors, phone: ''}); }}
                placeholder="Enter phone number"
                required
              />
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

          {/* Section: Automated Billing Location Selector */}
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase">
              Billing Address Information
            </h4>
            <LocationAddressSection
              country={country}
              onCountryChange={setCountry}
              state={state}
              onStateChange={setState}
              city={city}
              onCityChange={setCity}
              zipCode={zipCode}
              onZipCodeChange={setZipCode}
              address={streetAddress}
              onAddressChange={setStreetAddress}
              required
            />
          </div>

          {/* Shipping Address Same Checkbox & Custom Location */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sameAsBilling"
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <label htmlFor="sameAsBilling" className="text-xs font-semibold text-surface-700 dark:text-surface-300 cursor-pointer">
                Shipping Address is same as Billing Address
              </label>
            </div>

            {!sameAsBilling && (
              <div className="border border-dashed border-surface-300 dark:border-surface-700 p-4 rounded-xl space-y-3 bg-surface-50/50 dark:bg-surface-800/40">
                <h4 className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase">
                  Shipping Delivery Address
                </h4>
                <LocationAddressSection
                  country={shipCountry}
                  onCountryChange={setShipCountry}
                  state={shipState}
                  onStateChange={setShipState}
                  city={shipCity}
                  onCityChange={setShipCity}
                  zipCode={shipZipCode}
                  onZipCodeChange={setShipZipCode}
                  address={shipStreetAddress}
                  onAddressChange={setShipStreetAddress}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-200 dark:border-surface-700 pt-4">
            <FormField label="GST Number / Tax ID">
              <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="e.g. 27AADCB2230M1Z2" />
            </FormField>
            {warehouses.length > 0 && (
              <FormField label="Assigned Warehouse (Optional)">
                <Select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  options={[{value: '', label: 'All Warehouses'}, ...warehouses.map((w) => ({ value: w.id, label: w.name }))]}
                />
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
