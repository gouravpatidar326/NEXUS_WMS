import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/permissions/roles';
import { useNotification } from '@/contexts/NotificationContext';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/feedback/LoadingState';
import { productService } from '@/services/productService';

export const ProductsListPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('Status: All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [unitCost, setUnitCost] = useState('120.00');
  const [wholesalePrice, setWholesalePrice] = useState('195.00');
  const [totalStock, setTotalStock] = useState('100');

  const isClient = user?.role === ROLES.CLIENT;
  const isClerk = user?.role === ROLES.INVENTORY_CLERK;
  const showFinancials = !isClient && !isClerk;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts();
      setProducts(res.items || res);
    } catch (error) {
      notifyError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct({
        name,
        sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category,
        unitCost: Number(unitCost),
        wholesalePrice: Number(wholesalePrice)
      });
      notifySuccess(`Product "${name}" created in master catalog.`);
      setIsModalOpen(false);
      setName('');
      setSku('');
      fetchProducts();
    } catch (error) {
      notifyError('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      notifySuccess(`Product "${name}" deleted successfully.`);
      fetchProducts();
    } catch (error) {
      notifyError('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((prd) => {
    const matchesSearch =
      prd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === 'All Categories' || prd.category.includes(selectedCategory);
    const matchesStatus =
      selectedStatus === 'Status: All' || prd.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  if (loading) return <LoadingState />;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-6">
      {/* Page Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Product Master Catalog</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage {products.length} active stock keeping units across 14 zones.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:gap-4">
          <div className="bg-white border border-outline-variant p-4 rounded-xl flex items-center gap-4 min-w-[160px] shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Total SKUs</p>
              <p className="text-xl font-bold text-on-surface">{products.length + 1420}</p>
            </div>
          </div>
          <div className="bg-white border border-outline-variant p-4 rounded-xl flex items-center gap-4 min-w-[160px] shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Low Stock</p>
              <p className="text-xl font-bold text-on-surface">24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant gap-4">
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search products, SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-primary cursor-pointer"
          >
            <option>All Categories</option>
            <option>Aviation/Electronics</option>
            <option>Hardware</option>
            <option>PPE</option>
            <option>Packaging</option>
            <option>Electronics</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:ring-primary cursor-pointer"
          >
            <option>Status: All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Reorder Soon</option>
          </select>
        </div>
        {!isClient && (
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Product SKU
            </button>
          </div>
        )}
      </div>

      {/* High-Density Data Table */}
      <div className="flex-1 bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-surface-container-highest z-20 border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Category</th>
                {showFinancials && (
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Item Unit Cost
                  </th>
                )}
                <th className="px-4 py-3 text-xs font-semibold text-primary uppercase tracking-wider text-right">
                  Wholesale Price
                </th>
                {showFinancials && (
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">
                    Margin %
                  </th>
                )}
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Available Stock</th>
                <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                {!isClient && (
                  <th className="px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {filteredProducts.map((prd) => (
                <tr key={prd.id} className="group hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border border-outline-variant overflow-hidden flex-shrink-0 bg-surface-container">
                        <img
                          src={prd.image}
                          alt={prd.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-semibold text-on-surface">{prd.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-on-surface-variant">{prd.sku}</td>
                  <td className="px-4 py-3 text-sm text-on-surface-variant">{prd.category}</td>
                  {showFinancials && (
                    <td className="px-4 py-3 text-sm text-right font-mono font-medium text-slate-600">
                      ${prd.unitCost || '0.00'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-right font-mono font-bold text-primary">
                    ${prd.wholesalePrice || '0.00'}
                  </td>
                  {showFinancials && (
                    <td className="px-4 py-3 text-sm text-right font-bold text-emerald-600">
                      --
                    </td>
                  )}
                  <td className={`px-4 py-3 text-sm text-right font-bold ${prd.availableStock < 20 ? 'text-red-600' : 'text-slate-800'}`}>
                    {prd.availableStock || 0} Units
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                        (prd.availableStock || 0) > 0
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {(prd.availableStock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  {!isClient && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteProduct(prd.id, prd.name)}
                        className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Stock Keeping Unit (SKU)"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddProduct}>
              Save SKU to Master Catalog
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddProduct} className="space-y-4">
          <FormField label="Product Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Heavy Duty Steel Washer M10" required />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="SKU Code">
              <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-8820" />
            </FormField>

            <FormField label="Category">
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Hardware" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Internal Item Cost ($)" required>
              <Input value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
            </FormField>

            <FormField label="Wholesale Price ($)" required>
              <Input value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} required />
            </FormField>
          </div>

          <FormField label="Initial Stock Quantity">
            <Input type="number" value={totalStock} onChange={(e) => setTotalStock(e.target.value)} />
          </FormField>
        </form>
      </Modal>
    </section>
  );
};

export default ProductsListPage;
