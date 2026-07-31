import { api } from './api';

export const inventoryService = {
  async getMovements(params = {}) {
    const { search = '', type = '', page = 1, limit = 100 } = params || {};
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (type) query.append('movementType', type);
    if (page) query.append('page', page);
    if (limit) query.append('limit', limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/v1/inventory/transactions${queryString}`);
    
    if (res && res.data) {
      return {
        items: res.data,
        totalItems: res.pagination?.totalItems || res.data.length,
        totalPages: res.pagination?.totalPages || 1,
        currentPage: res.pagination?.currentPage || 1,
      };
    }
    return { items: Array.isArray(res) ? res : (res?.items || []), totalItems: 0, totalPages: 1, currentPage: 1 };
  },

  async getBinInventory(params = {}) {
    const res = await api.get('/v1/inventory/bins');
    if (res && res.data) {
      return res.data;
    }
    return Array.isArray(res) ? res : (res?.items || []);
  },

  async getInventorySummary(params = {}) {
    const res = await api.get('/v1/inventory/summary');
    if (res && res.data) {
      return res.data;
    }
    return Array.isArray(res) ? res : (res?.items || []);
  },

  async adjustStock({ productId, lotId, locationId, quantityDelta, reasonCode, notes }) {
    return await api.post('/v1/adjustments', {
      productId,
      lotId,
      locationId,
      quantityDelta: Number(quantityDelta),
      reasonCode: reasonCode || 'MANUAL_CORRECTION',
      notes,
    });
  },
};
