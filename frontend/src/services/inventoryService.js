import { api } from './api';

export const inventoryService = {
  async getMovements({ search = '', type = '', page = 1, pageSize = 10 } = {}) {
    const movementsStore = await api.get('/warehouse/inventory');

    let filtered = [...movementsStore];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.product?.name?.toLowerCase().includes(q) ||
          m.product?.sku?.toLowerCase().includes(q) ||
          m.movementType?.toLowerCase().includes(q)
      );
    }

    if (type) {
      filtered = filtered.filter((m) => m.movementType === type);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, totalItems, totalPages, currentPage: page, pageSize };
  },

  async adjustStock({ productId, quantity, reason, location }) {
    // Map frontend args to backend body
    return await api.post('/warehouse/inventory/adjust', {
      productId,
      location: location || 'Warehouse Shelf',
      quantityDelta: Number(quantity),
      reason
    });
  },
};
