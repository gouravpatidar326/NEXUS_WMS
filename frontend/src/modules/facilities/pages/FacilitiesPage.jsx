import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import PhoneCountryInput from '@/components/forms/PhoneCountryInput';
import LocationAddressSection from '@/components/forms/LocationAddressSection';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { warehouseService } from '@/services/warehouseService';
import { userService } from '@/services/userService';
import { companyService } from '@/services/companyService';
import { Factory, Plus, Edit, Trash2 } from 'lucide-react';
import LoadingState from '@/components/feedback/LoadingState';
import DataScopeTabs from '@/components/navigation/DataScopeTabs';

const FacilitiesPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OWN');
  const [deleteState, setDeleteState] = useState({ isOpen: false, facility: null });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [facilityType, setFacilityType] = useState('General');
  const [capacityType, setCapacityType] = useState('Items');
  const [capacityValue, setCapacityValue] = useState('');
  const [supportedItems, setSupportedItems] = useState('');
  const [managerId, setManagerId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const [facData, compData] = await Promise.all([
        warehouseService.getWarehouses(),
        user.role === 'SUPER_ADMIN' ? companyService.getCompanies() : Promise.resolve(null)
      ]);
      setFacilities(facData || []);
      if (compData) setCompanies(compData || []);
      
      if (user.role !== 'SUPER_ADMIN') {
        const mgrData = await userService.getUsers('WAREHOUSE_MANAGER', user.companyId);
        setManagers(Array.isArray(mgrData) ? mgrData : mgrData?.data || []);
      }
    } catch (error) {
      notifyError('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const openModal = (facility = null) => {
    if (facility) {
      setEditingFacility(facility);
      setName(facility.name || '');
      setCode(facility.code || '');
      setFacilityType(facility.facilityType || 'General');
      setCapacityType(facility.capacityType || 'Items');
      setCapacityValue(facility.capacityValue !== undefined && facility.capacityValue !== null ? String(facility.capacityValue) : '');
      setSupportedItems(facility.supportedItems || '');
      setCompanyId(facility.companyId || '');
      setManagerId(facility.managerId || '');
      if (user.role === 'SUPER_ADMIN' && facility.companyId) {
        userService.getUsers('WAREHOUSE_MANAGER', facility.companyId).then(res => setManagers(Array.isArray(res) ? res : res?.data || []));
      }
      setContactPhone(facility.contactPhone || '');
      setAddress(facility.address || '');
      setCountry(facility.country || 'United States');
      setState(facility.state || '');
      setCity(facility.city || '');
      setZipCode(facility.zipCode || '');
    } else {
      setEditingFacility(null);
      setName('');
      setCode('');
      setFacilityType('General');
      setCapacityType('Items');
      setCapacityValue('');
      setSupportedItems('');
      setCompanyId('');
      setManagerId('');
      if (user.role === 'SUPER_ADMIN') setManagers([]);
      setContactPhone('');
      setAddress('');
      setCountry('United States');
      setState('');
      setCity('');
      setZipCode('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return notifyError('Facility Name is required');

    const payload = {
      name,
      code,
      facilityType,
      capacityType,
      capacityValue: capacityValue ? parseFloat(capacityValue) : null,
      supportedItems,
      managerId: user.role === 'SUPER_ADMIN' ? managerId : user.id,
      companyId: user.role === 'SUPER_ADMIN' ? companyId : user.companyId,
      contactPhone,
      address,
      country,
      city,
      state,
      zipCode
    };

    try {
      if (editingFacility) {
        await warehouseService.updateWarehouse(editingFacility.id, payload);
        notifySuccess('Facility updated successfully');
      } else {
        await warehouseService.createWarehouse(payload);
        notifySuccess('Facility created successfully');
      }
      setIsModalOpen(false);
      fetchFacilities();
    } catch (error) {
      notifyError(error.message || 'Failed to save facility');
    }
  };

  const handleDeleteClick = (facility) => {
    setDeleteState({ isOpen: true, facility });
  };

  const confirmDeleteFacility = async () => {
    if (!deleteState.facility) return;
    try {
      await warehouseService.deleteWarehouse(deleteState.facility.id);
      notifySuccess(`Facility "${deleteState.facility.name}" deleted successfully.`);
      setDeleteState({ isOpen: false, facility: null });
      fetchFacilities();
    } catch (error) {
      notifyError(error.message || 'Failed to delete facility');
    }
  };

  const columns = [
    {
      header: 'Facility Name & Code',
      accessor: 'name',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-800">{row.name}</div>
          {row.code && <div className="text-xs text-slate-500 font-mono mt-0.5">{row.code}</div>}
        </div>
      )
    },
    {
      header: 'Company',
      accessor: 'company',
      cell: (row) => <div className="text-sm font-medium text-slate-700">{row.company?.name || '-'}</div>
    },
    {
      header: 'Capacity & Utilization',
      accessor: 'capacity',
      cell: (row) => {
        const totalCap = row.capacityValue || row.totalCapacity || 0;
        const occupied = row.occupiedCapacity !== undefined ? row.occupiedCapacity : (row.occupiedCount !== undefined ? row.occupiedCount : 0);
        const percent = row.utilizationPercent !== undefined ? Math.min(100, Math.round(row.utilizationPercent)) : (totalCap > 0 ? Math.round((occupied / totalCap) * 100) : 0);
        let barColor = 'bg-emerald-500';
        if (percent > 90) barColor = 'bg-red-500';
        else if (percent > 75) barColor = 'bg-amber-500';

        return (
          <div className="w-full max-w-[200px]">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 font-mono">{occupied.toLocaleString()}/{totalCap.toLocaleString()} {row.capacityType || 'Items'}</span>
              <span className={percent > 90 ? 'text-red-600 font-bold' : percent > 75 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                ({percent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${percent}%` }}></div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Supported Items',
      accessor: 'supportedItems',
      cell: (row) => (
        <div className="text-sm text-slate-600 max-w-[200px] truncate" title={row.supportedItems}>
          {row.supportedItems || '-'}
        </div>
      )
    },
    {
      header: 'Location & Country',
      accessor: 'city',
      cell: (row) => (
        <div className="text-sm text-slate-600">
          {[row.city, row.state, row.country].filter(Boolean).join(', ') || '-'}
          {row.zipCode && <span className="text-xs text-slate-400 block font-mono">PIN/Zip: {row.zipCode}</span>}
        </div>
      )
    },
    {
      header: 'Manager',
      accessor: 'manager',
      cell: (row) => (
        <div>
          <div className="text-sm font-medium text-slate-800">{row.manager?.name || '-'}</div>
          {row.contactPhone && <div className="text-xs text-primary-600 font-mono mt-0.5">{row.contactPhone}</div>}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openModal(row)}>
            <Edit className="h-4 w-4 text-slate-500 hover:text-primary" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(row)}>
            <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  const filteredFacilities = facilities.filter(f => {
    if (activeTab === 'OWN') return f.companyId === user?.companyId;
    return f.companyId !== user?.companyId;
  });

  if (loading) return <LoadingState message="Loading Facilities..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <PageHeader
        title="Facilities & Warehouses"
        description="Manage your physical warehouse locations, capacities, and supported item types."
        breadcrumbs={[{ label: 'Operations' }, { label: 'Facilities' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => openModal()}>
            Add Facility
          </Button>
        }
      />

      <div className="flex justify-start">
        <DataScopeTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1">
        <DataTable columns={columns} data={filteredFacilities} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFacility ? "Edit Facility" : "Add New Facility"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 p-6 border-t bg-slate-50">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              type="submit" 
              form="facility-form" 
              variant="primary"
              disabled={user.role === 'SUPER_ADMIN' && companies.length === 0}
            >
              {editingFacility ? 'Update Facility' : 'Save Facility'}
            </Button>
          </div>
        }
      >
        <form id="facility-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Facility Name" required>
              <Input 
                value={name} 
                onChange={e => {
                  setName(e.target.value);
                  if (!editingFacility) {
                    const generatedCode = e.target.value.toUpperCase().replace(/\s+/g, '-').replace(/[^A-Z0-9-]/g, '').substring(0, 15);
                    setCode(generatedCode);
                  }
                }} 
                placeholder="Enter Facility Name" 
                required 
              />
            </FormField>
            <FormField label="Facility Code">
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="Auto-generated if empty" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Facility Type" required>
              <Select 
                value={facilityType} 
                onChange={e => setFacilityType(e.target.value)}
                options={[
                  {value: 'General', label: 'General Storage'},
                  {value: 'Cold Storage', label: 'Cold Storage'},
                  {value: 'Hazardous', label: 'Hazardous Materials'},
                  {value: 'Bonded', label: 'Customs Bonded'},
                  {value: 'Fulfillment Center', label: 'Fulfillment Center'}
                ]}
                required
              />
            </FormField>
            <div className="grid grid-cols-2 gap-2">
              <FormField label="Capacity Type" required>
                <Select 
                  value={capacityType} 
                  onChange={e => setCapacityType(e.target.value)}
                  options={[
                    {value: 'Items', label: 'Items'},
                    {value: 'Kg', label: 'Kg'},
                    {value: 'Cubic Meter', label: 'Cubic Meter'},
                    {value: 'Tonnes', label: 'Tonnes'}
                  ]}
                  required
                />
              </FormField>
              <FormField label="Capacity Value" required>
                <Input type="number" value={capacityValue} onChange={e => setCapacityValue(e.target.value)} placeholder="Value" required />
              </FormField>
            </div>
          </div>

          <FormField label="Supported Items (What is this built for?)" required>
            <Input value={supportedItems} onChange={e => setSupportedItems(e.target.value)} placeholder="e.g. Electronics, Mobile Phones, FMCG, Cold Storage Items" required />
          </FormField>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Company & Manager</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Company" required>
                {user.role === 'SUPER_ADMIN' ? (
                  companies.length === 0 ? (
                    <div>
                      <Select
                        value=""
                        disabled
                        options={[{ value: '', label: 'No companies available' }]}
                      />
                      <p className="text-xs text-red-500 mt-1">Please create a company first.</p>
                    </div>
                  ) : (
                    <Select
                      value={companyId}
                      onChange={e => {
                        setCompanyId(e.target.value);
                        setManagerId('');
                        if (e.target.value) {
                          userService.getUsers('WAREHOUSE_MANAGER', e.target.value).then(res => setManagers(Array.isArray(res) ? res : res?.data || []));
                        } else {
                          setManagers([]);
                        }
                      }}
                      options={[
                        { value: '', label: 'Select Company' },
                        ...companies.map(c => ({ value: c.id, label: c.name }))
                      ]}
                      required
                    />
                  )
                ) : (
                  <Input value={user.companyName || user.company?.name || 'N/A'} readOnly className="bg-slate-50 text-slate-500" />
                )}
              </FormField>
              <FormField label="Manager Name" required>
                {user.role === 'SUPER_ADMIN' ? (
                  <Select
                    value={managerId}
                    onChange={e => setManagerId(e.target.value)}
                    options={
                      managers.length > 0
                        ? [
                            { value: '', label: 'Select Manager' },
                            ...managers.map(m => ({ value: m.id, label: `${m.name} (${m.email})` }))
                          ]
                        : [{ value: '', label: 'No managers found' }]
                    }
                    required
                  />
                ) : (
                  <Input value={user.name} readOnly className="bg-slate-50 text-slate-500" />
                )}
              </FormField>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2 space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-1">Location & Contact Details</h4>

            {/* International Phone with Country Flag & Code */}
            <FormField label="Contact Phone Number" required>
              <PhoneCountryInput
                value={contactPhone}
                onChange={setContactPhone}
                selectedCountryName={country}
                onCountryChange={(newCountry) => {
                  setCountry(newCountry);
                }}
                placeholder="Enter Contact Number"
                required
              />
            </FormField>

            {/* Automated Cascading Country -> State -> City -> ZipCode Section */}
            <LocationAddressSection
              country={country}
              onCountryChange={(newCountry) => {
                setCountry(newCountry);
              }}
              state={state}
              onStateChange={setState}
              city={city}
              onCityChange={setCity}
              zipCode={zipCode}
              onZipCodeChange={setZipCode}
              address={address}
              onAddressChange={setAddress}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, facility: null })}
        onConfirm={confirmDeleteFacility}
        title="Delete Warehouse Facility"
        message={`Are you sure you want to delete facility "${deleteState.facility?.name}"? This will permanently remove the facility and its location data.`}
        confirmText="Yes, Delete Facility"
        variant="danger"
      />
    </section>
  );
};
export default FacilitiesPage;

