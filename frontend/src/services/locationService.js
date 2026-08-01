import { api } from './api';

export const locationService = {
  async getLocations(params = {}) {
    const res = await api.get('/v1/locations', { params });
    return res.data || [];
  },

  async getLocationById(id) {
    const res = await api.get(`/v1/locations/${id}`);
    return res.data || res;
  },

  async createLocation(data) {
    return await api.post('/v1/locations', data);
  },

  async updateLocation(id, data) {
    return await api.put(`/v1/locations/${id}`, data);
  },

  async deleteLocation(id) {
    return await api.delete(`/v1/locations/${id}`);
  },
};
