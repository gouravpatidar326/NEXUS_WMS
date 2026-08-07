import { api } from './api';

export const productService = {
  async getProducts(params = {}) {
    const { search = '', category = '', categoryId, status = '', page = 1, pageSize = 50 } = params || {};
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (category || categoryId) queryParams.append('categoryId', category || categoryId);
    if (status) queryParams.append('status', status);
    if (page) queryParams.append('page', page);
    if (pageSize) queryParams.append('limit', pageSize);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await api.get(`/v1/products${queryString}`);

    // If backend returns { data: [...], pagination: {...} } or array
    if (res && res.data) {
      const items = res.data;
      items.items = res.data;
      items.meta = res.pagination;
      return items;
    }
    return Array.isArray(res) ? res : (res?.items || []);
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

  async importProducts(productsArray) {
    return await api.post('/v1/products/bulk', { products: productsArray });
  },
};
