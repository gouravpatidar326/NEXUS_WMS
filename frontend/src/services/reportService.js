import { api } from './api';

export const reportService = {
  async getStockValuation() {
    const res = await api.get('/reports/stock-valuation');
    return Array.isArray(res) ? res : res?.data || [];
  },

  async getInventoryVelocity() {
    const res = await api.get('/reports/inventory-velocity');
    return Array.isArray(res) ? res : res?.data || [];
  },
};
