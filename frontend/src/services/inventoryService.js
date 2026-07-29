import { api } from './api';

export const inventoryService = {
  async getMovements({ search = '', type = '', page = 1, pageSize = 10 } = {}) {
    const movementsStore = await api.get('/inventory');

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

  async adjustStock({ productId, quantity, reason, location }) {
    // Map frontend args to backend body
    return await api.post('/inventory/adjust', {
      productId,
      location: location || 'Warehouse Shelf',
      quantityDelta: Number(quantity),
      reason
    });
  },
};
