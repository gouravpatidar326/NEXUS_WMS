import { api } from './api';

export const inventoryService = {
  async getMovements({ search = '', type = '', page = 1, pageSize = 10 } = {}) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (type) query.append('movementType', type);
    if (page) query.append('page', page);
    if (pageSize) query.append('limit', pageSize);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/v1/inventory/transactions${queryString}`);
    if (res && res.data) {
      return {
        items: res.data,
        totalItems: res.pagination?.totalItems || res.data.length,
        totalPages: res.pagination?.totalPages || 1,
        currentPage: res.pagination?.currentPage || 1,
        pageSize: res.pagination?.limit || 10,
      };
    }
    return { items: Array.isArray(res) ? res : [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 };
  },

  async getBinInventory(params = {}) {
    const res = await api.get('/v1/inventory/bins');
    return res.data || [];
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
