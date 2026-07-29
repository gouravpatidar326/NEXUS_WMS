import { useState, useEffect } from 'react';
import { Plus, QrCode, MapPin, CheckCircle, PackageCheck, AlertCircle, Edit2, Trash2 } from 'lucide-react';
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
import { locationService } from '@/services/locationService';
import { receivingService } from '@/services/receivingService';
import { productService } from '@/services/productService';

export const WarehouseOpsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'receiving'

  // Data states
  const [locations, setLocations] = useState([]);
  const [receivings, setReceivings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Storage Location Modal State
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [zone, setZone] = useState('A');
  const [aisle, setAisle] = useState('01');
  const [rack, setRack] = useState('1');
  const [shelf, setShelf] = useState('1');
  const [bin, setBin] = useState('A1');
  const [maxCapacity, setMaxCapacity] = useState('1000');

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
      const [locs, recs, prodsRes] = await Promise.all([
        locationService.getLocations(),
        receivingService.getReceivings(),
        productService.getProducts({ limit: 100 }),
      ]);
      setLocations(locs || []);
      setReceivings(recs || []);
      setProducts(prodsRes.items || []);
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

  // Location Handlers
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        zone,
        aisle,
        rack,
        shelf,
        bin,
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

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this storage location?')) return;
    try {
      await locationService.deleteLocation(id);
      notifySuccess('Storage location deleted.');
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
      header: '5-Tier Hierarchy',
      accessor: 'zone',
      cell: (row) => (
        <span className="font-mono text-xs">
          Zone {row.zone} &rarr; Aisle {row.aisle} &rarr; Rack {row.rack} &rarr; Shelf {row.shelf} &rarr; Bin {row.bin}
        </span>
      ),
    },
    {
      header: 'Occupied / Max Capacity',
      accessor: 'occupied',
      cell: (row) => (
        <div className="space-y-1 w-36">
          <div className="flex justify-between text-xs font-mono">
            <span>{row.occupied}/{row.maxCapacity}</span>
            <span>{Math.round(((row.occupied || 0) / (row.maxCapacity || 1)) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${row.occupied / row.maxCapacity > 0.9 ? 'bg-red-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(100, ((row.occupied || 0) / (row.maxCapacity || 1)) * 100)}%` }}
            />
          </div>
        </div>
      ),
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
          <button onClick={() => handleDeleteLocation(row.id)} className="p-1 text-slate-400 hover:text-red-600">
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

  if (loading) return <LoadingState message="Loading Storage Locations & Receiving Orders..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Warehouse Physical Operations"
        description="Receiving, Quality Inspection, Lot/Barcode Generation, and Storage Location Management"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Warehouse Ops' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={PackageCheck} onClick={() => setIsCreateRecModalOpen(true)}>
              New Inbound Receiving
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={() => setIsLocModalOpen(true)}>
              Provision Storage Bin
            </Button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'locations' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Storage Locations ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('receiving')}
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'receiving' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Inbound Receiving & Inspection ({receivings.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'locations' ? (
          <DataTable columns={locationColumns} data={locations} />
        ) : (
          <DataTable columns={receivingColumns} data={receivings} />
        )}
      </div>

      {/* Provision Storage Bin Location Modal */}
      <Modal
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        title="Provision 5-Tier Storage Bin Location"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsLocModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveLocation}>Save Storage Location</Button>
          </>
        }
      >
        <form onSubmit={handleSaveLocation} className="space-y-4">
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
          <FormField label="Max Capacity (Units)">
            <Input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} />
          </FormField>
        </form>
      </Modal>

      {/* Create Inbound Receiving Modal */}
      <Modal
        isOpen={isCreateRecModalOpen}
        onClose={() => setIsCreateRecModalOpen(false)}
        title="Create Inbound Receiving Order"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateRecModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateReceiving}>Create Receiving</Button>
          </>
        }
      >
        <form onSubmit={handleCreateReceiving} className="space-y-4">
          <FormField label="Supplier Name" required>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Apex Global Logistics" required />
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
    </section>
  );
};

export default WarehouseOpsPage;
