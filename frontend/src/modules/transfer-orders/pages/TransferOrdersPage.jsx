import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { transferOrdersService } from '@/services/transferOrdersService';
import { productService } from '@/services/productService';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, ArrowRightLeft, RefreshCw } from 'lucide-react';

export const TransferOrdersPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  // Data state — all from real backend
  const [transferOrders, setTransferOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Derived: selected product's available stock for hint
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const destinationCompanies = companies.filter((c) => c.id !== user?.companyId);

  // Fetch all transfer orders from DB
  const fetchTransferOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await transferOrdersService.getTransferOrders();
      setTransferOrders(data);
    } catch (err) {
      notifyError('Failed to load transfer orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products and companies for the form dropdowns
  const fetchFormData = useCallback(async () => {
    try {
      const [productsRes, companiesData] = await Promise.all([
        productService.getProducts({ pageSize: 100 }),
        transferOrdersService.getCompanies(),
      ]);
      setProducts(productsRes.items || []);
      setCompanies(companiesData || []);

      // Pre-select first values
      if (productsRes.items?.length > 0) setSelectedProductId(productsRes.items[0].id);
      const dests = (companiesData || []).filter((c) => c.id !== user?.companyId);
      if (dests.length > 0) setSelectedCompanyId(dests[0].id);
    } catch (err) {
      notifyError('Failed to load form data');
    }
  }, [user?.companyId]);

  useEffect(() => {
    fetchTransferOrders();
  }, [fetchTransferOrders]);

  const handleOpenModal = async () => {
    await fetchFormData();
    setIsModalOpen(true);
  };

  const handleCreateTO = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !selectedCompanyId || quantity <= 0) {
      notifyError('Please fill in all required fields with valid values.');
      return;
    }

    if (selectedProduct && quantity > selectedProduct.availableStock) {
      notifyError(
        `Cannot transfer ${quantity} units. Only ${selectedProduct.availableStock} units available.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const newTO = await transferOrdersService.createTransferOrder({
        destinationCompanyId: selectedCompanyId,
        productId: selectedProductId,
        quantity: Number(quantity),
      });

      // Prepend newly created order to the list
      setTransferOrders((prev) => [newTO, ...prev]);
      notifySuccess(`Transfer Order created! ${quantity} units of "${selectedProduct?.name}" dispatched.`);
      setIsModalOpen(false);
      setQuantity(1);
    } catch (err) {
      notifyError(err.message || 'Failed to create transfer order');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'PENDING':   return 'warning';
      case 'CANCELLED': return 'danger';
      default:          return 'info';
    }
  };

  const columns = [
    {
      header: 'TO Reference',
      accessor: 'id',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
          TO-{row.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Source Company',
      accessor: 'sourceCompany',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-surface-800 dark:text-surface-100 block">
            {row.sourceCompany?.name || '—'}
          </span>
          <span className="text-surface-400 font-mono">Source</span>
        </div>
      ),
    },
    {
      header: 'Destination Company',
      accessor: 'destinationCompany',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-bold text-surface-800 dark:text-surface-100 block">
            {row.destinationCompany?.name || '—'}
          </span>
          <span className="text-surface-400 font-mono">Destination</span>
        </div>
      ),
    },
    {
      header: 'Product',
      accessor: 'product',
      cell: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-surface-900 dark:text-surface-100 block">
            {row.product?.name || '—'}
          </span>
          <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">
            {row.product?.sku || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Qty Transferred',
      accessor: 'quantity',
      cell: (row) => (
        <span className="font-mono font-bold text-surface-800 dark:text-surface-100">
          {row.quantity} Units
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-surface-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Cross-Company Transfer Orders"
        description="Inter-company stock transfers with real-time inventory deduction and destination credit"
        breadcrumbs={[{ label: 'Order Management' }, { label: 'Transfer Orders' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              leftIcon={RefreshCw}
              onClick={fetchTransferOrders}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={handleOpenModal}>
              Initiate Transfer
            </Button>
          </div>
        }
      />

      <div className="flex-1">
        {transferOrders.length === 0 && !loading ? (
          <div className="card p-12 text-center">
            <ArrowRightLeft className="h-12 w-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-surface-700 dark:text-surface-200 mb-1">
              No Transfer Orders Yet
            </h3>
            <p className="text-sm text-surface-400 mb-4">
              Click "Initiate Transfer" to create your first inter-company stock transfer.
            </p>
            <Button variant="primary" leftIcon={Plus} onClick={handleOpenModal} size="sm">
              Initiate Transfer
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={transferOrders} isLoading={loading} />
        )}
      </div>

      {/* Create Transfer Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Inter-Company Transfer"
        subtitle="Transfer stock from your company's inventory to another company. Stock is deducted immediately."
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTO}
              isLoading={submitting}
            >
              Create & Execute Transfer
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTO} className="space-y-4">
          {/* Product Dropdown */}
          <FormField
            label="Product to Transfer"
            required
            hint={
              selectedProduct
                ? `Available Stock: ${selectedProduct.availableStock} units`
                : 'Select a product to see available stock'
            }
          >
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.sku} — ${p.name} (${p.availableStock} available)`,
              }))}
            />
          </FormField>

          {/* Destination Company Dropdown */}
          <FormField label="Destination Company" required>
            {destinationCompanies.length === 0 ? (
              <p className="text-sm text-warning-600 font-medium p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
                ⚠️ No other companies found in the database. Create another company first.
              </p>
            ) : (
              <Select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                options={destinationCompanies.map((c) => ({
                  value: c.id,
                  label: `${c.name} ${c.industry ? `(${c.industry})` : ''}`,
                }))}
              />
            )}
          </FormField>

          {/* Quantity */}
          <FormField
            label="Transfer Quantity"
            required
            hint={`Max: ${selectedProduct?.availableStock ?? '—'} units`}
          >
            <Input
              type="number"
              min="1"
              max={selectedProduct?.availableStock || undefined}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default TransferOrdersPage;
