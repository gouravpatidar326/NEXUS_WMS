import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, CheckCircle2, PackageCheck, Clock3, CircleDollarSign, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import PermissionGuard from '@/guards/PermissionGuard';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import SearchBar from '@/components/forms/SearchBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';

import { purchaseOrderService } from '@/services/purchaseOrderService';
import { productService } from '@/services/productService';

export const PurchaseOrdersPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receivingPo, setReceivingPo] = useState(null);

  // New PO state
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [lineItems, setLineItems] = useState([
    { productId: '', quantity: 10, unitCost: 0 }
  ]);

  const calculatedTotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const c = Number(item.unitCost) || 0;
      return sum + (q * c);
    }, 0);
  }, [lineItems]);

  // Goods Receiving Dock state
  const [recLotId, setRecLotId] = useState('');
  const [recQty, setRecQty] = useState(0);
  const [recExpiryDate, setRecExpiryDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
  const [recLocation, setRecLocation] = useState('Receiving Dock Bin B-04');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pos = await purchaseOrderService.fetchPurchaseOrders();
      const prodsData = await productService.getProducts({ pageSize: 100 });
      
      setPurchaseOrders(pos);
      setProducts(prodsData.items);
    } catch (error) {
      console.error(error);
      notifyError('Failed to load purchase orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = purchaseOrders.filter(po =>
    po.poNumber?.toLowerCase().includes(search.toLowerCase()) ||
    po.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenReceiveModal = (po) => {
    setReceivingPo(po);
    setRecLotId(`LOT-PO-${Math.floor(10000 + Math.random() * 90000)}`);
    setRecQty(po.items?.[0]?.quantity || 100);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { productId: '', quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length <= 1) {
      notifyError('Purchase Order must contain at least one product line item.');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;

    if (field === 'productId') {
      const selectedProd = products.find((p) => p.id === value);
      if (selectedProd && selectedProd.unitCost !== undefined) {
        updated[index].unitCost = selectedProd.unitCost || 0;
      }
    }

    setLineItems(updated);
  };

  const handleCreatePurchaseOrder = async (e) => {
    e.preventDefault();
    if (!supplier.trim() || !expectedDate) {
      notifyError('Supplier Name and Expected Delivery Date are required.');
      return;
    }

    const invalidItems = lineItems.some(
      (item) => !item.productId || Number(item.quantity) <= 0 || Number(item.unitCost) < 0
    );

    if (invalidItems) {
      notifyError('All line items must have a selected product, valid quantity (>0), and unit cost.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await purchaseOrderService.createPurchaseOrder({
        supplier: supplier.trim(),
        expectedDelivery: expectedDate,
        totalCost: calculatedTotal,
        items: lineItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost)
        }))
      });
      notifySuccess(`Purchase Order created successfully.`);
      setIsModalOpen(false);
      setSupplier('');
      setLineItems([{ productId: '', quantity: 10, unitCost: 0 }]);
      fetchData(); // Refresh list
    } catch (error) {
      notifyError('Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReceive = async (e) => {
    e.preventDefault();
    if (!receivingPo) return;

    setIsSubmitting(true);
    try {
      const productId = receivingPo.items?.[0]?.productId;
      if (!productId) throw new Error("No product ID found in this PO");

      await purchaseOrderService.receivePurchaseOrder(receivingPo.id, [{
        lotId: recLotId,
        productId: productId,
        quantity: Number(recQty),
        expiryDate: recExpiryDate,
        binLocation: recLocation,
        mfgDate: new Date().toISOString()
      }]);

      notifySuccess(`Goods Received for ${receivingPo.poNumber}! Lot ${recLotId} created and posted to inventory.`);
      setReceivingPo(null);
      fetchData(); // Refresh list
    } catch (error) {
      notifyError('Failed to receive goods');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'PO Reference',
      accessor: 'poNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
          {row.poNumber || row.id.substring(0, 8)}
        </span>
      ),
    },
    { header: 'Supplier Name', accessor: 'supplier' },
    { 
      header: 'Expected Delivery', 
      accessor: 'expectedDelivery',
      cell: (row) => row.expectedDelivery ? new Date(row.expectedDelivery).toLocaleDateString() : 'N/A'
    },
    {
      header: 'Order Total',
      accessor: 'totalCost',
      cell: (row) => `$${Number(row.totalCost || row.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const variant =
          row.status === 'APPROVED' || row.status === 'Approved'
            ? 'primary'
            : row.status === 'RECEIVED' || row.status === 'Received'
            ? 'success'
            : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Receiving Action',
      accessor: 'actions',
      cell: (row) => (
        <PermissionGuard permission={PERMISSIONS.PO_RECEIVE}>
          {row.status !== 'RECEIVED' && row.status !== 'Received' ? (
            <Button
              size="sm"
              variant="outline"
              leftIcon={PackageCheck}
              onClick={() => handleOpenReceiveModal(row)}
            >
              Open Receiving Dock
            </Button>
          ) : (
            <span className="text-xs text-emerald-600 font-bold">✓ Stock Posted</span>
          )}
        </PermissionGuard>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Purchase Orders & Vendor Receiving Dock"
        description="Procurement workflow, vendor goods receiving dock, automated Lot generation, and inventory posting"
        breadcrumbs={[{ label: 'Order Management' }, { label: 'Purchase Orders' }]}
        actions={
          user?.role?.toUpperCase() !== 'SUPER_ADMIN' && (
            <PermissionGuard permission={PERMISSIONS.PO_CREATE}>
              <Button leftIcon={Plus} onClick={() => setIsModalOpen(true)}>Create Purchase Order</Button>
            </PermissionGuard>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4"><ShoppingCart className="h-9 w-9 rounded-xl bg-primary-50 p-2 text-primary-600" /><div><p className="text-xs text-surface-500">Total purchase orders</p><p className="text-xl font-bold">{purchaseOrders.length}</p></div></div>
        <div className="card flex items-center gap-3 p-4"><Clock3 className="h-9 w-9 rounded-xl bg-warning-50 p-2 text-warning-600" /><div><p className="text-xs text-surface-500">Awaiting action</p><p className="text-xl font-bold">{purchaseOrders.filter((po) => po.status !== 'RECEIVED' && po.status !== 'Received').length}</p></div></div>
        <div className="card flex items-center gap-3 p-4"><CircleDollarSign className="h-9 w-9 rounded-xl bg-success-50 p-2 text-success-600" /><div><p className="text-xs text-surface-500">Procurement value</p><p className="text-xl font-bold">${purchaseOrders.reduce((sum, po) => sum + Number(po.totalCost || po.totalAmount || 0), 0).toLocaleString()}</p></div></div>
      </div>

      <div className="card p-4"><SearchBar value={search} onChange={setSearch} placeholder="Search POs by PO# or supplier..." /></div>

      <div className="flex-1">
        <DataTable columns={columns} data={filteredOrders} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Purchase Order (Vendor Procurement)"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePurchaseOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Purchase Order'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreatePurchaseOrder} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Supplier / Vendor Name" required>
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Acme Chemical Suppliers Corp"
                required
              />
            </FormField>
            <FormField label="Expected Arrival Date" required>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
              />
            </FormField>
          </div>

          {/* Line Items Table */}
          <div className="border border-outline-variant rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Purchase Order Line Items ({lineItems.length})
              </h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                leftIcon={Plus}
                onClick={handleAddLineItem}
              >
                Add Line Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, idx) => {
                const subtotal = (Number(item.quantity) || 0) * (Number(item.unitCost) || 0);
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-3 items-end bg-white p-3 rounded-lg border border-outline-variant shadow-xs"
                  >
                    <div className="col-span-5">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Select Product *
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleLineItemChange(idx, 'productId', e.target.value)}
                        className="w-full h-9 rounded-md border border-outline-variant px-2.5 text-xs bg-white focus:border-primary focus:outline-none"
                        required
                      >
                        <option value="">-- Choose Product --</option>
                        {products
                          .filter((p) => p.name && !p.name.includes('dsadsa')) // Clean dropdown
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Qty *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                        className="w-full h-9 rounded-md border border-outline-variant px-2 text-xs focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => handleLineItemChange(idx, 'unitCost', e.target.value)}
                        className="w-full h-9 rounded-md border border-outline-variant px-2 text-xs focus:border-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Subtotal
                      </label>
                      <span className="font-mono font-bold text-xs text-slate-800 block py-1.5">
                        ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Remove line item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Calculated Grand Total PO Value
              </span>
              <span className="text-xs text-slate-600">
                Sum of {lineItems.length} line item(s)
              </span>
            </div>
            <span className="text-2xl font-extrabold font-mono text-primary">
              ${calculatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </form>
      </Modal>

      {/* Goods Receiving Dock Modal */}
      {receivingPo && (
        <Modal
          isOpen={!!receivingPo}
          onClose={() => setReceivingPo(null)}
          title={`Receiving Dock Gate — ${receivingPo.poNumber || receivingPo.id.substring(0,8)}`}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setReceivingPo(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmReceive} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Goods Receipt & Create Lot'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmReceive} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <span className="font-bold text-blue-900 block">Vendor: {receivingPo.supplier}</span>
              <span className="text-blue-700">Item: {receivingPo.items?.[0]?.product?.name || 'Supplier Goods'}</span>
            </div>

            <FormField label="Assigned New Lot ID" required>
              <Input value={recLotId} onChange={(e) => setRecLotId(e.target.value)} required />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Received Unit Qty" required>
                <Input type="number" value={recQty} onChange={(e) => setRecQty(e.target.value)} required />
              </FormField>

              <FormField label="Expiry Date" required>
                <Input type="date" value={recExpiryDate} onChange={(e) => setRecExpiryDate(e.target.value)} required />
              </FormField>
            </div>

            <FormField label="Destination Warehouse Bin Location" required>
              <Input value={recLocation} onChange={(e) => setRecLocation(e.target.value)} required />
            </FormField>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
