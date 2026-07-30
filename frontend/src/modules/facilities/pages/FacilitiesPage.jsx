import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useNotification } from '@/contexts/NotificationContext';
import { warehouseService } from '@/services/warehouseService';
import { Factory, Plus, Edit, Trash2 } from 'lucide-react';
import LoadingState from '@/components/feedback/LoadingState';

const FacilitiesPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [facilities, setFacilities] = useState([]);
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
  const [managerName, setManagerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getWarehouses();
      setFacilities(data || []);
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
      setManagerName(facility.managerName || '');
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
      setManagerName('');
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
      managerName,
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
      header: 'Type & Capacity',
      accessor: 'facilityType',
      cell: (row) => (
        <div>
          <div className="text-sm font-medium">{row.facilityType || 'General'}</div>
          {row.capacityValue && <div className="text-xs text-slate-500 mt-0.5">{row.capacityValue} {row.capacityType}</div>}
        </div>
      )
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
      accessor: 'managerName',
      cell: (row) => (
        <div>
          <div className="text-sm">{row.managerName || '-'}</div>
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
            <FormField label="Facility Code" required>
              <Input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter Facility Code" required />
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
                      {value: 'Pallets', label: 'Pallets'},
                      {value: 'CBM', label: 'CBM (Cubic Meter)'}
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
            <Input value={supportedItems} onChange={e => setSupportedItems(e.target.value)} placeholder="Enter Supported Items" required />
          </FormField>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Location & Contact</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField label="Manager Name" required>
                <Input value={managerName} onChange={e => setManagerName(e.target.value)} placeholder="Enter Manager Name" required />
              </FormField>
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
