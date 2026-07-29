import { api } from './api';

export const inventoryService = {
  async getMovements({ search = '', type = '', page = 1, pageSize = 10 } = {}) {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (type) query.append('movementType', type);
    if (page) query.append('page', page);
    if (pageSize) query.append('limit', pageSize);

    const mappedMovements = movementsStore.map(m => ({
      ...m,
      productName: m.product?.name || 'Unknown',
      sku: m.product?.sku || 'Unknown',
      type: m.movementType === 'INBOUND' ? 'Inbound Receipt' : 'Stock Adjustment',
      quantity: m.quantityDelta,
      sourceLocation: m.quantityDelta < 0 ? m.location : '-',
      destLocation: m.quantityDelta > 0 ? m.location : '-',
      reason: m.movementType,
      performedBy: 'System',
      timestamp: new Date(m.timestamp).toLocaleString()
    }));

    let filtered = [...mappedMovements];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.productName.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.reason.toLowerCase().includes(q)
      );
    }

    if (type) {
      filtered = filtered.filter((m) => m.type === type);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, totalItems, totalPages, currentPage: page, pageSize };
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
