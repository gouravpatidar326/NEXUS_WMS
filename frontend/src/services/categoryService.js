import { api } from './api';

export const categoryService = {
  async getCategories() {
    const res = await api.get('/v1/categories');
    return res.data || [];
  },

  async createCategory(data) {
    return await api.post('/v1/categories', data);
  },

  async updateCategory(id, data) {
    return await api.put(`/v1/categories/${id}`, data);
  },

  async deleteCategory(id) {
    return await api.delete(`/v1/categories/${id}`);
  },
};
