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

  // Adjustment Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical Stock Count Discrepancy');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [binList, txList, prodRes, locList, batchList] = await Promise.all([
        inventoryService.getBinInventory(),
        inventoryService.getMovements({ limit: 100 }),
        productService.getProducts({ limit: 100 }),
        locationService.getLocations(),
        batchService.getBatches(),
      ]);

      setBins(binList || []);
      setTransactions(txList.items || []);
      setProducts(prodRes.items || []);
      setLocations(locList || []);
      setBatches(batchList || []);

      if (prodRes.items && prodRes.items.length > 0) setProductId(prodRes.items[0].id);
      if (batchList && batchList.length > 0) setLotId(batchList[0].id);
      if (locList && locList.length > 0) setLocationId(locList[0].id);
    } catch {
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

  const handleConfirmAdjustment = async (e) => {
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
            Zone {row.location?.zone || 'A'} &rarr; Bin {row.location?.bin || 'A1'}
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
            row.movementType === 'RECEIVE'
              ? 'success'
              : row.movementType === 'TRANSFER'
              ? 'info'
              : row.movementType === 'ADJUSTMENT'
              ? 'warning'
              : 'default'
          }
          dot
        >
          {row.movementType}
        </Badge>
      ),
    },
    {
      header: 'Product',
      accessor: 'product',
      cell: (row) => row.product?.name || 'Product',
    },
    {
      header: 'Quantity Delta',
      accessor: 'quantityDelta',
      cell: (row) => (
        <span className={`font-mono font-bold ${row.quantityDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {row.quantityDelta >= 0 ? `+${row.quantityDelta}` : row.quantityDelta} Units
        </span>
      ),
    },
    {
      header: 'Notes / Reference',
      accessor: 'notes',
      cell: (row) => row.notes || row.referenceId || 'N/A',
    },
  ];

  if (loading) return <LoadingState message="Loading Bin Inventory & Transaction Ledger..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Inventory & Bin Mapping"
        description="Real-time storage bin stock mapping and immutable inventory transaction ledger"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Bin Mapping' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchData}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={handleOpenAdjustModal}>
              Audit Stock Adjustment
            </Button>
          </div>
        }
      />

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('bins')}
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'bins' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Bin Location Stock ({bins.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'ledger' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Immutable Transaction Ledger ({transactions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'bins' ? (
          <DataTable columns={binColumns} data={bins} />
        ) : (
          <DataTable columns={txColumns} data={transactions} />
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Audited Stock Adjustment"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmAdjustment} disabled={submitting}>
              {submitting ? 'Processing...' : 'Apply Stock Adjustment'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmAdjustment} className="space-y-4">
          <FormField label="Target Product" required>
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={productsList.map((p) => ({
                value: p.id,
                label: `${p.sku} — ${p.name} (Current: ${p.availableStock || 0})`,
              }))}
            />
          </FormField>

          <FormField label="Quantity Adjustment (+/- Delta)" required hint="Use positive number to add stock, negative number to reduce stock">
            <Input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. -5 or 25"
              required
            />
          </FormField>

          <FormField label="Adjustment Reason / Justification" required>
            <Select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              options={[
                'Physical Stock Count Discrepancy',
                'Damaged During Transport',
                'Expired Stock Removal',
                'Unrecorded Dock Receipt',
                'Quality Inspection Hold',
              ]}
            />
          </FormField>
        </form>
      </Modal>
    </section>
  );
};

export default InventoryListPage;
