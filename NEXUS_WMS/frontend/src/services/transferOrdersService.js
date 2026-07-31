import { api } from './api';

export const transferOrdersService = {
  async getTransferOrders() {
    const res = await api.get('/v1/transfers');
    return res.data || res;
  },

  async createTransferOrder({ sourceLocationId, destLocationId, items, transferType }) {
    return await api.post('/v1/transfers', {
      sourceLocationId,
      destLocationId,
      items,
      transferType: transferType || 'BIN_TO_BIN',
    });
  },

  async getCompanies() {
    return await api.get('/companies');
  },
};
