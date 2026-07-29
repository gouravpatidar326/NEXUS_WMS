import { api } from './api';

export const productService = {
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit || params.pageSize || 10);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`/v1/products${queryString}`);
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

  async getProductById(id) {
    const res = await api.get(`/v1/products/${id}`);
    return res.data || res;
  },

  async createProduct(productData) {
    return await api.post('/v1/products', productData);
  },

  async updateProduct(id, updates) {
    return await api.put(`/v1/products/${id}`, updates);
  },

  async deleteProduct(id) {
    return await api.delete(`/v1/products/${id}`);
  },
};
