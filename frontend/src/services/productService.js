import { api } from './api';

export const productService = {
<<<<<<< HEAD
  async getProducts({ search = '', category = '', status = '', page = 1, pageSize = 10 } = {}) {
    const products = await api.get('/products');
    
    // Front-end local filtering/pagination since backend GET /api/products returns all
    let filtered = [...products];
=======
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit || params.pageSize || 10);
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36

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
<<<<<<< HEAD
    return await api.post('/products', productData);
=======
    return await api.post('/v1/products', productData);
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
  },

  async updateProduct(id, updates) {
    return await api.put(`/v1/products/${id}`, updates);
  },

  async deleteProduct(id) {
<<<<<<< HEAD
    return await api.delete(`/products/${id}`);
=======
    return await api.delete(`/v1/products/${id}`);
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
  },
};
