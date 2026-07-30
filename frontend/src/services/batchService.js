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
    return await api.post('/batches', batchData);
  },

  async updateBatch(id, updateData) {
    return await api.put(`/batches/${id}`, updateData);
  },

  async unlockCoa(id, paymentToken) {
    return await api.post(`/batches/${id}/unlock-coa`, { paymentToken });
  },

  async deleteBatch(id) {
    return await api.delete(`/batches/${id}`);
  }
};
