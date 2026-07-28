import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
import { ROLES } from '@/permissions/roles';
import { useNotification } from '@/contexts/NotificationContext';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export const SalesOrdersPage = () => {
  const { user } = useAuth();
  const { salesOrders, approveSalesOrder, rejectSalesOrder, createSalesOrder } = useWmsStore();
  const { notifySuccess, notifyError } = useNotification();

  const isClient = user?.role === ROLES.CLIENT;
  const isManagerOrAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.WAREHOUSE_MANAGER;

  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('Stock unavailable for priority timeline');

  // Form state
  const [clientName, setClientName] = useState(isClient ? (user?.name || 'Acme Corp') : 'GlobalTech Corp');
  const [priority, setPriority] = useState('NORMAL');
  const [skusRequested, setSkusRequested] = useState('SKU-8821 (100 units)');

  // Filter orders strictly by client account if logged in as Client
  const userOrders = isClient
    ? salesOrders.filter(so => (so.clientEmail && so.clientEmail.toLowerCase() === (user?.email || '').toLowerCase()) || (user?.company && so.client.toLowerCase() === user.company.toLowerCase()))
    : salesOrders;

  const filteredOrders = userOrders.filter((ord) => {
    const matchesStatus =
      selectedStatus === 'All Orders' ||
      (selectedStatus === 'Pending Review' && ord.status === 'Pending Review') ||
      ord.status === selectedStatus;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrd = {
      id: `so_${Date.now()}`,
      orderNumber: `SO-2023-${Math.floor(1000 + Math.random() * 9000)}`,
      client: clientName,
      clientEmail: user?.email || 'sam@acmecorp.com',
      clientCode: clientName.slice(0, 2).toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      itemsCount: 2,
      totalVal: '$3,450.00',
      priority,
      status: 'Pending Review',
      rejectionReason: '',
    };
    createSalesOrder(newOrd);
    notifySuccess(`Order request ${newOrd.orderNumber} submitted for warehouse review!`);
    setIsModalOpen(false);
  };

  const handleApprove = (orderId, orderNum) => {
    approveSalesOrder(orderId);
    notifySuccess(`Order ${orderNum} Approved! Allocated to Picking Queue & stock committed.`);
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;

    rejectSalesOrder(rejectingOrder.id, rejectionReasonText);
    notifyError(`Order ${rejectingOrder.orderNumber} Rejected by Warehouse Ops.`);
    setRejectingOrder(null);
  };

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
            <span className="text-2xl font-bold text-on-surface">{userOrders.length}</span>
            <span className="text-xs text-green-600 font-bold">+12%</span>
          </div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/40 p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-amber-800 uppercase">PENDING WAREHOUSE APPROVAL</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700">
              {userOrders.filter(o => o.status === 'Pending Review').length}
            </span>
            <span className="text-xs text-amber-600 font-bold">Requires Review</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase">IN FULFILLMENT</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface">
              {userOrders.filter(o => o.status === 'Picking' || o.status === 'Packing').length}
            </span>
            <span className="text-xs text-primary font-bold">+8%</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-5 rounded-xl flex flex-col gap-1 shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase">SHIPPED / DELIVERED</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-on-surface">
              {userOrders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length}
            </span>
            <span className="text-xs text-green-600 font-bold">+21%</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-outline-variant bg-surface-container-low gap-4">
          <div className="flex items-center gap-1">
            {['All Orders', 'Pending Review', 'Picking', 'Packing', 'Shipped', 'Rejected'].map((tab) => (
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
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{ord.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container">
                        {ord.clientCode}
                      </div>
                      <span className="font-semibold text-on-surface">{ord.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant text-xs">{ord.date}</td>
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
                          ord.status === 'Pending Review'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : ord.status === 'Shipped'
                            ? 'bg-green-100 text-green-700'
                            : ord.status === 'Packing'
                            ? 'bg-blue-100 text-blue-700'
                            : ord.status === 'Picking'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {ord.status}
                      </span>
                      {ord.status === 'Rejected' && ord.rejectionReason && (
                        <span className="text-[10px] text-red-600 font-bold mt-1">Reason: {ord.rejectionReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ord.status === 'Pending Review' && isManagerOrAdmin ? (
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
                        {ord.status === 'Shipped' ? 'Fulfilling via Carrier' : 'Processing'}
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
            <Button variant="primary" onClick={handleCreateOrder}>
              Submit Order Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <FormField label="Client Company / Account" required>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} required />
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

          <FormField label="Requested Items & Quantities" required>
            <textarea
              value={skusRequested}
              onChange={(e) => setSkusRequested(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-outline-variant rounded-lg text-xs font-mono focus:border-primary focus:outline-none"
              required
            />
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
              <Button variant="danger" onClick={handleConfirmReject}>
                Confirm Order Rejection
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
