import { api } from './api';

export const warehouseService = {
  async getLocations() {
    return await api.get('/locations');
  },

  async createLocation(locationData) {
    return await api.post('/locations', locationData);
  },

  async getPickLists() {
    return await api.get('/pick-lists');
  },

  async completePick(id, payload) {
    return await api.post(`/pick-lists/${id}/pick`, payload);
  },

  async getWarehouses() {
    return await api.get('/warehouses');
  },

  async createWarehouse(data) {
    return await api.post('/warehouses', data);
  },

  async updateWarehouse(id, data) {
    return await api.put(`/warehouses/${id}`, data);
  },

  async deleteWarehouse(id) {
    return await api.delete(`/warehouses/${id}`);
  },
};
