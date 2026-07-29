import { api } from './api';

export const receivingService = {
  async getReceivings(params = {}) {
    const res = await api.get('/v1/receiving');
    return res.data || [];
  },

  async createReceiving(data) {
    return await api.post('/v1/receiving', data);
  },

  async processInspection(receivingId, data) {
    return await api.post(`/v1/receiving/${receivingId}/inspect`, data);
  },

  async completePutaway(receivingId, data) {
    return await api.post(`/v1/receiving/${receivingId}/complete`, data);
  },
};
