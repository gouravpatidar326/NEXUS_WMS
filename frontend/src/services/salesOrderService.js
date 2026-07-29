import { api } from './api';

export const salesOrderService = {
  fetchSalesOrders: async () => {
    try {
      const response = await api.get('/sales-orders');
      return response;
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      throw error;
    }
  },

  createSalesOrder: async (orderData) => {
    try {
      const response = await api.post('/sales-orders', orderData);
      return response;
    } catch (error) {
      console.error('Error creating sales order:', error);
      throw error;
    }
  },

  approveSalesOrder: async (orderId) => {
    try {
      const response = await api.post(`/sales-orders/${orderId}/approve`, {});
      return response;
    } catch (error) {
      console.error('Error approving sales order:', error);
      throw error;
    }
  },

  rejectSalesOrder: async (orderId, reason) => {
    try {
      const response = await api.post(`/sales-orders/${orderId}/reject`, { reason });
      return response;
    } catch (error) {
      console.error('Error rejecting sales order:', error);
      throw error;
    }
  }
};
