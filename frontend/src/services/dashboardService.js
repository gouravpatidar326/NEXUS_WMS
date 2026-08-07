import { api } from './api';

export const dashboardService = {
  async getManagerSummary() {
    const response = await api.get('/dashboard/manager-summary');
    return response;
  },
  getSuperAdminDashboard: async (period = '30d') => {
    return await api.request(`/dashboard/super-admin?period=${period}`);
  },
  getManagerDashboard: async () => {
    return await api.request('/dashboard/manager');
  },
  getClerkDashboard: async () => {
    return await api.request('/dashboard/clerk');
  },
  getClientDashboard: async () => {
    return await api.request('/dashboard/client');
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
