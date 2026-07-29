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
};
