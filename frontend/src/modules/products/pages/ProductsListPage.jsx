import { useState, useEffect } from 'react';
import { Plus, Tag, Edit2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormField from '@/components/ui/FormField';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingState from '@/components/feedback/LoadingState';
import PageHeader from '@/components/navigation/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { productService } from '@/services/productService';

export const ProductsListPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitCost, setUnitCost] = useState('0.00');
  const [wholesalePrice, setWholesalePrice] = useState('0.00');
  const [description, setDescription] = useState('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Delete Confirm State
  const [deleteProdState, setDeleteProdState] = useState({ isOpen: false, id: null, name: '' });

  const isClient = user?.role === 'client';
  const showUnitCost = user?.role === 'super_admin' || user?.role === 'warehouse_manager';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus,
        }),
        productService.getCategories(),
      ]);

      const prodList = Array.isArray(prodRes) ? prodRes : prodRes?.items || prodRes?.data || [];
      const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];

      setProducts(prodList);
      setCategories(catList);
    } catch (err) {
      console.error('Error loading products data:', err);
      notifyError('Failed to load products master catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setBarcode('');
    setCategoryId(categories[0]?.id || '');
    setUnitCost('0.00');
    setWholesalePrice('0.00');
    setDescription('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setSku(prod.sku || '');
    setBarcode(prod.barcode || '');
    setCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setUnitCost(prod.unitCost !== undefined ? String(prod.unitCost) : '0.00');
    setWholesalePrice(prod.wholesalePrice !== undefined ? String(prod.wholesalePrice) : '0.00');
    setDescription(prod.description || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !sku) {
      notifyError('Product Name and SKU are required.');
      return;
    }

    try {
      const payload = {
        name,
        sku,
        barcode,
        categoryId: categoryId || null,
        unitCost: parseFloat(unitCost || '0'),
        wholesalePrice: parseFloat(wholesalePrice || '0'),
        description,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
        notifySuccess(`Product ${name} updated successfully.`);
      } else {
        await productService.createProduct(payload);
        notifySuccess(`Product ${name} added to catalog.`);
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to save product');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName) {
      notifyError('Category Name is required.');
      return;
    }

    try {
      await productService.createCategory({
        name: catName,
        code: catCode,
        description: catDescription,
      });
      notifySuccess(`Category ${catName} created.`);
      setCatName('');
      setCatCode('');
      setCatDescription('');
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to create category');
    }
  };

  const handleDeleteProduct = (id, prodName) => {
    setDeleteProdState({ isOpen: true, id, name: prodName });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProdState.id) return;
    try {
      await productService.deleteProduct(deleteProdState.id);
      notifySuccess(`Product ${deleteProdState.name} deleted.`);
      setDeleteProdState({ isOpen: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to delete product');
    }
  };

  if (loading) return <LoadingState message="Loading Master Product Catalog from database..." />;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-6">
      <PageHeader
        title="Product Master Catalog"
        description={`Manage ${products.length} active SKUs, unit costs, and categories.`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products' }]}
        actions={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" leftIcon={Tag} onClick={() => setIsCategoryModalOpen(true)} className="flex-1 sm:flex-initial">
              New Category
            </Button>
            {!isClient && (
              <Button variant="primary" size="sm" leftIcon={Plus} onClick={openCreateProductModal} className="flex-1 sm:flex-initial">
                Create Product
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-surface-container-low p-3 sm:p-4 rounded-xl border border-outline-variant gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 w-full">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Name, SKU, Barcode..."
            className="w-full text-xs sm:text-sm"
          />
          <Button variant="outline" type="submit" size="sm">Search</Button>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full md:w-auto">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </div>
      </div>

      {/* Products Table Container */}
      <div className="card overflow-hidden bg-white">
        <div className="w-full overflow-x-auto overscroll-x-contain [webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[750px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-slate-50 text-[11px] sm:text-xs uppercase font-bold text-slate-600">
                <th className="p-3">SKU / Barcode</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Available Stock</th>
                {showUnitCost && <th className="p-3 text-right">Unit Cost</th>}
                <th className="p-3 text-right">Wholesale Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No products found. Click "Create Product" to add items to master catalog.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-slate-900">{prod.sku}</div>
                      <div className="text-[11px] text-slate-500">{prod.barcode || 'NO BARCODE'}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{prod.name}</td>
                    <td className="p-3 text-xs text-slate-600">{prod.category?.name || 'Uncategorized'}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 text-right">
                      {prod.availableStock || 0} units
                    </td>
                    {showUnitCost && (
                      <td className="p-3 font-mono text-right text-slate-700">
                        ${Number(prod.unitCost || 0).toFixed(2)}
                      </td>
                    )}
                    <td className="p-3 font-mono text-right font-bold text-green-700">
                      ${Number(prod.wholesalePrice || 0).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${prod.status === 'INACTIVE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {prod.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditProductModal(prod)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id, prod.name)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product SKU' : 'Create Master Product'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveProduct}>Save Product</Button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField label="Product Name" required>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Semaglutide 5mg Vial" required />
            </FormField>
            <FormField label="SKU Code" required>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. SKU-SEM-005" required />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField label="Barcode (ShipStation Linked)">
              <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="e.g. 890123456789" />
            </FormField>
            <FormField label="Category">
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {showUnitCost && (
              <FormField label="Unit Cost ($)">
                <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
              </FormField>
            )}
            <FormField label="Wholesale Price ($)">
              <Input type="number" step="0.01" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Product Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter details or storage notes..." />
          </FormField>
        </form>
      </Modal>

      {/* Category Form Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create Product Category"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateCategory}>Save Category</Button>
          </>
        }
      >
        <form onSubmit={handleCreateCategory} className="space-y-3 sm:space-y-4">
          <FormField label="Category Name" required>
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Peptides" required />
          </FormField>
          <FormField label="Category Code">
            <Input value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="e.g. PEP" />
          </FormField>
          <FormField label="Description">
            <Input value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="Description..." />
          </FormField>
        </form>
      </Modal>

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteProdState.isOpen}
        onClose={() => setDeleteProdState({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete product "${deleteProdState.name}"? This action will remove the product SKU entry.`}
        confirmText="Yes, Delete Product"
        variant="danger"
      />
    </section>
  );
};

export default ProductsListPage;
