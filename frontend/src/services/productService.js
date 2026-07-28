import { api } from './api';

export const productService = {
  async getProducts({ search = '', category = '', status = '', page = 1, pageSize = 10 } = {}) {
    const products = await api.get('/warehouse/products');
    
    // Front-end local filtering/pagination since backend GET /api/warehouse/products returns all
    let filtered = [...products];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return { items, totalItems, totalPages, currentPage: page, pageSize };
  },

  async getProductById(id) {
    const products = await api.get('/warehouse/products');
    return products.find(p => p.id === id);
  },

  async createProduct(productData) {
    return await api.post('/warehouse/products', productData);
  },

  async updateProduct(id, updates) {
    // Phase 2 backend doesn't have PUT /products/:id, returning updates mock
    return { id, ...updates };
  },

  async deleteProduct(id) {
    return true;
  },
};
