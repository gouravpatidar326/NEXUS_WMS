import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus } from 'lucide-react';

export const TransferOrdersPage = () => {
  const { user } = useAuth();
  const { transferOrders, lots, createTransferOrder, dispatchTransferOrder, receiveTransferOrder } = useWmsStore();
  const { notifySuccess, notifyError } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [sourceCompany, setSourceCompany] = useState('GlobalTech Corp');
  const [destCompany, setDestCompany] = useState('Apex Logistics LLC');
  const [sourceWarehouse, setSourceWarehouse] = useState('Logistics Hub East (NJ)');
  const [destWarehouse, setDestWarehouse] = useState('Rotterdam Prime (NL)');
  const [selectedLotId, setSelectedLotId] = useState(lots[0]?.lotId || 'LOT-88219');
  const [qty, setQty] = useState(50);

  const selectedLotObj = lots.find(l => l.lotId === selectedLotId) || lots[0];

  const handleCreateTO = (e) => {
    e.preventDefault();

    if (Number(qty) > (selectedLotObj?.qty || 0)) {
      notifyError(`Cannot transfer ${qty} units! Maximum available stock in Lot ${selectedLotId} is ${selectedLotObj?.qty || 0} units.`);
      return;
    }

    const newTO = {
      id: `to_${Date.now()}`,
      toNumber: `TO-2023-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceCompany,
      destCompany,
      sourceWarehouse,
      destWarehouse,
      productId: selectedLotObj?.productId || 'prd_1',
      productName: selectedLotObj?.productName || 'Steel Coil',
      lotId: selectedLotId,
      qty: Number(qty),
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
    };
    createTransferOrder(newTO);
    notifySuccess(`Transfer Order ${newTO.toNumber} created!`);
    setIsModalOpen(false);
  };

  const handleDispatch = (toId, toNumber) => {
    dispatchTransferOrder(toId);
    notifySuccess(`Transfer ${toNumber} Dispatched! Stock deducted from origin lot.`);
  };

  const handleReceive = (toId, toNumber) => {
    receiveTransferOrder(toId);
    notifySuccess(`Transfer ${toNumber} Received! Stock credited to destination facility.`);
  };

  const columns = [
    {
      header: 'TO Reference',
      accessor: 'toNumber',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
          {row.toNumber}
        </span>
      ),
    },
    {
      header: 'Source (Company / Hub)',
      accessor: 'sourceWarehouse',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{row.sourceCompany}</span>
          <span className="text-slate-500 font-mono">{row.sourceWarehouse}</span>
        </div>
      ),
    },
    {
      header: 'Destination (Company / Hub)',
      accessor: 'destWarehouse',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">{row.destCompany}</span>
          <span className="text-slate-500 font-mono">{row.destWarehouse}</span>
        </div>
      ),
    },
    {
      header: 'Product & Lot',
      accessor: 'productName',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-900 block">{row.productName}</span>
          <span className="font-mono text-primary font-bold">{row.lotId}</span>
        </div>
      ),
    },
    { header: 'Transfer Qty', accessor: 'qty', cell: (row) => <span className="font-mono font-bold">{row.qty} Units</span> },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const variant = row.status === 'Received' ? 'success' : row.status === 'In Transit' ? 'info' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'Submitted' && (
            <button
              onClick={() => handleDispatch(row.id, row.toNumber)}
              className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Dispatch & Deduct Stock
            </button>
          )}
          {row.status === 'In Transit' && (
            <button
              onClick={() => handleReceive(row.id, row.toNumber)}
              className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors cursor-pointer"
            >
              Receive & Credit Stock
            </button>
          )}
          {row.status === 'Received' && (
            <span className="text-xs font-bold text-emerald-600">✓ Completed</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Cross-Company & Multi-Warehouse Transfer Orders"
        description="Inter-company stock transfers, origin inventory deduction, destination credit, and lot movement history"
        breadcrumbs={[{ label: 'Order Management' }, { label: 'Transfer Orders' }]}
        actions={
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsModalOpen(true)}>
            Initiate Cross-Company Transfer
          </Button>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={transferOrders} />
      </div>

      {/* New Cross-Company Transfer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Inter-Company / Inter-Facility Transfer"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateTO}>
              Create Transfer Order
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTO} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Source Company Owner" required>
              <Select
                value={sourceCompany}
                onChange={(e) => setSourceCompany(e.target.value)}
                options={['GlobalTech Corp', 'Acme Corp', 'Apex Logistics LLC', 'Zenith Retailers']}
              />
            </FormField>

            <FormField label="Destination Company Owner" required>
              <Select
                value={destCompany}
                onChange={(e) => setDestCompany(e.target.value)}
                options={['Apex Logistics LLC', 'Zenith Retailers', 'Acme Corp', 'GlobalTech Corp']}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Source Warehouse Origin" required>
              <Select
                value={sourceWarehouse}
                onChange={(e) => setSourceWarehouse(e.target.value)}
                options={['Logistics Hub East (NJ)', 'Singapore Central (SG)', 'Rotterdam Prime (NL)', 'Tokyo Alpha (JP)']}
              />
            </FormField>

            <FormField label="Destination Warehouse Target" required>
              <Select
                value={destWarehouse}
                onChange={(e) => setDestWarehouse(e.target.value)}
                options={['Rotterdam Prime (NL)', 'Tokyo Alpha (JP)', 'Logistics Hub East (NJ)', 'Singapore Central (SG)']}
              />
            </FormField>
          </div>

          <FormField label="Source Lot & Product Allotment" required hint={`Max available in Lot ${selectedLotId}: ${selectedLotObj?.qty || 0} units`}>
            <Select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              options={lots.map(l => ({
                value: l.lotId,
                label: `${l.lotId} — ${l.productName} (${l.qty} available at ${l.location})`,
              }))}
            />
          </FormField>

          <FormField label="Transfer Quantity" required>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} required />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default TransferOrdersPage;
