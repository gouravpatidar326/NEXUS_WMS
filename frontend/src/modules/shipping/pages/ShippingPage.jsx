import { useState, useEffect } from 'react';
import { Send, Plus, Truck, ExternalLink } from 'lucide-react';
import { shippingService } from '@/services/shippingService';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import PermissionGuard from '@/guards/PermissionGuard';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const ShippingPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [carrier, setCarrier] = useState('FedEx Freight');
  const [orderId, setOrderId] = useState('SO-4021');
  const [recipient, setRecipient] = useState('Acme Corp');
  const [destination, setDestination] = useState('Dallas, TX');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await shippingService.getShipments();
      setShipments(data);
    } catch {
      notifyError('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      await shippingService.createShipment({
        carrier,
        orderId,
        recipient,
        destination,
      });
      notifySuccess('Shipping label generated & dispatch queued.');
      setIsModalOpen(false);
      fetchShipments();
    } catch {
      notifyError('Shipment creation failed');
    }
  };

  const columns = [
    {
      header: 'Tracking Number',
      accessor: 'trackingNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
          <Truck className="h-3.5 w-3.5" />
          {row.trackingNumber}
        </span>
      ),
    },
    { header: 'Carrier Partner', accessor: 'carrier' },
    { header: 'Order Ref', accessor: 'orderId' },
    { header: 'Recipient', accessor: 'recipient' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Est. Delivery', accessor: 'estimatedDelivery' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const variant = row.status === 'In Transit' ? 'success' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipping & Carrier Logistics"
        description="Carrier API dispatch, tracking label generation, and transport monitoring"
        breadcrumbs={[{ label: 'Operations & Logistics' }, { label: 'Shipping & Carriers' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.SHIPPING_CREATE}>
            <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
              Generate Shipping Label
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable columns={columns} data={shipments} isLoading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Dispatch & Carrier Label"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateShipment}>
              Print Carrier Label & Dispatch
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateShipment} className="space-y-4">
          <FormField label="Carrier Service" required>
            <Select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              options={['FedEx Freight', 'UPS Express', 'DHL Supply Chain', 'XPO Logistics']}
            />
          </FormField>

          <FormField label="Target Sales Order Ref" required>
            <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </FormField>

          <FormField label="Recipient Name" required>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          </FormField>

          <FormField label="Destination Address" required>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default ShippingPage;
