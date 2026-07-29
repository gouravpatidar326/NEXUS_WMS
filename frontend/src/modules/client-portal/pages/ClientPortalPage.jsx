import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { salesOrderService } from '@/services/salesOrderService';
import { productService } from '@/services/productService';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingState from '@/components/feedback/LoadingState';
import { Package2, Plus, RefreshCw, FileText } from 'lucide-react';

export const ClientPortalPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [soList, prodRes] = await Promise.all([
        salesOrderService.fetchSalesOrders(),
        productService.getProducts({ limit: 100 }),
      ]);
      setOrders(Array.isArray(soList) ? soList : []);
      setProducts(prodRes.items || []);
      if (prodRes.items && prodRes.items.length > 0) setSelectedProductId(prodRes.items[0].id);
    } catch {
      notifyError('Failed to load client portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !quantity) {
      notifyError('Product and Quantity are required');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      notifyError('Quantity must be a positive number');
      return;
    }

    setSubmitting(true);
    try {
      await salesOrderService.createSalesOrder({
        items: [{ productId: selectedProductId, quantity: qty }],
      });
      notifySuccess('Order request submitted! Pending warehouse review.');
      setIsModalOpen(false);
      fetchClientData();
    } catch (err) {
      notifyError(err.message || 'Failed to place order request');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Order Reference ID',
      accessor: 'orderNumber',
      cell: (row) => (
        <span className="font-mono font-bold text-primary flex items-center gap-1">
          <Package2 className="w-3.5 h-3.5" />
          {row.orderNumber || `SO-${row.id?.substring(0, 6)}`}
        </span>
      ),
    },
    {
      header: 'Items Requested',
      accessor: 'items',
      cell: (row) => {
        const item = row.items && row.items[0];
        return (
          <div>
            <span className="font-semibold block">{item?.product?.name || 'Order Item'}</span>
            <span className="text-[11px] text-slate-500 font-mono">Qty: {item?.quantity || 1} Units</span>
          </div>
        );
      },
    },
    {
      header: 'Wholesale Total',
      accessor: 'totalCost',
      cell: (row) => <span className="font-bold text-primary">${(row.totalCost || 0).toFixed(2)}</span>,
    },
    {
      header: 'Review & Approval Status',
      accessor: 'status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'APPROVED' || row.status === 'COMPLETED'
              ? 'success'
              : row.status === 'PENDING_REVIEW'
              ? 'warning'
              : 'danger'
          }
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Submitted Date',
      accessor: 'createdAt',
      cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
    },
  ];

  if (loading) return <LoadingState message="Loading Client Portal Dashboard & Live Orders..." />;

  const activeOrdersCount = orders.filter((o) => o.status === 'PENDING_REVIEW' || o.status === 'PICKING').length;
  const totalSpend = orders.reduce((sum, o) => sum + (o.totalCost || 0), 0);

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Client Supply Chain Portal"
        description="Place order requests, view real-time warehouse approval status, and track shipments"
        breadcrumbs={[{ label: 'Client Portal' }, { label: 'My Orders' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchClientData}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
              Place Order Request
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Active Orders</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{activeOrdersCount}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">Pending Review / In Progress</p>
        </div>
        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Wholesale Order Spend</p>
          <h3 className="text-2xl font-bold text-primary mt-1">${totalSpend.toFixed(2)}</h3>
          <p className="text-xs text-green-600 font-semibold mt-1">Live Database Aggregate</p>
        </div>
        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Orders Submitted</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">All Time Requests</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-1">
        <DataTable columns={columns} data={orders} />
      </div>

      {/* Create Order Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Order Request for Warehouse Review"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateOrder} disabled={submitting}>
              {submitting ? 'Submitting Request...' : 'Submit Order Request'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <FormField label="Select Product Catalog Item" required>
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} - Wholesale Price: $${(p.wholesalePrice || 0).toFixed(2)} (SKU: ${p.sku})`,
              }))}
            />
          </FormField>
          <FormField label="Quantity Requested (Units)" required>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </FormField>
        </form>
      </Modal>
    </section>
  );
};

export default ClientPortalPage;
