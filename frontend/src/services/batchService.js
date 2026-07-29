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
<<<<<<< HEAD
    return await api.post('/batches', batchData);
=======
    return await api.post('/v1/lots', batchData);
  },

  async updateLotStatus(id, status) {
    return await api.patch(`/v1/lots/${id}/status`, { status });
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
  },

  async updateBatch(id, updateData) {
    return await api.put(`/batches/${id}`, updateData);
  },

  async unlockCoa(id, paymentToken) {
    return await api.post(`/batches/${id}/unlock-coa`, { paymentToken });
  }
};
