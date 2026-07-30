import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Layers, ArrowUpDown } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { productService } from '@/services/productService';
import { locationService } from '@/services/locationService';
import { batchService } from '@/services/batchService';
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

const normalizeArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  return [];
};

export const InventoryListPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [activeTab, setActiveTab] = useState('bins'); // 'bins' | 'ledger'

  // Data states
  const [bins, setBins] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Form state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productId, setProductId] = useState('');
  const [lotId, setLotId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantityDelta, setQuantityDelta] = useState('');
  const [reasonCode, setReasonCode] = useState('AUDIT_CORRECTION');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [binRes, txRes, prodRes, locRes, batchRes] = await Promise.all([
        inventoryService.getBinInventory(),
        inventoryService.getMovements({ limit: 100 }),
        productService.getProducts({ limit: 100 }),
        locationService.getLocations(),
        batchService.getBatches(),
      ]);

      const binList = normalizeArray(binRes);
      const txList = normalizeArray(txRes);
      const prodList = normalizeArray(prodRes);
      const locList = normalizeArray(locRes);
      const batchList = normalizeArray(batchRes);

      setBins(binList);
      setTransactions(txList);
      setProducts(prodList);
      setLocations(locList);
      setBatches(batchList);

      if (prodList.length > 0 && !productId) setProductId(prodList[0].id);
      if (batchList.length > 0 && !lotId) setLotId(batchList[0].id);
      if (locList.length > 0 && !locationId) setLocationId(locList[0].id);
    } catch (err) {
      console.error('Inventory fetch error:', err);
      notifyError('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdjustModal = () => {
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !lotId || !locationId || !quantityDelta) {
      notifyError('Product, Lot, Location, and Quantity Delta are required');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.adjustStock({
        productId,
        lotId,
        locationId,
        quantityDelta: parseInt(quantityDelta, 10),
        reasonCode,
        notes,
      });
      notifySuccess(`Audited stock adjustment of ${quantityDelta > 0 ? '+' : ''}${quantityDelta} units applied.`);
      setIsAdjustModalOpen(false);
      setQuantityDelta('');
      setNotes('');
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Stock adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Bin Inventory Columns
  const binColumns = [
    {
      header: 'Storage Bin Location',
      accessor: 'location',
      cell: (row) => (
        <div>
          <span className="font-semibold text-primary block">
            {row.location?.code || `Bin ${row.location?.bin || row.locationId}`}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Zone {row.location?.zone || 'A'} &rarr; Aisle {row.location?.aisle || '01'} &rarr; Bin {row.location?.bin || 'A1'}
          </span>
        </div>
      ),
    },
    {
      header: 'Product & SKU',
      accessor: 'product',
      cell: (row) => (
        <div>
          <span className="font-semibold text-on-surface block">{row.product?.name || 'N/A'}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.product?.sku || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Lot / Batch Number',
      accessor: 'batch',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.batch?.lotNumber || row.batch?.lotId || row.lotId}
        </span>
      ),
    },
    {
      header: 'Bin Stock Quantity',
      accessor: 'quantity',
      cell: (row) => <span className="font-bold text-base text-primary">{row.quantity} Units</span>,
    },
    {
      header: 'Last Updated',
      accessor: 'updatedAt',
      cell: (row) => (row.updatedAt ? new Date(row.updatedAt).toLocaleString() : 'N/A'),
    },
  ];

  // Transaction Ledger Columns
  const txColumns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      cell: (row) => (row.timestamp ? new Date(row.timestamp).toLocaleString() : 'N/A'),
    },
    {
      header: 'Movement Type',
      accessor: 'movementType',
      cell: (row) => (
        <Badge
          variant={
            row.movementType === 'RECEIVE' || row.movementType === 'INBOUND'
              ? 'success'
              : row.movementType === 'ADJUST'
              ? 'warning'
              : 'primary'
          }
        >
          {row.movementType}
        </Badge>
      ),
    },
    {
      header: 'Product',
      accessor: 'product',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.product?.name || 'N/A'}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.product?.sku || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'locRef',
      cell: (row) => <span className="font-mono text-xs text-slate-600">{row.locRef?.code || row.locationId}</span>,
    },
    {
      header: 'Quantity Change',
      accessor: 'quantityDelta',
      cell: (row) => (
        <span
          className={`font-mono font-bold ${
            row.quantityDelta > 0 ? 'text-green-600' : row.quantityDelta < 0 ? 'text-red-600' : 'text-slate-600'
          }`}
        >
          {row.quantityDelta > 0 ? `+${row.quantityDelta}` : row.quantityDelta}
        </span>
      ),
    },
    {
      header: 'Reference ID / Notes',
      accessor: 'notes',
      cell: (row) => (
        <div className="text-xs">
          <div className="font-mono font-semibold text-slate-700">{row.referenceId || 'LOG-SYSTEM'}</div>
          <div className="text-slate-500 truncate max-w-xs">{row.notes || '-'}</div>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading storage bin mappings and inventory transaction ledgers..." />;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Inventory & Bin Mapping</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Real-time storage bin stock mapping and immutable inventory transaction ledger
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={handleOpenAdjustModal}>
            Audit Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant">
        <button
          onClick={() => setActiveTab('bins')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'bins'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bin Location Stock ({bins.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'ledger'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Immutable Transaction Ledger ({transactions.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-4 overflow-hidden flex-1">
        {activeTab === 'bins' ? (
          <DataTable
            data={bins}
            columns={binColumns}
            emptyMessage="No bin location stock mappings recorded in database."
          />
        ) : (
          <DataTable
            data={transactions}
            columns={txColumns}
            emptyMessage="No transaction ledger records recorded."
          />
        )}
      </div>

      {/* Audit Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Transactional Stock Adjustment (Prisma Transaction)"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdjustSubmit} isLoading={submitting}>
              Apply Stock Mutation
            </Button>
          </>
        }
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            ⚠️ Every stock mutation updates <strong>LocationInventory</strong>, <strong>Inventory Aggregate</strong>, and <strong>InventoryLedger</strong> inside a single database transaction.
          </p>

          <FormField label="Target Storage Location" required>
            <Select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              options={locations.map((l) => ({ value: l.id, label: `Zone ${l.zone} - Bin ${l.bin} (${l.code})` }))}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product SKU" required>
              <Select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              />
            </FormField>
            <FormField label="Batch / Lot ID" required>
              <Select
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                options={batches.map((b) => ({ value: b.id, label: `Lot ${b.lotId}` }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quantity Change (+/-)" required>
              <Input
                type="number"
                value={quantityDelta}
                onChange={(e) => setQuantityDelta(e.target.value)}
                placeholder="e.g. 50 or -10"
                required
              />
            </FormField>
            <FormField label="Adjustment Reason Code">
              <Select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                options={[
                  { value: 'PHYSICAL_COUNT', label: 'Physical Audit Count' },
                  { value: 'DAMAGED', label: 'Damaged Goods Quarantine' },
                  { value: 'EXPIRED', label: 'Expired Stock Removal' },
                  { value: 'MANUAL_CORRECTION', label: 'Manual Correction' },
                  { value: 'AUDIT_CORRECTION', label: 'Audit Correction' },
                  { value: 'LOST', label: 'Lost / Missing' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Audit Notes / Reference">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Quarter audit count correction" />
          </FormField>
        </form>
      </Modal>
    </section>
  );
};

export default InventoryListPage;
