import { api } from './api';

export const dashboardService = {
<<<<<<< HEAD
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
=======
  getSuperAdminDashboard: async () => {
    return await api.request('/dashboard/super-admin');
  },
  getManagerDashboard: async () => {
    return await api.request('/dashboard/manager');
  },
  getClerkDashboard: async () => {
    return await api.request('/dashboard/clerk');
  },
  getClientDashboard: async () => {
    return await api.request('/dashboard/client');
>>>>>>> bfea083027191f1ba39e44601454fe317a16f51a
  }
};
