import { api } from './api';

export const dashboardService = {
  async getManagerSummary() {
<<<<<<< HEAD
    const response = await api.get('/dashboard/manager-summary');
    return response;
  },
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
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
  }
};
