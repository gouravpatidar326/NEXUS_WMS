import { api } from './api';

export const dashboardService = {
  async getManagerSummary() {
    return await api.get('/dashboard/manager');
  },
  getSuperAdminDashboard: async () => {
    return await api.get('/dashboard/super-admin');
  },
  getManagerDashboard: async () => {
    return await api.get('/dashboard/manager');
  },
  getClerkDashboard: async () => {
    return await api.get('/dashboard/clerk');
  },
  getClientDashboard: async () => {
    return await api.get('/dashboard/client');
  }
};

export const reportsService = {
  async getStockValuation() {
    return await api.get('/reports/stock-valuation');
  },
  async getInventoryVelocity() {
    return await api.get('/reports/inventory-velocity');
  }
};
