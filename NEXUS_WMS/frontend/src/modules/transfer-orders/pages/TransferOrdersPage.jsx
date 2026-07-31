import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { transferOrdersService } from '@/services/transferOrdersService';
import { locationService } from '@/services/locationService';
import { productService } from '@/services/productService';
import { batchService } from '@/services/batchService';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingState from '@/components/feedback/LoadingState';
import { Plus, ArrowRightLeft, RefreshCw } from 'lucide-react';

export const TransferOrdersPage = () => {
  const { notifySuccess, notifyError } = useNotification();

  const [transfers, setTransfers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceLocationId, setSourceLocationId] = useState('');
  const [destLocationId, setDestLocationId] = useState('');
  const [productId, setProductId] = useState('');
  const [lotId, setLotId] = useState('');
  const [quantity, setQuantity] = useState('10');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transRes, locList, prodRes, batchList] = await Promise.all([
        transferOrdersService.getTransferOrders(),
        locationService.getLocations(),
        productService.getProducts({ limit: 100 }),
        batchService.getBatches(),
      ]);

      const items = Array.isArray(transRes) ? transRes : transRes.items || [];
      setTransfers(items);
      setLocations(locList || []);
      setProducts(prodRes.items || []);
      setBatches(batchList || []);

      if (locList && locList.length > 0) {
        setSourceLocationId(locList[0].id);
        if (locList.length > 1) setDestLocationId(locList[1].id);
        else setDestLocationId(locList[0].id);
      }
      if (prodRes.items && prodRes.items.length > 0) setProductId(prodRes.items[0].id);
      if (batchList && batchList.length > 0) setLotId(batchList[0].id);
    } catch {
      notifyError('Failed to load inventory transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!sourceLocationId || !destLocationId || !productId || !lotId || !quantity) {
      notifyError('Source location, Destination location, Product, Lot, and Quantity are required');
      return;
    }

    if (sourceLocationId === destLocationId) {
      notifyError('Source and Destination locations must be different');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      notifyError('Quantity must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await transferOrdersService.createTransferOrder({
        sourceLocationId,
        destLocationId,
        items: [
          {
            productId,
            lotId,
            quantity: qty,
          },
        ],
      });

      notifySuccess('Stock transfer executed successfully.');
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Transfer Number',
      accessor: 'transferNumber',
      cell: (row) => (
        <span className="font-mono font-bold text-primary flex items-center gap-1">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {row.transferNumber || `TRF-${row.id?.substring(0, 6)}`}
        </span>
      ),
    },
    {
      header: 'Source Bin Location',
      accessor: 'sourceLocation',
      cell: (row) => row.sourceLocation?.code || `Bin ${row.sourceLocation?.bin || row.sourceLocationId}`,
    },
    {
      header: 'Destination Bin Location',
      accessor: 'destLocation',
      cell: (row) => row.destLocation?.code || `Bin ${row.destLocation?.bin || row.destLocationId}`,
    },
    {
      header: 'Items Count',
      accessor: 'items',
      cell: (row) => `${(row.items && row.items.length) || 1} Item(s)`,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge variant="success" dot>{row.status || 'COMPLETED'}</Badge>,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
    },
  ];

  if (loading) return <LoadingState message="Loading Inventory Transfers..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Inventory Transfers & Movement"
        description="Execute bin-to-bin and inter-warehouse stock transfers with real-time transactional updates"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Inventory Transfers' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchData}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={handleOpenModal}>
              Create Stock Transfer
            </Button>
          </div>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={transfers} />
      </div>

      {/* Create Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Execute Bin-to-Bin Stock Transfer"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateTransfer} disabled={submitting}>
              {submitting ? 'Executing Transfer...' : 'Execute Stock Transfer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Source Storage Bin" required>
              <Select
                value={sourceLocationId}
                onChange={(e) => setSourceLocationId(e.target.value)}
                options={locations.map((l) => ({ value: l.id, label: `Zone ${l.zone} - Bin ${l.bin} (${l.code})` }))}
              />
            </FormField>
            <FormField label="Destination Storage Bin" required>
              <Select
                value={destLocationId}
                onChange={(e) => setDestLocationId(e.target.value)}
                options={locations.map((l) => ({ value: l.id, label: `Zone ${l.zone} - Bin ${l.bin} (${l.code})` }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product to Transfer" required>
              <Select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              />
            </FormField>
            <FormField label="Lot / Batch" required>
              <Select
                value={lotId}
                onChange={(e) => setLotId(e.target.value)}
                options={batches.map((b) => ({ value: b.id, label: b.lotNumber || b.lotId }))}
              />
            </FormField>
          </div>
          <FormField label="Quantity to Transfer" required>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </FormField>
        </form>
      </Modal>
    </section>
  );
};

export default TransferOrdersPage;
