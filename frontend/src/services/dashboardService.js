import { api } from './api';

export const dashboardService = {
  async getManagerSummary() {
    const response = await api.get('/dashboard/manager-summary');
    return response;
  }
};

export const reportsService = {
  async getStockValuation() {
    const response = await api.get('/reports/stock-valuation');
    return response;
  },
  async getInventoryVelocity() {
    const response = await api.get('/reports/inventory-velocity');
    return response;
  }
};
