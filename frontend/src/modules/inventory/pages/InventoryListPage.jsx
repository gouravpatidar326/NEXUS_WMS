import { useState, useEffect } from 'react';
import { ArrowUpDown, RefreshCw, Download, Plus } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { productService } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import PermissionGuard from '@/guards/PermissionGuard';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import SearchBar from '@/components/forms/SearchBar';
import FilterPanel from '@/components/forms/FilterPanel';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const InventoryListPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Adjustment Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical Stock Count Discrepancy');
  const [submitting, setSubmitting] = useState(false);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getMovements({
        search,
        type: typeFilter,
        page: currentPage,
        pageSize,
      });
      setMovements(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err) {
      notifyError('Failed to load inventory movements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [search, typeFilter, currentPage, pageSize]);

  const handleOpenAdjustModal = async () => {
    try {
      const res = await productService.getProducts({ pageSize: 100 });
      setProductsList(res.items);
      if (res.items.length > 0) setSelectedProductId(res.items[0].id);
      setIsAdjustModalOpen(true);
    } catch {
      notifyError('Failed to load products list');
    }
  };

  const handleConfirmAdjustment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const targetProduct = productsList.find((p) => p.id === selectedProductId);
      await inventoryService.adjustStock({
        productId: selectedProductId,
        productName: targetProduct?.name || 'Selected Product',
        sku: targetProduct?.sku || 'SKU-000',
        quantity: adjustQty,
        reason: adjustReason,
        user,
      });
      notifySuccess(`Stock adjusted by ${adjustQty > 0 ? '+' : ''}${adjustQty} units.`);
      setIsAdjustModalOpen(false);
      fetchMovements();
    } catch (err) {
      notifyError('Stock adjustment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Movement ID',
      accessor: 'id',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Product Details',
      accessor: 'productName',
      cell: (row) => (
        <div>
          <span className="font-semibold text-surface-900 dark:text-surface-100 block">
            {row.productName}
          </span>
          <span className="text-xs font-mono text-surface-400">{row.sku}</span>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      accessor: 'type',
      cell: (row) => {
        const variant =
          row.type === 'Inbound Receipt'
            ? 'success'
            : row.type === 'Stock Adjustment'
            ? 'warning'
            : 'info';
        return <Badge variant={variant}>{row.type}</Badge>;
      },
    },
    {
      header: 'Quantity Delta',
      accessor: 'quantity',
      cell: (row) => (
        <span
          className={`font-bold font-mono ${
            row.quantity > 0 ? 'text-success-600' : 'text-danger-600'
          }`}
        >
          {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
        </span>
      ),
    },
    {
      header: 'Source -> Destination',
      accessor: 'sourceLocation',
      cell: (row) => (
        <div className="text-xs text-surface-600 dark:text-surface-300">
          <span>{row.sourceLocation}</span> &rarr; <strong>{row.destLocation}</strong>
        </div>
      ),
    },
    { header: 'Reason / Ref', accessor: 'reason' },
    { header: 'Logged By', accessor: 'performedBy' },
    { header: 'Timestamp', accessor: 'timestamp', cell: (row) => <span className="text-xs text-surface-400">{row.timestamp}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Inventory & Movements"
        description="Real-time stock ledger, physical stock counts, and movement tracking"
        breadcrumbs={[{ label: 'Inventory & Stock' }, { label: 'Stock Inventory' }]}
        actions={
          <div className="flex items-center gap-2">
            <PermissionGuard permission={PERMISSIONS.INVENTORY_EXPORT}>
              <Button
                variant="outline"
                leftIcon={Download}
                onClick={() => notifySuccess('Exporting movement ledger...')}
              >
                Export Ledger
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.INVENTORY_ADJUST}>
              <Button
                variant="primary"
                leftIcon={ArrowUpDown}
                onClick={handleOpenAdjustModal}
              >
                Adjust Stock
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search movements by product, SKU, or reason..."
        />
        <FilterPanel
          isOpen={filterPanelOpen}
          onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
          values={{ type: typeFilter }}
          onChange={(key, val) => setTypeFilter(val)}
          onReset={() => setTypeFilter('')}
          filters={[
            {
              key: 'type',
              label: 'Movement Type',
              type: 'select',
              options: ['Inbound Receipt', 'Stock Adjustment', 'Pick Order', 'Transfer'],
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={movements}
        isLoading={loading}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Record Stock Adjustment"
        subtitle="Post positive or negative inventory delta with audit justification"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmAdjustment}
              isLoading={submitting}
            >
              Post Stock Delta
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmAdjustment} className="space-y-4">
          <FormField label="Target Product SKU" required>
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={productsList.map((p) => ({
                value: p.id,
                label: `${p.sku} — ${p.name} (Current: ${p.availableStock || 0})`,
              }))}
            />
          </FormField>

          <FormField label="Quantity Adjustment (+/- Delta)" required hint="Use positive number to add stock, negative number to reduce stock">
            <Input
              type="number"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              placeholder="e.g. -5 or 25"
              required
            />
          </FormField>

          <FormField label="Adjustment Reason / Justification" required>
            <Select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              options={[
                'Physical Stock Count Discrepancy',
                'Damaged During Transport',
                'Expired Stock Removal',
                'Unrecorded Dock Receipt',
                'Quality Inspection Hold',
              ]}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryListPage;
