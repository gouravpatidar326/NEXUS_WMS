import { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, PackageCheck, Clock3, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
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

export const PurchaseOrdersPage = () => {
  const { user } = useAuth();
  const { purchaseOrders, receivePurchaseOrder, createPurchaseOrder } = useWmsStore();
  const { notifySuccess, notifyError } = useNotification();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receivingPo, setReceivingPo] = useState(null);

  // New PO state
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-08-15');
  const [totalAmount, setTotalAmount] = useState(5000);
  const [itemName, setItemName] = useState('Industrial Barcode Scanner X-200');
  const [quantity, setQuantity] = useState(25);

  // Goods Receiving Dock state
  const [recLotId, setRecLotId] = useState('');
  const [recQty, setRecQty] = useState(100);
  const [recExpiryDate, setRecExpiryDate] = useState('2026-12-31');
  const [recLocation, setRecLocation] = useState('Receiving Dock Bin B-04');

  const filteredOrders = purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    po.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenReceiveModal = (po) => {
    setReceivingPo(po);
    setRecLotId(`LOT-PO-${Math.floor(10000 + Math.random() * 90000)}`);
    setRecQty(po.items?.[0]?.qty || 100);
  };

  const handleCreatePurchaseOrder = (e) => {
    e.preventDefault();
    if (!supplier.trim() || !expectedDate || Number(totalAmount) <= 0 || Number(quantity) <= 0) {
      notifyError('Complete all purchase order fields with valid values.');
      return;
    }
    const created = createPurchaseOrder({
      supplier: supplier.trim(), expectedDate, totalAmount: Number(totalAmount), createdBy: user?.name,
      items: [{ productId: 'PRD-1001', sku: 'SKU-ELEC-001', name: itemName, qty: Number(quantity), qtyOrdered: Number(quantity), unitCost: Number(totalAmount) / Number(quantity) }],
    });
    notifySuccess(`${created.poNumber} created and submitted for approval.`);
    setIsModalOpen(false);
    setSupplier('');
  };

  const handleConfirmReceive = (e) => {
    e.preventDefault();
    if (!receivingPo) return;

    receivePurchaseOrder(receivingPo.id, {
      lotId: recLotId,
      qty: Number(recQty),
      expiryDate: recExpiryDate,
      location: recLocation,
    });

    notifySuccess(`Goods Received for ${receivingPo.poNumber}! Lot ${recLotId} created and posted to inventory.`);
    setReceivingPo(null);
  };

  const columns = [
    {
      header: 'PO Reference',
      accessor: 'poNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
          {row.poNumber}
        </span>
      ),
    },
    { header: 'Supplier Name', accessor: 'supplier' },
    { header: 'Expected Delivery', accessor: 'expectedDate' },
    {
      header: 'Order Total',
      accessor: 'totalAmount',
      cell: (row) => `$${Number(row.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const variant =
          row.status === 'Approved'
            ? 'primary'
            : row.status === 'Received'
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
          {row.status === 'Approved' ? (
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

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Purchase Orders & Vendor Receiving Dock"
        description="Procurement workflow, vendor goods receiving dock, automated Lot generation, and inventory posting"
        breadcrumbs={[{ label: 'Order Management' }, { label: 'Purchase Orders' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.PO_CREATE}>
            <Button leftIcon={Plus} onClick={() => setIsModalOpen(true)}>Create Purchase Order</Button>
          </PermissionGuard>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4"><ShoppingCart className="h-9 w-9 rounded-xl bg-primary-50 p-2 text-primary-600" /><div><p className="text-xs text-surface-500">Total purchase orders</p><p className="text-xl font-bold">{purchaseOrders.length}</p></div></div>
        <div className="card flex items-center gap-3 p-4"><Clock3 className="h-9 w-9 rounded-xl bg-warning-50 p-2 text-warning-600" /><div><p className="text-xs text-surface-500">Awaiting action</p><p className="text-xl font-bold">{purchaseOrders.filter((po) => po.status !== 'Received').length}</p></div></div>
        <div className="card flex items-center gap-3 p-4"><CircleDollarSign className="h-9 w-9 rounded-xl bg-success-50 p-2 text-success-600" /><div><p className="text-xs text-surface-500">Procurement value</p><p className="text-xl font-bold">${purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount || 0), 0).toLocaleString()}</p></div></div>
      </div>

      <div className="card p-4"><SearchBar value={search} onChange={setSearch} placeholder="Search POs by PO# or supplier..." /></div>

      <div className="flex-1">
        <DataTable columns={columns} data={filteredOrders} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Purchase Order"
        size="md"
        footer={<><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleCreatePurchaseOrder}>Submit for Approval</Button></>}
      >
        <form onSubmit={handleCreatePurchaseOrder} className="space-y-4">
          <FormField label="Supplier" required><Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier company name" required /></FormField>
          <FormField label="Item / Product" required><Input value={itemName} onChange={(e) => setItemName(e.target.value)} required /></FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Quantity" required><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></FormField>
            <FormField label="Order Total" required><Input type="number" min="1" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required /></FormField>
          </div>
          <FormField label="Expected Delivery" required><Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} required /></FormField>
        </form>
      </Modal>

      {/* Goods Receiving Dock Modal */}
      {receivingPo && (
        <Modal
          isOpen={!!receivingPo}
          onClose={() => setReceivingPo(null)}
          title={`Receiving Dock Gate — ${receivingPo.poNumber}`}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setReceivingPo(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmReceive}>
                Confirm Goods Receipt & Create Lot
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmReceive} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <span className="font-bold text-blue-900 block">Vendor: {receivingPo.supplier}</span>
              <span className="text-blue-700">Item: {receivingPo.items?.[0]?.name || 'Supplier Goods'}</span>
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
