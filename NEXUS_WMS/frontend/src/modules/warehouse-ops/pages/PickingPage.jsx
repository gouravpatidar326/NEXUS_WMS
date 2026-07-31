import { useState, useEffect } from 'react';
import { QrCode, CheckCircle } from 'lucide-react';
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
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/permissions/permissionUtils';

export const PickingPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { user } = useAuth();
  const canExecutePick = hasPermission(user, PERMISSIONS.PICKING_EXECUTE);
  const [pickLists, setPickLists] = useState([]);
  const [loadingPickLists, setLoadingPickLists] = useState(true);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedPickList, setSelectedPickList] = useState(null);
  const [activeTab, setActiveTab] = useState('pick-lists');

  const fetchPickLists = async () => {
    setLoadingPickLists(true);
    try {
      const data = await warehouseService.getPickLists();
      setPickLists(data);
    } catch {
      notifyError('Failed to load pick lists');
    } finally {
      setLoadingPickLists(false);
    }
  };

  useEffect(() => {
    fetchPickLists();
  }, []);

  const handleFulfillPickList = async (e) => {
    e.preventDefault();
    if (!selectedPickList) return;
    try {
      const payload = {
        items: selectedPickList.items.map(item => ({
          pickListItemId: item.id,
          pickedQuantity: item.targetQuantity
        }))
      };
      await warehouseService.completePick(selectedPickList.id, payload);
      notifySuccess('Pick list fulfilled successfully!');
      setIsFulfillModalOpen(false);
      setSelectedPickList(null);
      fetchPickLists();
    } catch (err) {
      notifyError('Failed to fulfill pick list');
    }
  };

  const pickListColumns = [
    {
      header: 'Pick List ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600">
          PL-{row.id.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Order Ref',
      accessor: 'orderId',
      cell: (row) => (
        <span className="font-mono text-xs text-surface-500">
          {row.orderId.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Total Items',
      accessor: 'items',
      cell: (row) => <span>{row.items?.length || 0} items</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const variant = row.status === 'COMPLETED' ? 'success' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && canExecutePick && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedPickList(row);
                setIsFulfillModalOpen(true);
              }}
            >
              Fulfill
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Picking & Fulfillment"
        description="Fulfill pick lists and prepare orders for packing"
        breadcrumbs={[{ label: 'Operations & Logistics' }, { label: 'Picking' }]}
      />

      {!canExecutePick && (
        <ReadOnlyBanner />
      )}

      <div className="grid grid-cols-2 gap-2 border-b border-surface-200 dark:border-surface-800 sm:flex sm:gap-4">
        <button
          onClick={() => setActiveTab('pick-lists')}
          className={`min-w-0 whitespace-normal pb-2 text-xs font-semibold leading-4 transition border-b-2 sm:text-sm ${
            activeTab === 'pick-lists'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-surface-500 hover:text-surface-800'
          }`}
        >
          Pending Pick Lists
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

      {activeTab === 'pick-lists' ? (
        <DataTable columns={pickListColumns} data={pickLists} isLoading={loadingPickLists} />
      ) : (
        <div className="py-6">
          <QRScannerPlaceholder
            onScanComplete={(code) =>
              notifySuccess(`Scanned bin code: ${code}. Verified for picking!`)
            }
          />
        </div>
      )}

      {/* Fulfill Pick List Modal */}
      <Modal
        isOpen={isFulfillModalOpen}
        onClose={() => {
          setIsFulfillModalOpen(false);
          setSelectedPickList(null);
        }}
        title="Fulfill Pick List"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFulfillModalOpen(false)}>
              Cancel
            </Button>
            {canExecutePick && (
              <Button variant="primary" leftIcon={CheckCircle} onClick={handleFulfillPickList}>
                Complete Pick
              </Button>
            )}
          </>
        }
      >
        {selectedPickList && (
          <div className="space-y-4">
            <p className="text-sm text-surface-500">
              Please verify the items and quantities below before marking the pick list as completed.
            </p>
            <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
                  <tr>
                    <th className="px-4 py-2">SKU</th>
                    <th className="px-4 py-2">Bin Location</th>
                    <th className="px-4 py-2 text-right">Target Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-700 bg-white dark:bg-surface-900">
                  {selectedPickList.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">
                        {item.product?.sku || item.productId}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{item.binLocation}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.targetQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PickingPage;
