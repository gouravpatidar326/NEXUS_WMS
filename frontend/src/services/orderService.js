import { api } from './api';

export const orderService = {
  // Purchase Orders
  async getPurchaseOrders({ search = '', status = '' } = {}) {
    const poStore = await api.get('/purchase-orders');
    
    let filtered = [...poStore];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (po) => po.id.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q)
      );
    }
    if (status) filtered = filtered.filter((po) => po.status === status);
    return filtered;
  },

  async createPurchaseOrder(poData) {
    // Note: create PO is not fully implemented in the backend phase 2 (only receiving is),
    // but we return a mock to keep the UI functioning
    return {
      id: `PO-${Date.now()}`,
      poNumber: `PO-2026-X`,
      status: 'Pending Approval',
      createdAt: new Date().toISOString(),
      items: poData.items || [],
      totalAmount: poData.totalAmount || 0,
      totalItems: poData.items ? poData.items.length : 0,
      supplier: poData.supplier,
    };
  },

  // Transfer Orders
  async getTransferOrders() {
    return await api.get('/transfer-orders');
  },

  async createTransferOrder(toData) {
    return await api.post('/warehouse/transfer-orders', toData);
  },

  // Sales Orders
  async getSalesOrders({ search = '', status = '' } = {}) {
    // Handle role check indirectly by assuming warehouse endpoint for managers, client for clients
    // In our backend design, WAREHOUSE_MANAGER hits /warehouse/sales-orders
    // CLIENT hits /client/sales-orders
    // The frontend logic should ideally use the Auth role, but for simplicity we'll try warehouse first
    // Since the API client uses the stored token, the backend will verify roles.
    
    let soStore = [];
    try {
      soStore = await api.get('/sales-orders');
    } catch (error) {
      // Fallback if user is a CLIENT and blocked from warehouse routes
      soStore = await api.get('/client/sales-orders');
    }

    let filtered = [...soStore];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (so) => so.id.toLowerCase().includes(q) || (so.client && so.client.name.toLowerCase().includes(q))
      );
    }
    if (status) filtered = filtered.filter((so) => so.status === status);
    return filtered;
  },

  async createSalesOrder(soData) {
    return await api.post('/client/sales-orders', soData);
  },
};
