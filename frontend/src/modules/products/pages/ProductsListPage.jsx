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
import DataTable from '@/components/data-display/DataTable';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { salesOrderService } from '@/services/salesOrderService';
import { clientService } from '@/services/clientService';
import { warehouseService } from '@/services/warehouseService';
import { locationService } from '@/services/locationService';
import { getCategoryFields } from '@/config/categoryConfig';
import { ShoppingCart } from 'lucide-react';

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
  const [brand, setBrand] = useState('');
  const [uom, setUom] = useState('Piece');
  const [storageType, setStorageType] = useState('General Storage');
  const [trackingMethod, setTrackingMethod] = useState('None');
  const [unitCost, setUnitCost] = useState('0.00');
  const [wholesalePrice, setWholesalePrice] = useState('0.00');
  const [description, setDescription] = useState('');

  // Dynamic Attributes State
  const [attributes, setAttributes] = useState({});

  // Opening Stock State
  const [openingStock, setOpeningStock] = useState('0');
  const [warehouseId, setWarehouseId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Specs
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [volume, setVolume] = useState('');

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Delete Confirm State
  const [deleteProdState, setDeleteProdState] = useState({ isOpen: false, id: null, name: '' });

  // Order State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderPriority, setOrderPriority] = useState('NORMAL');
  const [orderShippingAddress, setOrderShippingAddress] = useState('');
  const [orderPoNumber, setOrderPoNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [clients, setClients] = useState([]);
  const [orderClientId, setOrderClientId] = useState('');

  const isClient = user?.role === 'client' || user?.role?.toUpperCase() === 'CLIENT';
  const showUnitCost = user?.role?.toUpperCase() === 'SUPER_ADMIN' || user?.role?.toUpperCase() === 'WAREHOUSE_MANAGER';
  const showWholesalePrice = !isClient;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, clientRes, whRes] = await Promise.all([
        productService.getProducts({
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus,
        }),
        categoryService.getCategories(),
        clientService.fetchClients().catch(() => ({ data: [] })),
        warehouseService.getWarehouses().catch(() => []),
      ]);

      const prodList = Array.isArray(prodRes) ? prodRes : prodRes?.items || prodRes?.data || [];
      const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];
      const clientList = Array.isArray(clientRes) ? clientRes : clientRes?.data || [];
      const whList = Array.isArray(whRes) ? whRes : whRes?.data || [];

      setProducts(prodList);
      setCategories(catList);
      setClients(clientList);
      setWarehouses(whList);
      if (clientList.length > 0) setOrderClientId(clientList[0].id);
    } catch (err) {
      console.error('Error loading products data:', err);
      notifyError('Failed to load products master catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search') || '';
    setSearchTerm(searchParam);
  }, [window.location.search]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus, searchTerm]);

  useEffect(() => {
    if (warehouseId) {
      const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
      if (selectedWarehouse) {
        locationService.getLocations({ warehouse: selectedWarehouse.name, status: 'Active' })
          .then(res => {
            const locList = Array.isArray(res) ? res : res?.items || res?.data || [];
            // Additional fallback filtering on client-side just in case
            setLocations(locList.filter(l => l.status === 'Active' || l.status === 'ACTIVE'));
          })
          .catch(() => setLocations([]));
      }
    } else {
      setLocations([]);
    }
  }, [warehouseId, warehouses]);

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
    setBrand('');
    setUom('Piece');
    setStorageType('General Storage');
    setTrackingMethod('None');
    setUnitCost('0.00');
    setWholesalePrice('0.00');
    setDescription('');
    setWeight('');
    setLength('');
    setWidth('');
    setHeight('');
    setVolume('');
    setAttributes({});
    setOpeningStock('0');
    setWarehouseId('');
    setLocationId('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setSku(prod.sku || '');
    setBarcode(prod.barcode || '');
    setCategoryId(prod.categoryId || (categories[0]?.id || ''));
    setBrand(prod.brand || '');
    setUom(prod.uom || 'Piece');
    setStorageType(prod.storageType || 'General Storage');
    setTrackingMethod(prod.trackingMethod || 'None');
    setUnitCost(prod.unitCost !== undefined ? String(prod.unitCost) : '0.00');
    setWholesalePrice(prod.wholesalePrice !== undefined ? String(prod.wholesalePrice) : '0.00');
    setDescription(prod.description || '');
    
    // Specs
    setWeight(prod.specification?.weight !== undefined && prod.specification?.weight !== null ? String(prod.specification.weight) : '');
    setLength(prod.specification?.length !== undefined && prod.specification?.length !== null ? String(prod.specification.length) : '');
    setWidth(prod.specification?.width !== undefined && prod.specification?.width !== null ? String(prod.specification.width) : '');
    setHeight(prod.specification?.height !== undefined && prod.specification?.height !== null ? String(prod.specification.height) : '');
    setVolume(prod.specification?.volume !== undefined && prod.specification?.volume !== null ? String(prod.specification.volume) : '');
    setAttributes(prod.attributes || {});
    setOpeningStock('0');
    setWarehouseId('');
    setLocationId('');

    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !sku) {
      notifyError('Product Name and SKU are required.');
      return;
    }

    if (openingStock && parseInt(openingStock, 10) > 0) {
      if (!warehouseId || !locationId) {
        notifyError('Please select a warehouse and a bin for opening stock');
        return;
      }
    }

    try {
      const payload = {
        name,
        sku,
        barcode,
        categoryId: categoryId || null,
        brand,
        uom,
        storageType,
        trackingMethod,
        unitCost: parseFloat(unitCost || '0'),
        wholesalePrice: parseFloat(wholesalePrice || '0'),
        description,
        attributes,
        openingStock: openingStock ? parseInt(openingStock, 10) : 0,
        warehouseId,
        locationId,
        specification: {
          weight: weight ? parseFloat(weight) : null,
          length: length ? parseFloat(length) : null,
          width: width ? parseFloat(width) : null,
          height: height ? parseFloat(height) : null,
          volume: volume ? parseFloat(volume) : null,
        }
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
      await categoryService.createCategory({
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

  const handleOpenOrderModal = (prod) => {
    setOrderProduct(prod);
    setOrderQuantity(1);
    setOrderPriority('NORMAL');
    setOrderShippingAddress('');
    setOrderPoNumber('');
    setOrderNotes('');
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!orderQuantity || orderQuantity <= 0) {
      notifyError('Please enter a valid quantity.');
      return;
    }
    
    // Fallback if no clients available
    const clientIdToUse = orderClientId || 'fallback-client-id';

    try {
      await salesOrderService.createSalesOrder({
        clientId: clientIdToUse,
        priority: orderPriority,
        shippingAddress: orderShippingAddress,
        poNumber: orderPoNumber,
        notes: orderNotes,
        items: [{ productId: orderProduct.id, quantity: parseInt(orderQuantity) }]
      });
      notifySuccess(`Order placed successfully for ${orderQuantity}x ${orderProduct.name}`);
      setIsOrderModalOpen(false);
    } catch (err) {
      notifyError(err.message || 'Failed to place order');
    }
  };

  const columns = [
    {
      header: 'SKU / Barcode',
      accessor: 'sku',
      cell: (row) => (
        <div className="font-mono">
          <div className="font-bold text-slate-900">{row.sku}</div>
          <div className="text-[11px] text-slate-500">{row.barcode || 'NO BARCODE'}</div>
        </div>
      )
    },
    {
      header: 'Product Name',
      accessor: 'name',
      cell: (row) => <span className="font-semibold text-slate-800">{row.name}</span>
    },
    {
      header: 'Category',
      accessor: 'categoryRef.name',
      cell: (row) => row.categoryRef?.name || row.category || 'Uncategorized'
    },
    {
      header: 'Available Stock',
      accessor: 'availableStock',
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {row.availableStock || 0} units
        </span>
      ),
    },
    ...(showUnitCost ? [{
      header: 'Unit Cost',
      accessor: 'unitCost',
      cell: (row) => <span className="font-mono">${Number(row.unitCost || 0).toFixed(2)}</span>,
    }] : []),
    ...(showWholesalePrice ? [{
      header: 'Wholesale Price',
      accessor: 'wholesalePrice',
      cell: (row) => <span className="font-mono font-bold text-green-700">${Number(row.wholesalePrice || 0).toFixed(2)}</span>,
    }] : []),
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'INACTIVE' ? 'danger' : 'success'} dot>
          {row.status || 'ACTIVE'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        isClient ? (
          <div className="flex justify-end">
            <button 
              onClick={() => handleOpenOrderModal(row)} 
              className="px-3 py-1.5 bg-[#4f8f32] text-white rounded text-xs font-bold hover:bg-[#3f722a] transition flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Place Order
            </button>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <button onClick={() => openEditProductModal(row)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleDeleteProduct(row.id, row.name)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      ),
    }
  ];

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
      <DataTable
        columns={columns}
        data={products}
        emptyTitle="No products found"
        emptyDescription="Create products to add items to catalog."
      />

      {/* Product Form Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product SKU' : 'Create Master Product'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="product-form" variant="primary">Save Product</Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSaveProduct} className="space-y-6">
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Product Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Product Name" required />
              </FormField>
              <FormField label="SKU Code" required>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Enter SKU Code" required />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Barcode / UPC">
                <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Enter Barcode" />
              </FormField>
              <FormField label="Category" required>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  required
                />
              </FormField>
              <FormField label="Brand">
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Enter Brand" />
              </FormField>
            </div>
            <FormField label="Product Description">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter Product Description" />
            </FormField>
          </div>

          {/* Dynamic Attributes */}
          {categoryId && (
            (() => {
              const selectedCat = categories.find(c => c.id === categoryId);
              const dynamicFields = getCategoryFields(selectedCat?.name);
              
              if (dynamicFields.length > 0) {
                return (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">{selectedCat.name} Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dynamicFields.map(field => (
                        <FormField key={field.name} label={field.label}>
                          {field.type === 'select' ? (
                            <Select
                              value={attributes[field.name] || ''}
                              onChange={(e) => setAttributes({ ...attributes, [field.name]: e.target.value })}
                              options={field.options.map(opt => ({ value: opt, label: opt }))}
                            />
                          ) : (
                            <Input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={attributes[field.name] || ''}
                              onChange={(e) => setAttributes({ ...attributes, [field.name]: e.target.value })}
                            />
                          )}
                        </FormField>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}

          {/* Opening Stock (Create Only) */}
          {!editingProduct && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Opening Stock (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Initial Quantity">
                  <Input type="number" min="0" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} placeholder="0" />
                </FormField>
                {parseInt(openingStock, 10) > 0 && (
                  <>
                    <FormField label="Warehouse">
                      <Select
                        value={warehouseId}
                        onChange={(e) => setWarehouseId(e.target.value)}
                        placeholder="Select Warehouse"
                        options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                      />
                    </FormField>
                    <FormField label="Location (Bin)">
                      <Select
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        placeholder="Select Location"
                        options={locations.map(l => ({ value: l.id, label: l.name }))}
                      />
                    </FormField>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Specifications (Optional) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Specifications (Optional)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <FormField label="Weight (Kg)">
                <Input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Length (cm)">
                <Input type="number" step="0.01" value={length} onChange={(e) => setLength(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Width (cm)">
                <Input type="number" step="0.01" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Height (cm)">
                <Input type="number" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="0.00" />
              </FormField>
              <FormField label="Volume">
                <Input type="number" step="0.01" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="0.00" disabled />
              </FormField>
            </div>
          </div>

          {/* Storage & Inventory Rules */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Storage & Inventory Rules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Unit of Measure (UOM)" required>
                <Select
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  options={[
                    'Piece', 'Box', 'Carton', 'Pallet', 'Kg', 'Gram', 'Litre', 'Meter', 'Roll', 'Pack', 'Bottle', 'Bag', 'Drum'
                  ].map(v => ({ value: v, label: v }))}
                  required
                />
              </FormField>
              <FormField label="Storage Type" required>
                <Select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  options={[
                    'General Storage', 'Cold Storage', 'Hazardous', 'Fragile', 'High Value', 'Outdoor Storage', 'Rack Storage', 'Floor Storage'
                  ].map(v => ({ value: v, label: v }))}
                  required
                />
              </FormField>
              <FormField label="Tracking Method" required>
                <Select
                  value={trackingMethod}
                  onChange={(e) => setTrackingMethod(e.target.value)}
                  options={[
                    'None', 'Serial Number', 'Batch', 'Lot', 'Batch + Expiry'
                  ].map(v => ({ value: v, label: v }))}
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">Financials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showUnitCost && (
                <FormField label="Unit Cost ($)" required>
                  <Input type="number" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} required />
                </FormField>
              )}
              <FormField label="Wholesale Price ($)" required>
                <Input type="number" step="0.01" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} required />
              </FormField>
            </div>
          </div>

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
            <Button type="submit" form="category-form" variant="primary">Save Category</Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleCreateCategory} className="space-y-4">
          <FormField label="Category Name" required>
            <Input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Enter Category Name" required />
          </FormField>
          <FormField label="Category Code" required>
            <Input value={catCode} onChange={(e) => setCatCode(e.target.value)} placeholder="Enter Category Code" required />
          </FormField>
          <FormField label="Description">
            <Input value={catDescription} onChange={(e) => setCatDescription(e.target.value)} placeholder="Enter Description" />
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

      {/* Place Order Modal */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Place Order" size="sm">
        <form onSubmit={handleSubmitOrder} className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">
              You are ordering: <span className="font-bold text-slate-900">{orderProduct?.name}</span> (Stock: {orderProduct?.availableStock} units)
            </p>
          </div>
          <FormField label="Order Quantity">
            <Input 
              type="number" 
              min="1"
              max={orderProduct?.availableStock || 9999}
              value={orderQuantity} 
              onChange={(e) => setOrderQuantity(e.target.value)} 
              required
            />
          </FormField>
          
          <FormField label="Priority">
            <Select value={orderPriority} onChange={(e) => setOrderPriority(e.target.value)} options={[
              { value: 'NORMAL', label: 'Normal' },
              { value: 'URGENT', label: 'Urgent' }
            ]} />
          </FormField>

          <FormField label="Shipping Address">
            <Input 
              value={orderShippingAddress}
              onChange={(e) => setOrderShippingAddress(e.target.value)}
              placeholder="e.g. 123 Main St, NY..."
              required
            />
          </FormField>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="PO Number (Optional)">
              <Input 
                value={orderPoNumber}
                onChange={(e) => setOrderPoNumber(e.target.value)}
                placeholder="e.g. PO-9988"
              />
            </FormField>
            
            {clients.length > 0 && (
              <FormField label="Order As Client">
                <Select value={orderClientId} onChange={(e) => setOrderClientId(e.target.value)} options={clients.map(c => ({ value: c.id, label: c.name }))} />
              </FormField>
            )}
          </div>

          <FormField label="Order Notes (Optional)">
            <Input 
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special handling instructions?"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsOrderModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Submit Order</Button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default ProductsListPage;
