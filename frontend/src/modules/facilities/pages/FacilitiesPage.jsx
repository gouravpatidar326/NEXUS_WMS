import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { warehouseService } from '@/services/warehouseService';
import { userService } from '@/services/userService';
import { companyService } from '@/services/companyService';
import { Factory, Plus, Edit, Trash2 } from 'lucide-react';
import LoadingState from '@/components/feedback/LoadingState';

const FacilitiesPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [managers, setManagers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setLoading(true);
      const [facData, compData] = await Promise.all([
        warehouseService.getWarehouses(),
        user.role === 'SUPER_ADMIN' ? companyService.getCompanies() : Promise.resolve(null)
      ]);
      setFacilities(facData || []);
      if (compData) setCompanies(compData || []);
      
      if (user.role !== 'SUPER_ADMIN') {
        const mgrData = await userService.getUsers('WAREHOUSE_MANAGER', user.companyId);
        setManagers(mgrData?.data || []);
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
        userService.getUsers('WAREHOUSE_MANAGER', facility.companyId).then(res => setManagers(res?.data || []));
      }
      setContactPhone(facility.contactPhone || '');
      setAddress(facility.address || '');
      setCity(facility.city || '');
      setState(facility.state || '');
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
      setCity('');
      setState('');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      await warehouseService.deleteWarehouse(id);
      notifySuccess('Facility deleted');
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
        if (row.utilizationPercent === undefined) {
           return <div className="text-xs text-slate-500">{row.capacityValue ? `${row.capacityValue} ${row.capacityType || 'Items'}` : 'N/A'}</div>;
        }
        
        const isDanger = row.utilizationPercent > 80;
        const isWarning = row.utilizationPercent > 50 && row.utilizationPercent <= 80;
        const colorClass = isDanger ? 'bg-red-500' : (isWarning ? 'bg-yellow-500' : 'bg-green-500');
        
        return (
          <div className="flex flex-col gap-1 w-full min-w-[120px] max-w-[180px]">
             <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-700">{row.occupiedCapacity || 0}/{row.totalCapacity || 0} {row.capacityType || 'Items'}</span>
                <span className={isDanger ? 'text-red-600' : (isWarning ? 'text-yellow-600' : 'text-green-600')}>
                  ({row.utilizationPercent}%)
                </span>
             </div>
             <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${colorClass}`} style={{ width: `${row.utilizationPercent}%` }}></div>
             </div>
          </div>
        )
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
      header: 'Location',
      accessor: 'city',
      cell: (row) => (
        <div className="text-sm text-slate-600">
          {[row.city, row.state].filter(Boolean).join(', ') || '-'}
        </div>
      )
    },
    {
      header: 'Manager',
      accessor: 'manager',
      cell: (row) => (
        <div>
          <div className="text-sm">{row.manager?.name || '-'}</div>
          {row.contactPhone && <div className="text-xs text-slate-500">{row.contactPhone}</div>}
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
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) return <LoadingState message="Loading Facilities..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
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

      <div className="flex-1">
        <DataTable columns={columns} data={facilities} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFacility ? "Edit Facility" : "Add New Facility"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="facility-form" variant="primary">Save Facility</Button>
          </>
        }
      >
        <form id="facility-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Facility Name" required>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter Facility Name" required />
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
                  <Select
                    value={companyId}
                    onChange={e => {
                      setCompanyId(e.target.value);
                      setManagerId('');
                      if (e.target.value) {
                        userService.getUsers('WAREHOUSE_MANAGER', e.target.value).then(res => setManagers(res?.data || []));
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

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Location & Contact</h4>
            <div className="mb-4">
              <FormField label="Contact Phone" required>
                <Input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Enter Contact Number" required />
              </FormField>
            </div>
            <FormField label="Street Address" required>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter Street Address" required />
            </FormField>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <FormField label="City" required>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter City" required />
              </FormField>
              <FormField label="State" required>
                <Input value={state} onChange={e => setState(e.target.value)} placeholder="Enter State" required />
              </FormField>
              <FormField label="Zip / PIN Code" required>
                <Input value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="Enter Zip / PIN Code" required />
              </FormField>
            </div>
          </div>
        </form>
      </Modal>
    </section>
  );
};
export default FacilitiesPage;
