import { api } from './api';

export const auditService = {
  async getLogs(params = {}) {
    const { search = '', module = '', action = '', page = 1, limit = 50 } = params || {};
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (module) query.append('module', module);
    if (action) query.append('action', action);
    if (page) query.append('page', page);
    if (limit) query.append('limit', limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/audit-logs${queryString}`);
    
    if (res && res.data) {
      return {
        items: res.data,
        pagination: res.pagination || {},
      };
    }
    return {
      items: Array.isArray(res) ? res : [],
      pagination: {},
    };
  },

  async logAction({ event, details }) {
    return { success: true };
  },
};
