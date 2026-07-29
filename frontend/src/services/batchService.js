import { api } from './api';

export const batchService = {
  async getBatches() {
    return await api.get('/batches');
  },

  async getExpiringBatches(daysThreshold = 60) {
    const batches = await api.get('/batches');
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return batches.filter(
      (b) => b.expiryDate && new Date(b.expiryDate) <= thresholdDate
    );
  },

  async createBatch(batchData) {
    return await api.post('/batches', batchData);
  },

  async updateBatch(id, updateData) {
    return await api.put(`/batches/${id}`, updateData);
  },

  async unlockCoa(id, paymentToken) {
    return await api.post(`/batches/${id}/unlock-coa`, { paymentToken });
  }
};
