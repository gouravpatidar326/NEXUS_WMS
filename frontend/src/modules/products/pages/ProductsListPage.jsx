import { useState, useEffect, useRef } from 'react';
import { Plus, Tag, Edit2, Trash2, Upload } from 'lucide-react';
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
import DataScopeTabs from '@/components/navigation/DataScopeTabs';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { salesOrderService } from '@/services/salesOrderService';
import { clientService } from '@/services/clientService';
import { warehouseService } from '@/services/warehouseService';
import { locationService } from '@/services/locationService';
import { companyService } from '@/services/companyService';
import { getCategoryFields } from '@/config/categoryConfig';
import { ShoppingCart, Download } from 'lucide-react';

export const ProductsListPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState('OWN');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCompanyId, setImportCompanyId] = useState('');
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
  const [openingStock, setOpeningStock] = useState('');
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
  const [orderCountry, setOrderCountry] = useState('United States');
  const [orderState, setOrderState] = useState('');
  const [orderCity, setOrderCity] = useState('');
  const [orderZipCode, setOrderZipCode] = useState('');
  const [orderStreetAddress, setOrderStreetAddress] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [orderPoNumber, setOrderPoNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderShippingCarrier, setOrderShippingCarrier] = useState('Standard Freight');
  const [orderPaymentTerm, setOrderPaymentTerm] = useState('Credit Line (Net-30)');
  const [orderMinExpiry, setOrderMinExpiry] = useState('No Preference');
  const [orderPoFileName, setOrderPoFileName] = useState('');
  const [clients, setClients] = useState([]);
  const [orderClientId, setOrderClientId] = useState('');

  const isClient = user?.role === 'client' || user?.role?.toUpperCase() === 'CLIENT';
  const showUnitCost = user?.role?.toUpperCase() === 'SUPER_ADMIN' || user?.role?.toUpperCase() === 'WAREHOUSE_MANAGER';
  const showWholesalePrice = true;

  const availableStock = orderProduct?.availableStock || 0;
  const isQuantityExceeded = parseInt(orderQuantity || '0', 10) > availableStock;
  const unitPrice = Number(orderProduct?.wholesalePrice || orderProduct?.unitCost || 0);
  const subtotal = unitPrice * (parseInt(orderQuantity || '0', 10) || 0);
  const estShipping = subtotal > 0 ? 15.00 : 0.00;
  const grandTotal = subtotal + estShipping;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, clientRes, whRes, compRes] = await Promise.all([
        productService.getProducts({
          search: searchTerm,
          category: selectedCategory,
          status: selectedStatus,
          page,
          pageSize,
        }),
        categoryService.getCategories(),
        clientService.fetchClients().catch(() => ({ data: [] })),
        warehouseService.getWarehouses().catch(() => []),
        user?.role === 'SUPER_ADMIN' ? companyService.getCompanies().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      ]);

      const prodList = Array.isArray(prodRes) ? prodRes : prodRes?.items || prodRes?.data || [];
      const prodMeta = prodRes?.meta || null;
      const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];
      const clientList = Array.isArray(clientRes) ? clientRes : clientRes?.data || [];
      const whList = Array.isArray(whRes) ? whRes : whRes?.data || [];
      const compList = Array.isArray(compRes) ? compRes : compRes?.data || [];

      setProducts(prodList);
      setPaginationMeta(prodMeta);
      setCategories(catList);
      setClients(clientList);
      setWarehouses(whList);
      setCompanies(compList);
      if (compList.length > 0 && !importCompanyId) {
        setImportCompanyId(compList[0].id);
      }
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
  }, [selectedCategory, selectedStatus, searchTerm, page, pageSize]);

  useEffect(() => {
    if (warehouseId) {
      const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
      if (selectedWarehouse) {
        locationService.getLocations({ warehouse: selectedWarehouse.name, status: 'Active' })
          .then(res => {
            const locList = Array.isArray(res) ? res : res?.items || res?.data || [];
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
    setPage(1); // Reset to page 1 on new search
    fetchData();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (user?.role === 'SUPER_ADMIN' && !importCompanyId) {
      notifyError('Please select a company before importing.');
      e.target.value = null;
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      // Simple CSV parse (assumes no commas inside quotes for this basic structure)
      const rows = text.split(/\r?\n/).map(row => row.split(',').map(cell => cell.trim()));
      const headers = rows[0].map(h => h.toLowerCase());
      
      const skuIdx = headers.indexOf('sku');
      const nameIdx = headers.indexOf('name');
      const upcIdx = headers.indexOf('upc');
      const activeIdx = headers.indexOf('active');

      if (skuIdx === -1 || nameIdx === -1) {
        throw new Error('CSV must contain at least SKU and Name columns.');
      }

      const productsToImport = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 2 || !row[skuIdx]) continue;

        productsToImport.push({
          sku: row[skuIdx],
          name: row[nameIdx],
          barcode: upcIdx !== -1 ? row[upcIdx] : '',
          status: (activeIdx !== -1 && row[activeIdx].toUpperCase() === 'FALSE') ? 'INACTIVE' : 'ACTIVE',
          companyId: importCompanyId || undefined
        });
      }

      const res = await productService.importProducts(productsToImport);
      notifySuccess(res.message || `Imported ${productsToImport.length} products successfully.`);
      setIsImportModalOpen(false);
      setPage(1);
      fetchData();
    } catch (err) {
      console.error(err);
      notifyError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
    setOrderCountry('United States');
    setOrderState('');
    setOrderCity('');
    setOrderZipCode('');
    setOrderStreetAddress('');
    setOrderPoNumber('');
    setOrderNotes('');
    setOrderShippingCarrier('Standard Freight');
    setOrderPaymentTerm('Credit Line (Net-30)');
    setOrderMinExpiry('No Preference');
    setOrderPoFileName('');
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const qty = parseInt(orderQuantity || '0', 10);
    if (!qty || qty <= 0) {
      notifyError('Please enter a valid quantity.');
      return;
    }
    if (qty > availableStock) {
      notifyError(`Cannot place order: Quantity requested (${qty}) exceeds available stock (${availableStock} units).`);
      return;
    }

    const clientIdToUse = orderClientId || (clients[0]?.id) || 'fallback-client-id';

    const fullShippingAddress = [
      orderStreetAddress,
      orderCity,
      orderState,
      orderCountry,
      orderZipCode ? `PIN/Zip: ${orderZipCode}` : ''
    ].filter(Boolean).join(', ');

    const fullNotes = [
      orderNotes,
      `Carrier: ${orderShippingCarrier}`,
      `Payment Term: ${orderPaymentTerm}`,
      `Min Expiry: ${orderMinExpiry}`,
      orderPoFileName ? `Attached PO: ${orderPoFileName}` : ''
    ].filter(Boolean).join(' | ');

    try {
      await salesOrderService.createSalesOrder({
        clientId: clientIdToUse,
        priority: orderPriority,
        shippingAddress: fullShippingAddress || 'Client Main Facility',
        poNumber: orderPoNumber,
        notes: fullNotes,
        items: [{ productId: orderProduct.id, quantity: qty }]
      });
      notifySuccess(`Order placed successfully for ${qty}x ${orderProduct.name} (Total: $${grandTotal.toFixed(2)})`);
      setIsOrderModalOpen(false);
      fetchData();
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

  const filteredProducts = products.filter(p => {
    if (activeTab === 'OWN') return p.companyId === user?.companyId;
    return p.companyId !== user?.companyId;
  });

  if (loading) return <LoadingState message="Loading Master Product Catalog from database..." />;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-6">
      <PageHeader
        title="Product Master Catalog"
        description={`Manage ${products.length} active SKUs, unit costs, and categories.`}
        breadcrumbs={[{ label: 'Catalog' }, { label: 'Products' }]}
        actions={
          !isClient ? (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={Download} 
                onClick={() => setIsImportModalOpen(true)} 
                disabled={importing}
                className="flex-1 sm:flex-initial border-primary-500 text-primary-700 hover:bg-primary-50"
              >
                {importing ? 'Importing...' : 'Import CSV'}
              </Button>
              <Button variant="outline" size="sm" leftIcon={Tag} onClick={() => setIsCategoryModalOpen(true)} className="flex-1 sm:flex-initial">
                New Category
              </Button>
              <Button variant="primary" size="sm" leftIcon={Plus} onClick={openCreateProductModal} className="flex-1 sm:flex-initial">
                Create Product
              </Button>
            </div>
          ) : null
        }
      />

      <div className="flex justify-start">
        <DataScopeTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

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
        data={filteredProducts}
        emptyTitle="No products found"
        emptyDescription="Create products to add items to catalog."
        pagination={
          paginationMeta
            ? {
                currentPage: paginationMeta.currentPage || page,
                totalPages: paginationMeta.totalPages || 1,
                totalItems: paginationMeta.totalItems || products.length,
                pageSize: paginationMeta.pageSize || pageSize,
                onPageChange: (newPage) => setPage(newPage),
                onPageSizeChange: (newSize) => {
                  setPageSize(newSize);
                  setPage(1);
                },
              }
            : null
        }
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
                  <Input type="number" min="0" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} />
                </FormField>
                <FormField label="Warehouse">
                  <Select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    placeholder="Select Warehouse"
                    options={warehouses.map(w => ({ 
                      value: w.id, 
                      label: w.totalCapacity > 0 ? `${w.name} (${w.freeCapacity || 0}/${w.totalCapacity} available)` : w.name 
                    }))}
                  />
                </FormField>
                <FormField label="Location (Bin)">
                  <Select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    placeholder="Select Location"
                    options={locations.map(l => {
                      const name = l.name || l.code || l.bin || 'Location';
                      const available = l.maxCapacity > 0 ? Math.max(0, l.maxCapacity - (l.occupied || 0)) : null;
                      return { 
                        value: l.id, 
                        label: l.maxCapacity > 0 ? `${name} (${available}/${l.maxCapacity} available)` : name 
                      };
                    })}
                  />
                </FormField>
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

      {/* Import CSV Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Products via CSV"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Select a CSV file containing at least <strong>SKU</strong> and <strong>Name</strong> columns.
          </p>
          
          {user?.role === 'SUPER_ADMIN' && (
            <FormField label="Target Company">
              {companies.length === 0 ? (
                <div>
                  <Select
                    value=""
                    disabled
                    options={[{ value: '', label: 'No companies available' }]}
                  />
                  <p className="text-xs text-red-500 mt-1">Please create a company first.</p>
                </div>
              ) : (
                <Select
                  value={importCompanyId}
                  onChange={(e) => setImportCompanyId(e.target.value)}
                  options={[
                    { value: '', label: 'Select a company...' },
                    ...companies.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              )}
            </FormField>
          )}
          <div className="flex flex-col gap-2 border-t pt-4">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden"
              disabled={user?.role === 'SUPER_ADMIN' && companies.length === 0}
            />
            <Button
              className="w-full justify-center"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing || (user?.role === 'SUPER_ADMIN' && companies.length === 0)}
            >
              {importing ? 'Importing...' : 'Select File & Import'}
            </Button>
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} className="w-full justify-center">
              Cancel
            </Button>
          </div>
        </div>
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
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Place Purchase Order"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              form="place-order-form"
              variant="primary"
              disabled={isQuantityExceeded}
            >
              Submit Order (${grandTotal.toFixed(2)})
            </Button>
          </>
        }
      >
        <form id="place-order-form" onSubmit={handleSubmitOrder} className="space-y-5">
          
          {/* Header Product & Stock Banner */}
          <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700 flex justify-between items-center">
            <div>
              <p className="text-xs text-surface-500 font-medium">Selected Product</p>
              <h4 className="text-base font-bold text-surface-900 dark:text-surface-100">{orderProduct?.name}</h4>
              <p className="text-xs font-mono text-surface-400">SKU: {orderProduct?.sku}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-mono ${availableStock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                Stock Available: {availableStock} units
              </span>
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-1 font-mono">
                ${unitPrice.toFixed(2)} / unit
              </p>
            </div>
          </div>

          {/* Section 1: Order Quantity & Live Stock Check */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase">
                Order Quantity <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setOrderQuantity(availableStock)}
                className="text-xs font-bold text-primary-600 hover:underline cursor-pointer"
              >
                Set Max ({availableStock} units)
              </button>
            </div>
            <Input
              type="number"
              min="1"
              max={availableStock}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
              placeholder="Enter Quantity"
              required
              className={isQuantityExceeded ? 'border-red-500 ring-2 ring-red-500/20' : ''}
            />

            {/* Live Stock Validation Warning */}
            {isQuantityExceeded && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center justify-between">
                <span>⚠️ Quantity ({orderQuantity}) exceeds available stock ({availableStock} units).</span>
                <button
                  type="button"
                  onClick={() => setOrderQuantity(availableStock)}
                  className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold"
                >
                  Set {availableStock}
                </button>
              </div>
            )}
          </div>

          {/* Live Order Value Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-surface-800 dark:to-surface-800/80 p-4 rounded-xl border border-primary-200 dark:border-surface-700 space-y-1.5">
            <div className="flex justify-between text-xs text-surface-600 dark:text-surface-300">
              <span>Subtotal ({orderQuantity || 0} units × ${unitPrice.toFixed(2)}):</span>
              <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-surface-600 dark:text-surface-300">
              <span>Est. Freight & Handling:</span>
              <span className="font-mono font-semibold">${estShipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-primary-200 dark:border-surface-600 pt-2 flex justify-between text-sm font-bold text-surface-900 dark:text-surface-100">
              <span>Total Estimated Payable:</span>
              <span className="font-mono text-primary-700 dark:text-primary-300 text-base">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Section 2: Shipping Destination */}
          <div className="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-surface-700 dark:text-surface-300 uppercase">
                Shipping Destination
              </h4>
              <button
                type="button"
                onClick={() => setUseCustomAddress(!useCustomAddress)}
                className="text-xs font-bold text-primary-600 hover:underline cursor-pointer"
              >
                {useCustomAddress ? '✓ Use Saved Profile Address' : '+ Ship to Different Address'}
              </button>
            </div>

            {!useCustomAddress ? (
              <div className="p-3 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs text-surface-700 dark:text-surface-300 flex items-center justify-between">
                <div>
                  <span className="font-bold block">🏢 Primary Client Facility Address</span>
                  <span className="text-surface-500 text-[11px]">Default address stored on registered client profile</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">DEFAULT</span>
              </div>
            ) : (
              <LocationAddressSection
                country={orderCountry}
                onCountryChange={setOrderCountry}
                state={orderState}
                onStateChange={setOrderState}
                city={orderCity}
                onCityChange={setOrderCity}
                zipCode={orderZipCode}
                onZipCodeChange={setOrderZipCode}
                address={orderStreetAddress}
                onAddressChange={setOrderStreetAddress}
                required
              />
            )}
          </div>

          {/* Section 3: Essential Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-200 dark:border-surface-700 pt-4">
            <FormField label="Priority">
              <Select
                value={orderPriority}
                onChange={(e) => setOrderPriority(e.target.value)}
                options={[
                  { value: 'NORMAL', label: 'Normal Priority' },
                  { value: 'URGENT', label: 'Urgent Priority' },
                ]}
              />
            </FormField>

            <FormField label="PO Number (Optional)">
              <Input
                value={orderPoNumber}
                onChange={(e) => setOrderPoNumber(e.target.value)}
                placeholder="e.g. PO-9988-2026"
              />
            </FormField>
          </div>

          {/* Section 4: Notes */}
          <FormField label="Order Notes & Special Handling (Optional)">
            <Input
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Any special packing or handling instructions..."
            />
          </FormField>

        </form>
      </Modal>
    </section>
  );
};

export default ProductsListPage;
