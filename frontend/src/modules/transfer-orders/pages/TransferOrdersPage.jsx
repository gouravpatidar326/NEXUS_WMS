import { useState, useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { transferOrdersService } from '@/services/transferOrdersService';
import { locationService } from '@/services/locationService';
import { productService } from '@/services/productService';
import { batchService } from '@/services/batchService';
import { inventoryService } from '@/services/inventoryService';

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
  const [binInventory, setBinInventory] = useState([]);
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
      const [transRes, locList, prodRes, batchList, binStock] = await Promise.all([
        transferOrdersService.getTransferOrders(),
        locationService.getLocations(),
        productService.getProducts({ limit: 100 }),
        batchService.getBatches(),
        inventoryService.getBinInventory(),
      ]);

      const items = Array.isArray(transRes) ? transRes : transRes.items || [];
      setTransfers(items);
      setLocations(locList || []);
      setProducts(prodRes.items || []);
      setBatches(batchList || []);
      setBinInventory(binStock || []);

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

  // Reactively update selected Product when source location changes
  useEffect(() => {
    if (sourceLocationId && binInventory.length > 0) {
      const validProducts = products.filter(prod => 
        binInventory.some(stock => 
          stock.locationId === sourceLocationId && 
          stock.productId === prod.id && 
          stock.available > 0
        )
      );
      if (validProducts.length > 0) {
        if (!validProducts.some(p => p.id === productId)) {
          setProductId(validProducts[0].id);
        }
      } else {
        setProductId('');
      }
    }
  }, [sourceLocationId, binInventory, products]);

  // Reactively update selected Lot when Product or source location changes
  useEffect(() => {
    if (sourceLocationId && productId && binInventory.length > 0) {
      const validBatches = batches.filter(batch => 
        binInventory.some(stock => 
          stock.locationId === sourceLocationId && 
          stock.productId === productId && 
          stock.lotId === batch.id && 
          stock.available > 0
        )
      );
      if (validBatches.length > 0) {
        if (!validBatches.some(b => b.id === lotId)) {
          setLotId(validBatches[0].id);
        }
      } else {
        setLotId('');
      }
    }
  }, [productId, sourceLocationId, binInventory, batches]);

  // Computed values
  const availableSourceLocations = locations.filter(loc => 
    binInventory.some(stock => stock.locationId === loc.id && stock.available > 0)
  );

  const availableProducts = products.filter(prod => 
    binInventory.some(stock => 
      stock.locationId === sourceLocationId && 
      stock.productId === prod.id && 
      stock.available > 0
    )
  );

  const availableBatches = batches.filter(batch => 
    binInventory.some(stock => 
      stock.locationId === sourceLocationId && 
      stock.productId === productId && 
      stock.lotId === batch.id && 
      stock.available > 0
    )
  );

  const currentStockRecord = binInventory.find(stock => 
    stock.locationId === sourceLocationId && 
    stock.productId === productId && 
    stock.lotId === lotId
  );
  const currentAvailableStock = currentStockRecord ? currentStockRecord.available : 0;

  const destLocations = locations.filter(l => l.id !== sourceLocationId);

  const isFormInvalid = 
    availableSourceLocations.length === 0 || 
    !sourceLocationId || 
    !destLocationId || 
    !productId || 
    !lotId || 
    isNaN(parseInt(quantity, 10)) || 
    parseInt(quantity, 10) <= 0 || 
    parseInt(quantity, 10) > currentAvailableStock;

  const handleOpenModal = () => {
    const locWithStock = locations.filter(loc => 
      binInventory.some(stock => stock.locationId === loc.id && stock.available > 0)
    );
    if (locWithStock.length > 0) {
      setSourceLocationId(locWithStock[0].id);
      
      const validProducts = products.filter(prod => 
        binInventory.some(stock => 
          stock.locationId === locWithStock[0].id && 
          stock.productId === prod.id && 
          stock.available > 0
        )
      );
      if (validProducts.length > 0) {
        setProductId(validProducts[0].id);
        const validBatches = batches.filter(batch => 
          binInventory.some(stock => 
            stock.locationId === locWithStock[0].id && 
            stock.productId === validProducts[0].id && 
            stock.lotId === batch.id && 
            stock.available > 0
          )
        );
        if (validBatches.length > 0) {
          setLotId(validBatches[0].id);
        } else {
          setLotId('');
        }
      } else {
        setProductId('');
        setLotId('');
      }
    } else {
      setSourceLocationId('');
      setProductId('');
      setLotId('');
    }
    
    const destOptions = locations.filter(l => l.id !== (locWithStock[0]?.id || ''));
    if (destOptions.length > 0) {
      setDestLocationId(destOptions[0].id);
    } else {
      setDestLocationId('');
    }

    setQuantity('10');
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
            <Button 
              variant="primary" 
              onClick={handleCreateTransfer} 
              disabled={submitting || isFormInvalid}
            >
              {submitting ? 'Executing Transfer...' : 'Execute Stock Transfer'}
            </Button>
          </>
        }
      >
        {availableSourceLocations.length === 0 ? (
          <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-md text-sm text-center font-medium">
            No inventory available in any bin location to execute a transfer.
          </div>
        ) : (
          <form onSubmit={handleCreateTransfer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Source Storage Bin" required>
                <Select
                  value={sourceLocationId}
                  onChange={(e) => setSourceLocationId(e.target.value)}
                  options={availableSourceLocations.map((l) => ({ value: l.id, label: `Zone ${l.zone} - Bin ${l.bin} (${l.code})` }))}
                />
              </FormField>
              <FormField label="Destination Storage Bin" required>
                <Select
                  value={destLocationId}
                  onChange={(e) => setDestLocationId(e.target.value)}
                  options={destLocations.map((l) => ({ value: l.id, label: `Zone ${l.zone} - Bin ${l.bin} (${l.code})` }))}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Product to Transfer" required>
                <Select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  options={availableProducts.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                />
              </FormField>
              <FormField label="Lot / Batch" required>
                <Select
                  value={lotId}
                  onChange={(e) => setLotId(e.target.value)}
                  options={availableBatches.map((b) => ({ value: b.id, label: b.lotNumber || b.lotId }))}
                />
              </FormField>
            </div>
            <FormField label="Quantity to Transfer" required>
              <Input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                max={currentAvailableStock}
                min={1}
                required 
              />
              <div className="flex justify-between items-center mt-1.5">
                <p className={`text-xs font-semibold ${currentAvailableStock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  Available Stock in Source Bin: {currentAvailableStock} units
                </p>
                {parseInt(quantity, 10) > currentAvailableStock && (
                  <p className="text-xs text-red-500 font-semibold">
                    Exceeds available stock!
                  </p>
                )}
              </div>
            </FormField>
          </form>
        )}
      </Modal>
    </section>
  );
};

export default TransferOrdersPage;
