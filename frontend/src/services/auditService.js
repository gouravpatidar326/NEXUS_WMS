import { api } from './api';

export const auditService = {
  async getLogs(params = {}) {
    const { search = '', event = '' } = params || {};
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (event) query.append('event', event);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/audit-logs${queryString}`);
    return Array.isArray(res) ? res : (res?.data || res?.items || []);
  },

  async logAction({ event, details }) {
    return { success: true };
  },
};
