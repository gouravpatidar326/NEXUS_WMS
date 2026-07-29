import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/permissions/roles';
import { useNotification } from '@/contexts/NotificationContext';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import LoadingState from '@/components/feedback/LoadingState';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

export const ProductsListPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteProdState, setDeleteProdState] = useState({ isOpen: false, id: null, name: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states - Product
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitCost, setUnitCost] = useState('0');
  const [wholesalePrice, setWholesalePrice] = useState('0');
  const [description, setDescription] = useState('');

  // Form states - Category
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Role permissions
  const isClient = user?.role === ROLES.CLIENT;
  const isClerk = user?.role === ROLES.INVENTORY_CLERK;
  const showUnitCost = !isClient && !isClerk; // Cost price hidden from Clients & Clerks

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catList] = await Promise.all([
        productService.getProducts({
          search: searchTerm,
          categoryId: selectedCategory,
          status: selectedStatus,
        }),
        categoryService.getCategories(),
      ]);
      setProducts(prodRes.items || []);
      setCategories(catList || []);
    } catch (err) {
      notifyError('Failed to fetch product catalog');
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
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setUnitCost('0');
    setWholesalePrice('0');
    setDescription('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setSku(prod.sku || '');
    setBarcode(prod.barcode || '');
    setCategoryId(prod.categoryId || '');
    setUnitCost(String(prod.unitCost || 0));
    setWholesalePrice(String(prod.wholesalePrice || 0));
    setDescription(prod.description || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !sku) {
      notifyError('Product Name and SKU are required');
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
        notifySuccess(`Product "${name}" updated successfully.`);
      } else {
        await productService.createProduct(payload);
        notifySuccess(`Product "${name}" created in master catalog.`);
      }
      setIsProductModalOpen(false);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = (id, prodName) => {
    setDeleteProdState({ isOpen: true, id, name: prodName });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProdState.id) return;
    try {
      await productService.deleteProduct(deleteProdState.id);
      notifySuccess(`Product "${deleteProdState.name}" deleted.`);
      setDeleteProdState({ isOpen: false, id: null, name: '' });
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to delete product');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName) {
      notifyError('Category Name is required');
      return;
    }

    try {
      await categoryService.createCategory({
        name: catName,
        code: catCode,
        description: catDescription,
      });
      notifySuccess(`Category "${catName}" created.`);
      setIsCategoryModalOpen(false);
      setCatName('');
      setCatCode('');
      setCatDescription('');
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to create category');
    }
  };

  if (loading) return <LoadingState message="Loading Master Product Catalog & Categories..." />;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Product Master Catalog</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage {products.length} active SKUs and product categories.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={Tag} onClick={() => setIsCategoryModalOpen(true)}>
            New Category
          </Button>
          {!isClient && (
            <Button variant="primary" leftIcon={Plus} onClick={openCreateProductModal}>
              Create Product
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 w-full sm:w-auto">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Product Name, SKU, Barcode..."
          />
          <Button variant="outline" type="submit">Search</Button>
        </form>
        <div className="flex gap-3 w-full sm:w-auto">
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

      {/* Table */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-x-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse text-xs min-w-[700px]">
          <thead>
            <tr className="bg-surface-container-low font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
              <th className="px-4 py-3">Product Name & SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Barcode</th>
              {showUnitCost && <th className="px-4 py-3">Unit Cost</th>}
              <th className="px-4 py-3">Wholesale Price</th>
              <th className="px-4 py-3">Available Stock</th>
              <th className="px-4 py-3">Status</th>
              {!isClient && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-on-surface text-sm">{prod.name}</div>
                  <div className="font-mono text-on-surface-variant text-[11px]">{prod.sku}</div>
                </td>
                <td className="px-4 py-3">{prod.categoryRef?.name || prod.category || 'N/A'}</td>
                <td className="px-4 py-3 font-mono">{prod.barcode || 'N/A'}</td>
                {showUnitCost && (
                  <td className="px-4 py-3 font-semibold text-on-surface">${(prod.unitCost || 0).toFixed(2)}</td>
                )}
                <td className="px-4 py-3 font-semibold text-primary">${(prod.wholesalePrice || 0).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold">{prod.availableStock ?? prod.calculatedTotalStock ?? 0} Units</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${prod.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                    {prod.status || 'ACTIVE'}
                  </span>
                </td>
                {!isClient && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="p-1.5 rounded text-surface-500 hover:text-primary transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 rounded text-surface-500 hover:text-red-600 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!products.length && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-on-surface-variant">
                  No products found in catalog. Click "Create Product" to add items.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit ${editingProduct.name}` : 'Create Product Catalog Entry'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <FormField label="Product Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Industrial Barcode Scanner X-200" required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="SKU Code" required>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-ELEC-001" required />
            </FormField>
            <FormField label="Barcode">
              <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="WMS-BAR-1002" />
            </FormField>
          </div>
          <FormField label="Category">
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Unit Cost ($)">
              <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
            </FormField>
            <FormField label="Wholesale Price ($)">
              <Input type="number" step="0.01" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="High-speed 2D barcode scanner" />
          </FormField>
        </form>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create Product Category"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateCategory}>Save Category</Button>
          </>
        }
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <FormField label="Category Name" required>
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Electronics" required />
          </FormField>
          <FormField label="Category Code">
            <Input value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="ELEC" />
          </FormField>
          <FormField label="Description">
            <Input value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="Hardware and electronic devices" />
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
