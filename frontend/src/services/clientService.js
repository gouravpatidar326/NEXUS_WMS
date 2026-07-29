import { api } from './api';

export const clientService = {
  fetchClients: async () => {
    return await api.get('/clients');
  },
  createClient: async (data) => {
    return await api.post('/clients', data);
  },
  updateClient: async (id, data) => {
    return await api.put(`/clients/${id}`, data);
  },
  deleteClient: async (id) => {
    return await api.delete(`/clients/${id}`);
  },
};
