import { api } from './api';

export const batchService = {
  async getBatches() {
    const res = await api.get('/v1/lots');
    return res.data || [];
  },

  async getExpiringBatches() {
    const res = await api.get('/v1/expiry/alerts');
    return res.data || [];
  },

  async createBatch(batchData) {
    return await api.post('/v1/lots', batchData);
  },

  async updateLotStatus(id, status) {
    return await api.patch(`/v1/lots/${id}/status`, { status });
  },
};
