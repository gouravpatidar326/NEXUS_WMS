import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/permissions/roles';
import { useNotification } from '@/contexts/NotificationContext';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

import { salesOrderService } from '@/services/salesOrderService';
import { clientService } from '@/services/clientService';
import { productService } from '@/services/productService';

export const SalesOrdersPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const isClient = user?.role === ROLES.CLIENT;
  const isManagerOrAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.WAREHOUSE_MANAGER;

  const [salesOrders, setSalesOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('Stock unavailable for priority timeline');

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [soData, clientData, prodData] = await Promise.all([
        salesOrderService.fetchSalesOrders(),
        clientService.fetchClients(),
        productService.getProducts({ pageSize: 100 })
      ]);
      setSalesOrders(soData);
      setClients(clientData);
      setProducts(prodData.items || []);
    } catch (error) {
      console.error(error);
      notifyError('Failed to load sales orders data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = salesOrders.filter((ord) => {
    const matchesStatus =
      selectedStatus === 'All Orders' ||
      (selectedStatus === 'Pending Review' && ord.status === 'PENDING_REVIEW') ||
      ord.status === selectedStatus || ord.status.replace('_', ' ') === selectedStatus.toUpperCase();
    
    const clientName = ord.client?.name || '';
    const matchesSearch =
      (ord.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedClientId || !selectedProductId || quantity <= 0) {
      notifyError('Please fill out all fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      await salesOrderService.createSalesOrder({
        clientId: selectedClientId,
        priority,
        items: [{
          productId: selectedProductId,
          quantity: Number(quantity)
        }]
      });
      notifySuccess(`Order request submitted for warehouse review!`);
      setIsModalOpen(false);
      setSelectedClientId('');
      setSelectedProductId('');
      setQuantity(1);
      fetchData();
    } catch (error) {
      console.error(error);
      notifyError(error.message || 'Failed to create sales order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (orderId, orderNum) => {
    try {
      await salesOrderService.approveSalesOrder(orderId);
      notifySuccess(`Order ${orderNum} Approved! Allocated to Picking Queue & stock committed.`);
      fetchData();
    } catch (error) {
      notifyError(error.message || `Failed to approve order ${orderNum}`);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    setIsSubmitting(true);
    try {
      await salesOrderService.rejectSalesOrder(rejectingOrder.id, rejectionReasonText);
      notifyError(`Order ${rejectingOrder.orderNumber} Rejected by Warehouse Ops.`);
      setRejectingOrder(null);
      fetchData();
    } catch (error) {
      notifyError(error.message || `Failed to reject order ${rejectingOrder.orderNumber}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-600" /></div>;
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-4 sm:space-y-6">
      {/* Header Breadcrumbs & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span>Operations</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Sales Orders</span>
          </nav>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">
            {isClient ? 'My Sales Order Requests' : 'Order Fulfillment & Client Requests'}
          </h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-container transition-opacity shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {isClient ? 'PLACE ORDER REQUEST' : 'CREATE NEW ORDER'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase">TOTAL ORDERS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface">{salesOrders.length}</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/40 p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase">PENDING WAREHOUSE APPROVAL</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700">
              {salesOrders.filter(o => o.status === 'PENDING_REVIEW').length}
            </span>
            <span className="text-xs text-amber-600 font-bold">Requires Review</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase">IN FULFILLMENT</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface">
              {salesOrders.filter(o => o.status === 'PICKING' || o.status === 'PACKING').length}
            </span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase">SHIPPED / DELIVERED</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface">
              {salesOrders.filter(o => o.status === 'SHIPPED' || o.status === 'COMPLETED').length}
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low gap-4">
          <div className="flex items-center gap-1">
            {['All Orders', 'Pending Review', 'PICKING', 'PACKING', 'SHIPPED', 'REJECTED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedStatus === tab
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Filter orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Items (Qty)</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-surface-500">No sales orders found</td>
                </tr>
              ) : filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-primary">{ord.orderNumber}</div>
                    {ord.poNumber && <div className="text-[10px] text-surface-500 mt-1">PO: {ord.poNumber}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">
                        {ord.client?.name ? ord.client.name.substring(0, 2).toUpperCase() : 'NA'}
                      </div>
                      <span className="font-semibold text-on-surface">{ord.client?.name || 'Unknown Client'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {ord.items && ord.items.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {ord.items.map(item => (
                          <span key={item.id} className="text-xs text-on-surface">
                            {item.product?.name || 'Unknown Product'} <span className="text-on-surface-variant font-bold">(x{item.quantity})</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant">No items</span>
                    )}
                    {ord.shippingAddress && (
                      <div className="mt-2 text-[10px] text-surface-600 border-t border-outline-variant pt-1">
                        <span className="font-bold">Ship To:</span> {ord.shippingAddress}
                      </div>
                    )}
                    {ord.notes && (
                      <div className="mt-1 text-[10px] text-surface-600">
                        <span className="font-bold text-amber-700">Note:</span> {ord.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-[11px] font-bold ${
                        ord.priority === 'URGENT'
                          ? 'bg-red-100 text-red-700'
                          : ord.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ord.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span
                        className={`inline-block w-max px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ord.status === 'PENDING_REVIEW'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : ord.status === 'SHIPPED' || ord.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : ord.status === 'PACKING'
                            ? 'bg-blue-100 text-blue-700'
                            : ord.status === 'PICKING'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ord.status.replace('_', ' ')}
                      </span>
                      {ord.status === 'REJECTED' && ord.rejectionReason && (
                        <span className="text-[10px] text-red-600 font-bold mt-1">Reason: {ord.rejectionReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ord.status === 'PENDING_REVIEW' && isManagerOrAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(ord.id, ord.orderNumber)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingOrder(ord)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-on-surface-variant font-medium">
                        {ord.status === 'SHIPPED' ? 'Fulfilling via Carrier' : (ord.status === 'REJECTED' ? 'Rejected' : 'Processing')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Order Request */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isClient ? 'Submit Sales Order Request' : 'Create Warehouse Sales Order'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Order Request'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <FormField label="Client Company / Account" required>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="">-- Select a Client --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Fulfillment Priority" required>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: 'NORMAL', label: 'NORMAL (Standard Shipping)' },
                { value: 'HIGH', label: 'HIGH (Priority Handling)' },
                { value: 'URGENT', label: 'URGENT (Same-Day Dispatch)' },
              ]}
            />
          </FormField>

          <FormField label="Product / Item" required>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            >
              <option value="">-- Select a Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku}) - {p.availableStock} in stock</option>
              ))}
            </select>
          </FormField>
          
          <FormField label="Quantity Requested" required>
            <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </FormField>
        </form>
      </Modal>

      {/* Rejection Reason Modal */}
      {rejectingOrder && (
        <Modal
          isOpen={!!rejectingOrder}
          onClose={() => setRejectingOrder(null)}
          title={`Reject Sales Order — ${rejectingOrder.orderNumber}`}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setRejectingOrder(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmReject} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Order Rejection'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <FormField label="Mandatory Rejection Justification Reason" required>
              <Select
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                options={[
                  'Stock unavailable for priority timeline',
                  'Credit limit exceeded',
                  'Incomplete shipping address details',
                  'Restricted item for client account',
                ]}
              />
            </FormField>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SalesOrdersPage;
