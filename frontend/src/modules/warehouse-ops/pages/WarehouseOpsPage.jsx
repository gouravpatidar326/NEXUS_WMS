import { useState, useEffect } from 'react';
import { Plus, QrCode, MapPin, CheckCircle, PackageCheck, AlertCircle, Edit2, Trash2 } from 'lucide-react';
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
import { locationService } from '@/services/locationService';
import { receivingService } from '@/services/receivingService';
import { productService } from '@/services/productService';
import { warehouseService } from '@/services/warehouseService';

export const WarehouseOpsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'receiving'

  // Data states
  const [locations, setLocations] = useState([]);
  const [receivings, setReceivings] = useState([]);
  const [products, setProducts] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [activeFacility, setActiveFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  // Storage Location Modal State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [warehouse, setWarehouse] = useState('');
  const [zone, setZone] = useState('');
  const [aisle, setAisle] = useState('');
  const [rack, setRack] = useState('');
  const [shelf, setShelf] = useState('');
  const [bin, setBin] = useState('');
  const [capacityType, setCapacityType] = useState('Items');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [deleteLocState, setDeleteLocState] = useState({ isOpen: false, locationId: null, locationCode: '' });

  // Receiving Modals State
  const [isCreateRecModalOpen, setIsCreateRecModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isPutawayModalOpen, setIsPutawayModalOpen] = useState(false);
  const [selectedReceiving, setSelectedReceiving] = useState(null);

  // Receiving Create Form State
  const [supplier, setSupplier] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [recProductId, setRecProductId] = useState('');
  const [expectedQty, setExpectedQty] = useState('100');

  // Inspection Form State
  const [acceptedQty, setAcceptedQty] = useState('100');
  const [rejectedQty, setRejectedQty] = useState('0');
  const [rejectionReason, setRejectionReason] = useState('');

  // Putaway Form State
  const [putawayLocId, setPutawayLocId] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [locs, recs, prodsRes, facs] = await Promise.all([
        locationService.getLocations(),
        receivingService.getReceivings(),
        productService.getProducts({ limit: 100 }),
        warehouseService.getWarehouses(),
      ]);
      setLocations(locs || []);
      setReceivings(recs || []);
      setProducts(prodsRes.items || []);
      setFacilities(facs || []);
      if (facs && facs.length > 0) setActiveFacility(facs[0]);
      
      if (locs && locs.length > 0) setPutawayLocId(locs[0].id);
      if (prodsRes.items && prodsRes.items.length > 0) setRecProductId(prodsRes.items[0].id);
    } catch {
      notifyError('Failed to fetch warehouse operational data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenLocModal = () => {
    setEditingLocation(null);
    setWarehouse(activeFacility ? activeFacility.name : '');
    setZone('');
    setAisle('');
    setRack('');
    setShelf('');
    setBin('');
    setCapacityType('Items');
    setMaxCapacity('');
    setIsLocModalOpen(true);
  };

  // Location Handlers
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    
    // Front-end capacity limit check if facility limit is set (> 0)
    if (activeFacility?.capacityValue && activeFacility.capacityValue > 0) {
      const newBinCap = parseInt(maxCapacity, 10) || 0;
      const otherBinsProvisioned = editingLocation 
        ? provisionedCapacity - (editingLocation.maxCapacity || 0)
        : provisionedCapacity;
      
      if (otherBinsProvisioned + newBinCap > activeFacility.capacityValue) {
        const avail = Math.max(0, activeFacility.capacityValue - otherBinsProvisioned);
        notifyError(`Warehouse capacity limit reached! Facility Total: ${activeFacility.capacityValue} ${activeFacility.capacityType || 'Items'}. Already Provisioned: ${otherBinsProvisioned} ${activeFacility.capacityType || 'Items'}. Available to provision: ${avail} ${activeFacility.capacityType || 'Items'}.`);
        return;
      }
    }

    try {
      const payload = {
        warehouse,
        zone,
        aisle,
        rack,
        shelf,
        bin,
        capacityType,
        maxCapacity: parseInt(maxCapacity, 10),
      };

      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, payload);
        notifySuccess('Storage location updated successfully.');
      } else {
        await locationService.createLocation(payload);
        notifySuccess('New Storage Bin Location provisioned.');
      }
      setIsLocModalOpen(false);
      fetchAllData();
    } catch (err) {
      notifyError(err.message || 'Failed to save storage location');
    }
  };

  const handleDeleteLocation = (row) => {
    setDeleteLocState({ isOpen: true, locationId: row.id, locationCode: row.code || `Bin ${row.bin}` });
  };

  const confirmDeleteLocation = async () => {
    if (!deleteLocState.locationId) return;
    try {
      await locationService.deleteLocation(deleteLocState.locationId);
      notifySuccess('Storage location deleted.');
      setDeleteLocState({ isOpen: false, locationId: null, locationCode: '' });
      fetchAllData();
    } catch (err) {
      notifyError(err.message || 'Failed to delete location');
    }
  };

  // Receiving Handlers
  const handleCreateReceiving = async (e) => {
    e.preventDefault();
    if (!supplier || !recProductId || !expectedQty) {
      notifyError('Supplier, Product, and Expected Quantity are required');
      return;
    }

    try {
      await receivingService.createReceiving({
        supplier,
        poNumber,
        warehouse: activeFacility?.name || '',
        items: [
          {
            productId: recProductId,
            expectedQty: parseInt(expectedQty, 10),
          },
        ],
      });
      notifySuccess('Inbound receiving shipment created successfully.');
      setIsCreateRecModalOpen(false);
      setSupplier('');
      setPoNumber('');
      fetchAllData();
    } catch (err) {
      notifyError(err.message || 'Failed to create receiving order');
    }
  };

  const openInspectModal = (rec) => {
    setSelectedReceiving(rec);
    const firstItem = rec.items && rec.items[0];
    setAcceptedQty(String(firstItem?.expectedQty || 0));
    setRejectedQty('0');
    setRejectionReason('');
    setIsInspectModalOpen(true);
  };

  const handleProcessInspection = async (e) => {
    e.preventDefault();
    if (!selectedReceiving || !selectedReceiving.items || !selectedReceiving.items[0]) return;
    const firstItem = selectedReceiving.items[0];

    const acc = parseInt(acceptedQty, 10);
    const rej = parseInt(rejectedQty, 10);

    if (isNaN(acc) || isNaN(rej) || acc < 0 || rej < 0) {
      notifyError('Accepted and Rejected quantities must be valid non-negative numbers');
      return;
    }

    try {
      await receivingService.processInspection(selectedReceiving.id, {
        items: [
          {
            receivingItemId: firstItem.id,
            receivedQty: acc + rej,
            acceptedQty: acc,
            rejectedQty: rej,
            rejectionReason,
          },
        ],
      });
      notifySuccess('Quality Inspection completed.');
      setIsInspectModalOpen(false);
      fetchAllData();
    } catch (err) {
      notifyError(err.message || 'Failed to process quality inspection');
    }
  };

  const openPutawayModal = (rec) => {
    setSelectedReceiving(rec);
    setIsPutawayModalOpen(true);
  };

  const handleCompletePutaway = async (e) => {
    e.preventDefault();
    if (!selectedReceiving || !putawayLocId) {
      notifyError('Storage bin location is required for putaway');
      return;
    }

    const firstItem = selectedReceiving.items && selectedReceiving.items[0];

    try {
      await receivingService.completePutaway(selectedReceiving.id, {
        putaway: [
          {
            receivingItemId: firstItem.id,
            acceptedQty: firstItem.acceptedQty || firstItem.expectedQty,
            locationId: putawayLocId,
            mfgDate,
            expiryDate,
          },
        ],
      });
      notifySuccess('Receiving completed! Lot & Barcode generated atomically, stock putaway to bin.');
      setIsPutawayModalOpen(false);
      fetchAllData();
    } catch (err) {
      notifyError(err.message || 'Failed to complete putaway');
    }
  };

  // Columns - Locations Table
  const locationColumns = [
    {
      header: 'Location Code & Barcode',
      accessor: 'code',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
          <QrCode className="h-3.5 w-3.5" />
          {row.code || `LOC-${row.id.substring(0, 6)}`}
        </span>
      ),
    },
    {
      header: '6-Tier Hierarchy',
      accessor: 'zone',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 items-center font-mono text-[11px]">
          <span className="bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium">{row.warehouse || 'Main'}</span>
          <span className="text-slate-400 text-[10px]">&rsaquo;</span>
          <span className="bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">Z-{row.zone}</span>
          <span className="text-slate-400 text-[10px]">&rsaquo;</span>
          <span className="bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">A-{row.aisle}</span>
          <span className="text-slate-400 text-[10px]">&rsaquo;</span>
          <span className="bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">R-{row.rack}</span>
          <span className="text-slate-400 text-[10px]">&rsaquo;</span>
          <span className="bg-slate-100 dark:bg-surface-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">S-{row.shelf}</span>
          <span className="text-slate-400 text-[10px]">&rsaquo;</span>
          <span className="bg-primary-50 text-primary-700 dark:bg-primary-950/50 px-1.5 py-0.5 rounded font-bold border border-primary-200">Bin {row.bin}</span>
        </div>
      ),
    },
    {
      header: 'Occupied / Max Capacity',
      accessor: 'occupied',
      cell: (row) => {
        const occupied = row.occupied || 0;
        const maxCap = row.maxCapacity || 1;
        const pct = Math.min(100, Math.round((occupied / maxCap) * 100));
        let barColor = 'bg-primary-600';
        let textColor = 'text-primary-700';
        if (pct > 80) { barColor = 'bg-red-500'; textColor = 'text-red-600'; }
        else if (pct > 50) { barColor = 'bg-amber-500'; textColor = 'text-amber-600'; }

        return (
          <div className="w-full max-w-[200px] space-y-1">
            <div className="flex justify-between items-center text-xs font-mono font-semibold">
              <span className={textColor}>{pct}%</span>
              <span className="text-slate-600 font-bold">{occupied.toLocaleString()}/{maxCap.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-surface-800 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }}></div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge variant="success" dot>{row.status || 'Active'}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => handleDeleteLocation(row)} className="p-1 text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Columns - Receiving Table
  const receivingColumns = [
    {
      header: 'Receiving Number',
      accessor: 'receivingNumber',
      cell: (row) => (
        <div>
          <div className="font-mono font-bold text-primary">{row.receivingNumber}</div>
          <div className="text-[11px] text-slate-500">PO: {row.poNumber || 'N/A'}</div>
        </div>
      ),
    },
    { header: 'Supplier', accessor: 'supplier' },
    {
      header: 'Product & Qty',
      accessor: 'items',
      cell: (row) => {
        const item = row.items && row.items[0];
        return (
          <div>
            <div className="font-semibold">{item?.product?.name || 'Inbound Goods'}</div>
            <div className="text-[11px] text-slate-500">Expected: {item?.expectedQty || 0} | Accepted: {item?.acceptedQty || 0}</div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'COMPLETED' ? 'success' : row.status === 'IN_INSPECTION' ? 'warning' : 'info'} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions Flow',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <Button size="sm" variant="warning" onClick={() => openInspectModal(row)}>
              Quality Inspection
            </Button>
          )}
          {row.status === 'IN_INSPECTION' && (
            <Button size="sm" variant="primary" onClick={() => openPutawayModal(row)}>
              Storage Bin Putaway
            </Button>
          )}
          {row.status === 'COMPLETED' && (
            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Putaway Done
            </span>
          )}
        </div>
      ),
    },
  ];

  const filteredLocations = activeFacility 
    ? locations.filter(loc => loc.warehouse === activeFacility.name) 
    : locations;

  const totalFacilityCapacity = activeFacility?.capacityValue || 0;
  const facilityUnit = activeFacility?.capacityType || 'Items';
  const provisionedCapacity = filteredLocations.reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0);
  const occupiedCapacity = filteredLocations.reduce((sum, loc) => sum + (loc.occupied || 0), 0);
  const freeCapacity = totalFacilityCapacity - occupiedCapacity;
  const fillPercentage = totalFacilityCapacity > 0 ? Math.min(100, Math.round((occupiedCapacity / totalFacilityCapacity) * 100)) : 0;

  const filteredReceivings = activeFacility 
    ? receivings.filter(rec => rec.warehouse === activeFacility.name || !rec.warehouse)
    : receivings;

  if (loading) return <LoadingState message="Loading Storage Locations & Receiving Orders..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Warehouse Physical Operations"
        description="Receiving, Quality Inspection, Lot/Barcode Generation, and Storage Location Management"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Warehouse Ops' }]}
        actions={
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
            {facilities.length > 0 && (
              <Select 
                value={activeFacility?.name || ''} 
                onChange={(e) => {
                  const fac = facilities.find(f => f.name === e.target.value);
                  if (fac) setActiveFacility(fac);
                }}
                options={facilities.map(f => ({ value: f.name, label: f.name }))} 
                className="w-full sm:w-48 bg-white"
              />
            )}
            <Button variant="outline" leftIcon={PackageCheck} onClick={() => setIsCreateRecModalOpen(true)}>
              New Inbound Receiving
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={handleOpenLocModal} disabled={!activeFacility}>
              Provision Storage Bin
            </Button>
          </div>
        }
      />

      {activeFacility && (
        <div className="bg-white dark:bg-surface-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-col min-w-[160px]">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Facility Overview</span>
            <span className="text-lg font-bold text-slate-800 dark:text-white">{activeFacility.name} <span className="text-xs font-normal text-slate-500">({activeFacility.facilityType || 'General'})</span></span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Total Capacity</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{totalFacilityCapacity.toLocaleString()} {facilityUnit}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Provisioned Space</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{provisionedCapacity.toLocaleString()} {facilityUnit}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Material Occupied</span>
              <span className="font-bold text-blue-600">{occupiedCapacity.toLocaleString()} {facilityUnit}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Free Space</span>
              <span className="font-bold text-green-600">{Math.max(0, freeCapacity).toLocaleString()} {facilityUnit}</span>
            </div>
          </div>
          <div className="w-full sm:w-36 flex flex-col gap-1 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-4">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">Utilization</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{fillPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${fillPercentage > 90 ? 'bg-red-500' : fillPercentage > 75 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${fillPercentage}%` }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-surface-800 gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-3 py-2 font-bold text-xs sm:text-sm border-b-2 transition-colors shrink-0 ${
            activeTab === 'locations' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Storage Locations ({filteredLocations.length})
        </button>
        <button
          onClick={() => setActiveTab('receiving')}
          className={`px-3 py-2 font-bold text-xs sm:text-sm border-b-2 transition-colors shrink-0 ${
            activeTab === 'receiving' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Inbound Receiving & Inspection ({receivings.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'locations' ? (
          <DataTable columns={locationColumns} data={filteredLocations} />
        ) : (
          <DataTable columns={receivingColumns} data={filteredReceivings} />
        )}
      </div>

      {/* Provision Storage Bin Location Modal */}
      <Modal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title={editingLocation ? "Edit Storage Location" : `Provision Bin in ${activeFacility?.name || 'Facility'}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLocModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLocation}>Save Location</Button>
          </>
        }
      >
        <form onSubmit={handleSaveLocation} className="space-y-4">
          {activeFacility?.capacityValue && activeFacility.capacityValue > 0 ? (
            (() => {
              const otherBinsProvisioned = editingLocation 
                ? provisionedCapacity - (editingLocation.maxCapacity || 0)
                : provisionedCapacity;
              const avail = Math.max(0, activeFacility.capacityValue - otherBinsProvisioned);
              
              if (avail <= 0) {
                return (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-2.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900">Facility Provisioning Capacity Reached</p>
                      <p className="mt-0.5">
                        Total Capacity: <strong>{activeFacility.capacityValue} {activeFacility.capacityType || 'Items'}</strong> | Provisioned: <strong>{otherBinsProvisioned} {activeFacility.capacityType || 'Items'}</strong> | Available: <strong className="text-red-600">0 {activeFacility.capacityType || 'Items'}</strong>
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg text-xs flex justify-between items-center">
                  <span>Facility Total: <strong>{activeFacility.capacityValue} {activeFacility.capacityType || 'Items'}</strong> (Provisioned: {otherBinsProvisioned})</span>
                  <span>Available to Provision: <strong className="text-green-700">{avail} {activeFacility.capacityType || 'Items'}</strong></span>
                </div>
              );
            })()
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs flex justify-between items-center">
              <span>Facility Capacity Limit: <strong>Unlimited</strong> (No max limit set for {activeFacility?.name || 'facility'})</span>
            </div>
          )}

          <FormField label="Warehouse Facility" required>
            <Input value={warehouse} readOnly className="bg-slate-50 text-slate-500" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Zone" required>
              <Input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="A" required />
            </FormField>
            <FormField label="Aisle" required>
              <Input value={aisle} onChange={(e) => setAisle(e.target.value)} placeholder="01" required />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Rack" required>
              <Input value={rack} onChange={(e) => setRack(e.target.value)} placeholder="1" required />
            </FormField>
            <FormField label="Shelf" required>
              <Input value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="1" required />
            </FormField>
            <FormField label="Bin" required>
              <Input value={bin} onChange={(e) => setBin(e.target.value)} placeholder="A1" required />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Capacity Unit" required>
              <Input 
                value={activeFacility?.capacityType || 'Items'} 
                readOnly 
                className="bg-slate-50 text-slate-500" 
              />
            </FormField>
            <FormField label="Capacity Value" required>
              <Input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} placeholder="e.g. 1000" required />
            </FormField>
          </div>
        </form>
      </Modal>

      {/* Create Inbound Receiving Modal */}
      <Modal
        isOpen={isCreateRecModalOpen}
        onClose={() => setIsCreateRecModalOpen(false)}
        title={`New Inbound Receiving for ${activeFacility?.name || 'Facility'}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateRecModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateReceiving}>Create Receiving</Button>
          </>
        }
      >
        <form onSubmit={handleCreateReceiving} className="space-y-4">
          <FormField label="Warehouse Facility">
            <Input value={activeFacility?.name || ''} readOnly className="bg-slate-50 text-slate-500" />
          </FormField>
          <FormField label="Supplier" required>
            <Input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier Name" required />
          </FormField>
          <FormField label="PO Reference Number">
            <Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="PO-2026-881" />
          </FormField>
          <FormField label="Inbound Product" required>
            <Select
              value={recProductId}
              onChange={(e) => setRecProductId(e.target.value)}
              options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
            />
          </FormField>
          <FormField label="Expected Quantity" required>
            <Input type="number" value={expectedQty} onChange={(e) => setExpectedQty(e.target.value)} required />
          </FormField>
        </form>
      </Modal>

      {/* Process Quality Inspection Modal */}
      <Modal
        isOpen={isInspectModalOpen}
        onClose={() => setIsInspectModalOpen(false)}
        title={`Quality Inspection - ${selectedReceiving?.receivingNumber}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsInspectModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleProcessInspection}>Submit Inspection Results</Button>
          </>
        }
      >
        <form onSubmit={handleProcessInspection} className="space-y-4">
          <p className="text-xs text-slate-500 font-semibold">
            Inbound Product: <strong className="text-slate-800">{selectedReceiving?.items?.[0]?.product?.name}</strong> (Expected: {selectedReceiving?.items?.[0]?.expectedQty} Units)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Accepted Quantity" required>
              <Input type="number" value={acceptedQty} onChange={(e) => setAcceptedQty(e.target.value)} required />
            </FormField>
            <FormField label="Rejected Quantity">
              <Input type="number" value={rejectedQty} onChange={(e) => setRejectedQty(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Rejection Reason (if any)">
            <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Packaging damaged / seal broken" />
          </FormField>
        </form>
      </Modal>

      {/* Storage Bin Putaway Modal */}
      <Modal
        isOpen={isPutawayModalOpen}
        onClose={() => setIsPutawayModalOpen(false)}
        title={`Assign Storage Location Putaway - ${selectedReceiving?.receivingNumber}`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPutawayModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCompletePutaway}>Complete Putaway & Generate Lot/Barcode</Button>
          </>
        }
      >
        <form onSubmit={handleCompletePutaway} className="space-y-4">
          <p className="text-xs text-slate-500 font-semibold">
            Accepted Qty to Putaway: <strong className="text-slate-800">{selectedReceiving?.items?.[0]?.acceptedQty || selectedReceiving?.items?.[0]?.expectedQty} Units</strong>
          </p>
          <FormField label="Target Storage Bin Location" required>
            <Select
              value={putawayLocId}
              onChange={(e) => setPutawayLocId(e.target.value)}
              options={locations.map((l) => ({ value: l.id, label: `Zone ${l.zone} - Aisle ${l.aisle} - Bin ${l.bin} (${l.code})` }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="MFG Date">
              <Input type="date" value={mfgDate} onChange={(e) => setMfgDate(e.target.value)} />
            </FormField>
            <FormField label="Expiry Date">
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </FormField>
          </div>
        </form>
      </Modal>
      {/* Delete Location Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteLocState.isOpen}
        onClose={() => setDeleteLocState({ isOpen: false, locationId: null, locationCode: '' })}
        onConfirm={confirmDeleteLocation}
        title="Delete Storage Location"
        message={`Are you sure you want to delete storage bin location "${deleteLocState.locationCode}"? This operation will remove the location bin record.`}
        confirmText="Yes, Delete Location"
        variant="danger"
      />
    </section>
  );
};

export default WarehouseOpsPage;
