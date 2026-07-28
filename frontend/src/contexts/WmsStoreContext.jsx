import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_PRODUCTS, MOCK_LOTS, MOCK_SALES_ORDERS } from '@/mock/mockData';
import { MOCK_INVENTORY_MOVEMENTS, MOCK_PURCHASE_ORDERS, MOCK_TRANSFER_ORDERS } from '@/data/mockData';
import { ROLES } from '@/permissions/roles';

const WmsStoreContext = createContext(null);

export const WmsStoreProvider = ({ children }) => {
  // 1. Products State
  const [products, setProducts] = useState(() => {
    const localProductImages = ['/images/wms/product-components.jpg', '/images/wms/product-solvent.jpg'];
    const stored = localStorage.getItem('wms_products');
    if (stored) {
      try {
        return JSON.parse(stored).map((product, index) => ({
          ...product,
          image: product.image?.startsWith('/') ? product.image : localProductImages[index % localProductImages.length],
        }));
      } catch { /* ignore */ }
    }
    return MOCK_PRODUCTS.map((p, idx) => ({
      ...p,
      image: p.image?.startsWith('/') ? p.image : localProductImages[idx % localProductImages.length],
      unitCost: (120 + idx * 15).toFixed(2),
      wholesalePrice: (195 + idx * 25).toFixed(2),
      margin: '+42%',
    }));
  });

  // 2. Lots State
  const [lots, setLots] = useState(() => {
    const stored = localStorage.getItem('wms_lots');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return MOCK_LOTS.map((l, i) => ({
      ...l,
      coaUnlockedByClients: i % 2 === 0 ? ['sam@acmecorp.com'] : [],
      labName: 'Intertek Analytical Labs',
      testCertificateId: `COA-2023-${8800 + i}`,
      purityScore: '99.85%',
      testDate: '2023-11-10',
      priceToUnlock: 150,
    }));
  });

  // 3. Purchase Orders State
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const stored = localStorage.getItem('wms_pos');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return (MOCK_PURCHASE_ORDERS || []).map(po => ({
      ...po,
      totalAmount: po.totalAmount || 5400,
      items: po.items || [{ productId: 'prd_1', sku: 'SKU-8821', name: 'Premium Grade Steel Coil', qty: 100, unitCost: 145 }],
    }));
  });

  // 4. Transfer Orders State
  const [transferOrders, setTransferOrders] = useState(() => {
    const stored = localStorage.getItem('wms_tos');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return (MOCK_TRANSFER_ORDERS || []).map(to => ({
      ...to,
      sourceCompany: to.sourceCompany || 'GlobalTech Corp',
      destCompany: to.destCompany || 'Apex Logistics LLC',
      productId: 'prd_1',
      productName: 'Premium Grade Steel Coil',
      lotId: 'LOT-88219',
      qty: to.totalItems || 100,
    }));
  });

  // 5. Sales Orders State
  const [salesOrders, setSalesOrders] = useState(() => {
    const stored = localStorage.getItem('wms_sos');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return [
      { id: 'so_req_001', orderNumber: 'SO-2023-9901', client: 'Acme Corp', clientEmail: 'sam@acmecorp.com', clientCode: 'AC', date: '2023-11-22', itemsCount: 4, totalVal: '$4,280.00', priority: 'HIGH', status: 'Pending Review', rejectionReason: '' },
      { id: 'so_req_002', orderNumber: 'SO-2023-9902', client: 'GlobalTech Corp', clientEmail: 'rachel@globaltech.com', clientCode: 'GT', date: '2023-11-22', itemsCount: 12, totalVal: '$18,900.00', priority: 'URGENT', status: 'Pending Review', rejectionReason: '' },
      ...MOCK_SALES_ORDERS.map(so => ({ ...so, clientEmail: 'sam@acmecorp.com', rejectionReason: '' })),
    ];
  });

  // 6. Inventory Movements
  const [movements, setMovements] = useState(() => {
    const stored = localStorage.getItem('wms_movements');
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return MOCK_INVENTORY_MOVEMENTS || [];
  });

  // LocalStorage Persist Effect
  useEffect(() => { localStorage.setItem('wms_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('wms_lots', JSON.stringify(lots)); }, [lots]);
  useEffect(() => { localStorage.setItem('wms_pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('wms_tos', JSON.stringify(transferOrders)); }, [transferOrders]);
  useEffect(() => { localStorage.setItem('wms_sos', JSON.stringify(salesOrders)); }, [salesOrders]);
  useEffect(() => { localStorage.setItem('wms_movements', JSON.stringify(movements)); }, [movements]);

  // --- ACTIONS ---

  // RBAC Pricing Sanitizer: Strips itemCost and margin from object for Client & Clerk
  const sanitizeProductForRole = useCallback((product, role) => {
    if (role === ROLES.CLIENT || role === ROLES.INVENTORY_CLERK) {
      const { unitCost, margin, ...safeProduct } = product;
      return safeProduct;
    }
    return product;
  }, []);

  const getProductsForUser = useCallback((user) => {
    return products.map(p => sanitizeProductForRole(p, user?.role));
  }, [products, sanitizeProductForRole]);

  // COA Access Verification for Specific Client Account
  const isCoaUnlockedForClient = useCallback((lot, clientEmail) => {
    if (!clientEmail) return false;
    return (lot.coaUnlockedByClients || []).includes(clientEmail.toLowerCase());
  }, []);

  const unlockCoaForClient = useCallback((lotId, clientEmail) => {
    setLots(prev => prev.map(l => {
      if (l.lotId === lotId) {
        const unlockedList = l.coaUnlockedByClients || [];
        const normalized = (clientEmail || 'sam@acmecorp.com').toLowerCase();
        if (!unlockedList.includes(normalized)) {
          return { ...l, coaUnlockedByClients: [...unlockedList, normalized] };
        }
      }
      return l;
    }));
  }, []);

  // Purchase Order Receiving & Automatic Lot Generation
  const receivePurchaseOrder = useCallback((poId, receivingData) => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) return;

    const newLotId = receivingData?.lotId || `LOT-PO-${Math.floor(10000 + Math.random() * 90000)}`;
    const recQty = Number(receivingData?.qty || 100);
    const destinationLocation = receivingData?.location || 'Receiving Dock Bin B-04';

    // 1. Create New Lot Entry
    const newLot = {
      lotId: newLotId,
      productName: targetPO.items[0]?.name || 'Received Supplier Goods',
      category: 'Purchased Stock',
      status: 'AVAILABLE',
      receivedDate: new Date().toISOString().split('T')[0],
      expiryDate: receivingData?.expiryDate || '2025-12-31',
      qty: recQty,
      location: destinationLocation,
      coaUnlockedByClients: [],
      labName: 'Inbound Dock Quality Inspection',
      testCertificateId: `COA-PO-${Date.now().toString().slice(-4)}`,
      purityScore: '100% Passed',
    };
    setLots(prev => [newLot, ...prev]);

    // 2. Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.id === targetPO.items[0]?.productId || p.sku === targetPO.items[0]?.sku) {
        const newTotal = p.totalStock + recQty;
        const newAvailable = p.availableStock + recQty;
        return { ...p, totalStock: newTotal, availableStock: newAvailable };
      }
      return p;
    }));

    // 3. Log Inbound Movement
    const newMov = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      productName: targetPO.items[0]?.name || 'Received Supplier Goods',
      sku: targetPO.items[0]?.sku || 'SKU-PO-REC',
      type: 'Inbound Receipt',
      quantity: recQty,
      sourceLocation: `Vendor (${targetPO.supplier})`,
      destLocation: destinationLocation,
      reason: `Received Goods PO ${targetPO.poNumber}`,
      performedBy: 'Receiving Staff',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMovements(prev => [newMov, ...prev]);

    // 4. Update PO status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Received' } : p));
  }, [purchaseOrders]);

  const createPurchaseOrder = useCallback((purchaseOrder) => {
    const created = {
      id: `PO-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 94).padStart(4, '0')}`,
      status: 'Pending Approval',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: purchaseOrder.createdBy || 'Warehouse Team',
      totalItems: purchaseOrder.items?.length || 1,
      ...purchaseOrder,
    };
    setPurchaseOrders((prev) => [created, ...prev]);
    return created;
  }, [purchaseOrders.length]);

  // Sales Order Approval & Rejection Flow
  const approveSalesOrder = useCallback((soId) => {
    const targetSO = salesOrders.find(s => s.id === soId);
    if (!targetSO) return;

    // 1. Reserve Stock in Product Catalog
    setProducts(prev => prev.map(p => {
      if (p.name === targetSO.items?.[0]?.name || p.sku === targetSO.items?.[0]?.sku) {
        const reserveQty = 10;
        return {
          ...p,
          committedStock: p.committedStock + reserveQty,
          availableStock: Math.max(0, p.availableStock - reserveQty),
        };
      }
      return p;
    }));

    // 2. Update SO status to Picking
    setSalesOrders(prev => prev.map(s => s.id === soId ? { ...s, status: 'Picking' } : s));
  }, [salesOrders]);

  const rejectSalesOrder = useCallback((soId, reason) => {
    setSalesOrders(prev => prev.map(s => s.id === soId ? { ...s, status: 'Rejected', rejectionReason: reason || 'Stock unavailable' } : s));
  }, []);

  const createSalesOrder = useCallback((newSO) => {
    setSalesOrders(prev => [newSO, ...prev]);
  }, []);

  // Transfer Order Dispatch & Stock Mutation
  const dispatchTransferOrder = useCallback((toId) => {
    const targetTO = transferOrders.find(t => t.id === toId);
    if (!targetTO) return;

    // Deduct stock from origin lot
    setLots(prev => prev.map(l => {
      if (l.lotId === targetTO.lotId) {
        return { ...l, qty: Math.max(0, l.qty - targetTO.qty) };
      }
      return l;
    }));

    // Log movement
    const newMov = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      productName: targetTO.productName,
      sku: 'SKU-TO-TRANS',
      type: 'Transfer Dispatch',
      quantity: -targetTO.qty,
      sourceLocation: `${targetTO.sourceCompany} (${targetTO.sourceWarehouse})`,
      destLocation: `${targetTO.destCompany} (${targetTO.destWarehouse})`,
      reason: `Transfer Order ${targetTO.toNumber} Dispatched`,
      performedBy: 'Logistics Supervisor',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMovements(prev => [newMov, ...prev]);

    setTransferOrders(prev => prev.map(t => t.id === toId ? { ...t, status: 'In Transit' } : t));
  }, [transferOrders]);

  const receiveTransferOrder = useCallback((toId) => {
    const targetTO = transferOrders.find(t => t.id === toId);
    if (!targetTO) return;

    // Credit stock to destination
    setLots(prev => prev.map(l => {
      if (l.lotId === targetTO.lotId) {
        return { ...l, qty: l.qty + targetTO.qty, location: targetTO.destWarehouse };
      }
      return l;
    }));

    setTransferOrders(prev => prev.map(t => t.id === toId ? { ...t, status: 'Received' } : t));
  }, [transferOrders]);

  const createTransferOrder = useCallback((newTO) => {
    setTransferOrders(prev => [newTO, ...prev]);
  }, []);

  // Stock Adjustment & Movement
  const adjustStock = useCallback(({ productId, productName, sku, quantity, reason, location, user }) => {
    const qtyNum = Number(quantity);
    setProducts(prev => prev.map(p => {
      if (p.id === productId || p.sku === sku) {
        return {
          ...p,
          totalStock: p.totalStock + qtyNum,
          availableStock: Math.max(0, p.availableStock + qtyNum),
        };
      }
      return p;
    }));

    const newMov = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      productName: productName || 'Stock Item',
      sku: sku || 'SKU-000',
      type: 'Stock Adjustment',
      quantity: qtyNum,
      sourceLocation: location || 'Warehouse Bin',
      destLocation: qtyNum < 0 ? 'Adjustment Hold' : 'Warehouse Shelf',
      reason: reason || 'Physical Stock Discrepancy',
      performedBy: user?.name || 'Warehouse Staff',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMovements(prev => [newMov, ...prev]);
  }, []);

  // Barcode Location Movement Handler
  const moveBarcodeLocation = useCallback((barcodeCode, newBin, user) => {
    setLots(prev => prev.map(l => {
      if (l.lotId === barcodeCode || l.testCertificateId.includes(barcodeCode)) {
        return { ...l, location: newBin };
      }
      return l;
    }));

    const newMov = {
      id: `MOV-${Date.now().toString().slice(-6)}`,
      productName: `Scanned SKU (${barcodeCode})`,
      sku: barcodeCode,
      type: 'Location Relocation',
      quantity: 0,
      sourceLocation: 'Handheld Barcode Scanner',
      destLocation: newBin,
      reason: `Relocated via Barcode Scan to Bin ${newBin}`,
      performedBy: user?.name || 'Scanner Operative',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setMovements(prev => [newMov, ...prev]);
  }, []);

  return (
    <WmsStoreContext.Provider
      value={{
        products,
        lots,
        purchaseOrders,
        transferOrders,
        salesOrders,
        movements,
        getProductsForUser,
        isCoaUnlockedForClient,
        unlockCoaForClient,
        receivePurchaseOrder,
        createPurchaseOrder,
        approveSalesOrder,
        rejectSalesOrder,
        createSalesOrder,
        createTransferOrder,
        dispatchTransferOrder,
        receiveTransferOrder,
        adjustStock,
        moveBarcodeLocation,
      }}
    >
      {children}
    </WmsStoreContext.Provider>
  );
};

export const useWmsStore = () => {
  const ctx = useContext(WmsStoreContext);
  if (!ctx) throw new Error('useWmsStore must be used inside WmsStoreProvider');
  return ctx;
};

export default WmsStoreContext;
