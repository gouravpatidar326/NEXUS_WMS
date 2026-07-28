import { useState, useEffect } from 'react';
import { Building2, Plus, QrCode, MapPin, Layers } from 'lucide-react';
import { warehouseService } from '@/services/warehouseService';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import PermissionGuard from '@/guards/PermissionGuard';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import QRScannerPlaceholder from '@/components/forms/QRScannerPlaceholder';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const WarehouseOpsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('locations');

  const [zone, setZone] = useState('Zone A - High Value');
  const [aisle, setAisle] = useState('A-05');
  const [rack, setRack] = useState('C');
  const [shelf, setShelf] = useState('1');
  const [capacity, setCapacity] = useState(150);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getLocations();
      setLocations(data);
    } catch {
      notifyError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await warehouseService.createLocation({
        zone,
        aisle,
        rack,
        shelf,
        capacity: Number(capacity),
        type: 'Standard Rack',
      });
      notifySuccess('Storage Bin Location provisioned.');
      setIsModalOpen(false);
      fetchLocations();
    } catch {
      notifyError('Failed to provision location');
    }
  };

  const columns = [
    {
      header: 'Bin Barcode ID',
      accessor: 'barcode',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1">
          <QrCode className="h-3.5 w-3.5" />
          {row.barcode}
        </span>
      ),
    },
    { header: 'Warehouse Zone', accessor: 'zone' },
    {
      header: 'Aisle / Rack / Shelf',
      accessor: 'aisle',
      cell: (row) => (
        <span className="font-mono text-xs">
          Aisle {row.aisle} &rarr; Rack {row.rack} &rarr; Shelf {row.shelf}
        </span>
      ),
    },
    { header: 'Storage Type', accessor: 'type' },
    {
      header: 'Capacity Utilization',
      accessor: 'occupied',
      cell: (row) => (
        <div className="space-y-1 w-36">
          <div className="flex justify-between text-xs font-mono">
            <span>{row.occupied}/{row.capacity}</span>
            <span>{Math.round((row.occupied / row.capacity) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                row.occupied / row.capacity > 0.9 ? 'bg-danger-500' : 'bg-primary-600'
              }`}
              style={{ width: `${(row.occupied / row.capacity) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Bin Status',
      accessor: 'status',
      cell: (row) => {
        const variant = row.status === 'Active' ? 'success' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse Operations & Bins"
        description="Zone layouts, bin location capacity control, and barcode scanner verification"
        breadcrumbs={[{ label: 'Operations & Logistics' }, { label: 'Warehouse Bins' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.WAREHOUSE_MANAGE}>
            <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
              Provision Storage Bin
            </Button>
          </PermissionGuard>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[
          { name: 'East Coast Fulfillment Hub', meta: '24 loading bays · 82% capacity', image: '/images/wms/warehouse-east-hub.jpg', status: 'Operational' },
          { name: 'Automated Storage & Retrieval', meta: 'Robotic zone · Live telemetry', image: '/images/wms/warehouse-automation.jpg', status: 'Online' },
        ].map((hub) => (
          <article key={hub.name} className="group relative min-h-48 overflow-hidden rounded-2xl border border-surface-200 bg-surface-900 shadow-sm">
            <img src={hub.image} alt={`${hub.name} warehouse facility`} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
            <div className="relative flex min-h-48 flex-col justify-between p-5 text-white">
              <span className="self-end rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur-md">● {hub.status}</span>
              <div><h3 className="text-lg font-bold">{hub.name}</h3><p className="mt-1 text-xs text-white/80">{hub.meta}</p></div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-surface-200 dark:border-surface-800 sm:flex sm:gap-4">
        <button
          onClick={() => setActiveTab('locations')}
          className={`min-w-0 whitespace-normal pb-2 text-xs font-semibold leading-4 transition border-b-2 sm:text-sm ${
            activeTab === 'locations'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Bin Locations Ledger
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`min-w-0 whitespace-normal pb-2 text-xs font-semibold leading-4 transition border-b-2 sm:text-sm ${
            activeTab === 'scanner'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Live Camera QR/Bin Scanner
        </button>
      </div>

      {activeTab === 'locations' ? (
        <DataTable columns={columns} data={locations} isLoading={loading} />
      ) : (
        <div className="py-6">
          <QRScannerPlaceholder
            onScanComplete={(code) =>
              notifySuccess(`Scanned location bin code: ${code}. Bin verified!`)
            }
          />
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Bin Storage Location"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateLocation}>
              Save Bin Location
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <FormField label="Warehouse Zone" required>
            <Select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              options={['Zone A - High Value', 'Zone B - Bulk Storage', 'Zone C - Cold Storage', 'Zone D - Hazardous']}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField label="Aisle" required>
              <Input value={aisle} onChange={(e) => setAisle(e.target.value)} placeholder="A-05" />
            </FormField>
            <FormField label="Rack" required>
              <Input value={rack} onChange={(e) => setRack(e.target.value)} placeholder="C" />
            </FormField>
            <FormField label="Shelf" required>
              <Input value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder="1" />
            </FormField>
          </div>

          <FormField label="Max Capacity (Units)" required>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default WarehouseOpsPage;
