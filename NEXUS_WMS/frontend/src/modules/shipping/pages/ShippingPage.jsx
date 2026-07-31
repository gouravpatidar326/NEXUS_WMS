import { useState, useEffect } from 'react';
import { Send, Plus, Truck, ExternalLink, Trash2, PackageCheck } from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { salesOrderService } from '@/services/salesOrderService';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import PermissionGuard from '@/guards/PermissionGuard';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/permissions/permissionUtils';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';

export const ShippingPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { user } = useAuth();
  const canExecuteShipping = hasPermission(user, PERMISSIONS.SHIPPING_EXECUTE);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carrierOptions, setCarrierOptions] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);

  // Form States
  const [carrier, setCarrier] = useState('UPS Express');
  const [orderId, setOrderId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('5.5');
  const [shippingSpeed, setShippingSpeed] = useState('Express 2-Day');
  const [trackingNumber, setTrackingNumber] = useState(`SS-TRACK-${Math.floor(10000 + Math.random() * 90000)}`);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [numberOfPackages, setNumberOfPackages] = useState('1');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteShipState, setDeleteShipState] = useState({ isOpen: false, id: null, tracking: '' });

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [shipmentsData, carriersData, salesOrdersData] = await Promise.all([
        shippingService.getShipments(),
        shippingService.getCarriers(),
        salesOrderService.fetchSalesOrders()
      ]);
      setShipments(Array.isArray(shipmentsData) ? shipmentsData : shipmentsData.items || []);
      setCarrierOptions(Array.isArray(carriersData) ? carriersData : []);
      setSalesOrders(Array.isArray(salesOrdersData) ? salesOrdersData : salesOrdersData.items || []);
      
      if (carriersData && carriersData.length > 0) {
        setCarrier(typeof carriersData[0] === 'string' ? carriersData[0] : carriersData[0].value || 'UPS Express');
      }
    } catch {
      notifyError('Failed to load shipping data');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipments = async () => {
    try {
      const data = await shippingService.getShipments();
      setShipments(Array.isArray(data) ? data : data.items || []);
    } catch {
      notifyError('Failed to load shipments');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenCreateModal = () => {
    setTrackingNumber(`SS-TRACK-${Math.floor(10000 + Math.random() * 90000)}`);
    if (salesOrders.length > 0) {
      const firstOrder = salesOrders[0];
      setOrderId(firstOrder.id);
      setRecipient(firstOrder.client?.name || 'Acme Logistics Facility');
      setDestination(firstOrder.client?.name ? `${firstOrder.client.name} Warehouse, Hub 4` : 'Austin, TX');
    }
    setIsModalOpen(true);
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    if (!carrier || !recipient || !destination) {
      notifyError('Carrier, Recipient, and Destination Address are required');
      return;
    }

    setSubmitting(true);
    try {
      await shippingService.createShipment({
        carrier,
        orderId,
        recipient,
        destination,
        weight: `${weight} lbs`,
        shippingSpeed,
        trackingNumber,
        expectedDeliveryDate,
        numberOfPackages,
        specialInstructions,
      });
      notifySuccess(`Shipping Label generated for ${carrier} (${trackingNumber}). Dispatch queued.`);
      setIsModalOpen(false);
      fetchShipments();
    } catch {
      notifyError('Shipment creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShipment = (shipment) => {
    setDeleteShipState({ isOpen: true, id: shipment.id, tracking: shipment.trackingNumber });
  };

  const confirmDeleteShipment = async () => {
    if (!deleteShipState.id) return;
    try {
      await shippingService.deleteShipment(deleteShipState.id);
      notifySuccess(`Shipment label ${deleteShipState.tracking} cancelled.`);
      setDeleteShipState({ isOpen: false, id: null, tracking: '' });
      fetchShipments();
    } catch {
      notifyError('Failed to delete shipment');
    }
  };

  const formattedCarrierOptions = carrierOptions.map((c) =>
    typeof c === 'string' ? { value: c, label: c } : c
  );

  const columns = [
    {
      header: 'Tracking Number & Barcode',
      accessor: 'trackingNumber',
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {row.trackingNumber}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">ShipStation API Sync</span>
        </div>
      ),
    },
    { header: 'Carrier Partner', accessor: 'carrier' },
    { header: 'Order Ref', accessor: 'orderId' },
    { header: 'Recipient', accessor: 'recipient' },
    { header: 'Destination Address', accessor: 'destination' },
    { header: 'Est. Delivery', accessor: 'estimatedDelivery' },
    {
      header: 'Dispatch Status',
      accessor: 'status',
      cell: (row) => {
        const variant = row.status === 'In Transit' || row.status === 'SHIPPED' ? 'success' : 'warning';
        return <Badge variant={variant}>{row.status || 'LABEL_CREATED'}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <PermissionGuard permission={PERMISSIONS.SHIPPING_DELETE}>
          <button
            onClick={() => handleDeleteShipment(row)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Cancel Dispatch Label"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping & Carrier Logistics"
        description="ShipStation API carrier integration, tracking barcode label dispatch, and real-time fleet monitoring"
        breadcrumbs={[{ label: 'Operations & Logistics' }, { label: 'Shipping & Carriers' }]}
        actions={
          canExecuteShipping ? (
            <Button variant="primary" leftIcon={Plus} onClick={handleOpenCreateModal}>
              Generate Shipping Label
            </Button>
          ) : null
        }
      />

      {!canExecuteShipping && (
        <ReadOnlyBanner />
      )}

      <DataTable columns={columns} data={shipments} isLoading={loading} emptyMessage="No shipping dispatch labels created yet." />

      {/* Shipping Dispatch & Label Generation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Dispatch & Carrier Label"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateShipment} isLoading={submitting}>
              Print Carrier Label & Dispatch
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateShipment} className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <span>📦 ShipStation API Barcode & Tracking Link Ready</span>
            <span className="font-mono font-bold">{trackingNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Carrier Service Partner" required>
              <Select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                options={
                  formattedCarrierOptions.length > 0
                    ? formattedCarrierOptions
                    : [
                        { value: 'UPS Express', label: 'UPS Express' },
                        { value: 'FedEx Freight', label: 'FedEx Freight' },
                        { value: 'DHL Supply Chain', label: 'DHL Supply Chain' },
                        { value: 'XPO Logistics', label: 'XPO Logistics' },
                        { value: 'Blue Dart', label: 'Blue Dart' },
                        { value: 'Delhivery', label: 'Delhivery' },
                      ]
                }
              />
            </FormField>

            <FormField label="Shipping Priority & Speed">
              <Select
                value={shippingSpeed}
                onChange={(e) => setShippingSpeed(e.target.value)}
                options={[
                  { value: 'Overnight Air', label: 'Overnight Priority Air' },
                  { value: 'Express 2-Day', label: 'Express 2-Day Air' },
                  { value: 'Standard Ground', label: 'Standard Ground Freight' },
                  { value: 'Economy', label: 'Economy Surface Shipping' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Target Sales Order Reference" required>
            <Select
              value={orderId}
              onChange={(e) => {
                const selectedOrderId = e.target.value;
                setOrderId(selectedOrderId);
                const order = salesOrders.find((o) => o.id === selectedOrderId);
                if (order) {
                  setRecipient(order.client?.name || 'Client Facility');
                  setDestination(order.client?.name ? `${order.client.name} Warehouse, Logistics Hub` : 'Main Facility');
                }
              }}
              options={
                salesOrders.length > 0
                  ? salesOrders
                      .filter((o) => ['PICKED', 'READY_TO_SHIP', 'PACKING'].includes(o.status))
                      .map((o) => ({
                        value: o.id,
                        label: `${o.orderNumber || o.id} - ${o.client?.name || 'Client'} (${o.status || 'READY'})`,
                      }))
                  : [{ value: 'SO-1001', label: 'SO-1001 - Acme Corp (PICKED)' }]
              }
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Recipient Contact / Client" required>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Acme Logistics Corp" required />
            </FormField>
            <FormField label="Package Gross Weight (lbs)">
              <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="5.5" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Expected Delivery Date" required>
              <Input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} required />
            </FormField>
            <FormField label="Number of Packages" required>
              <Input type="number" min="1" value={numberOfPackages} onChange={(e) => setNumberOfPackages(e.target.value)} required />
            </FormField>
          </div>

          <FormField label="Destination Shipping Address" required>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="123 Distribution Way, Building B, Austin TX 78701" required />
          </FormField>

          <FormField label="Special Instructions (Optional)">
            <Input value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} placeholder="e.g. Fragile, Handle with care..." />
          </FormField>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteShipState.isOpen}
        onClose={() => setDeleteShipState({ isOpen: false, id: null, tracking: '' })}
        onConfirm={confirmDeleteShipment}
        title="Cancel Dispatch Label"
        message={`Are you sure you want to cancel and delete shipping label "${deleteShipState.tracking}"?`}
        confirmText="Yes, Cancel Label"
        variant="danger"
      />
    </div>
  );
};

export default ShippingPage;
