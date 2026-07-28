import { api } from './api';

export const batchService = {
  async getBatches() {
    return await api.get('/warehouse/batches');
  },

  async getExpiringBatches(daysThreshold = 60) {
    const batches = await api.get('/warehouse/batches');
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return batches.filter(
      (b) => b.expiryDate && new Date(b.expiryDate) <= thresholdDate
    );
  },

  async createBatch(batchData) {
    // Phase 2 backend automatically creates batches via PO Receipt,
    // so manual creation isn't implemented in the mock, but we can mock it here for UI continuity
    return {
      id: `BAT-2026-0${Math.floor(Math.random() * 1000)}`,
      status: 'Healthy',
      ...batchData,
    };
  },
};
