import { api } from './api';

export const dashboardService = {
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
