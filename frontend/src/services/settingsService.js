import { api } from './api';

export const settingsService = {
  async getSettings() {
    const res = await api.get('/v1/settings');
    return res.data || res;
  },

  async updateSettings(settingsData) {
    const res = await api.put('/v1/settings', settingsData);
    return res.data || res;
  }
};
