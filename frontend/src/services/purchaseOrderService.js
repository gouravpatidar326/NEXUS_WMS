import { api } from './api';

export const purchaseOrderService = {
  fetchPurchaseOrders: async () => {
    try {
      const response = await api.get('/purchase-orders');
      return response; // api.js already returns the JSON response
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  },

  createPurchaseOrder: async (poData) => {
    try {
      const response = await api.post('/purchase-orders', poData);
      return response;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  },

  receivePurchaseOrder: async (poId, lotsData) => {
    try {
      // lotsData is an array of lots
      const response = await api.post(`/purchase-orders/${poId}/receive`, { lots: lotsData });
      return response;
    } catch (error) {
      console.error('Error receiving purchase order goods:', error);
      throw error;
    }
  }
};
