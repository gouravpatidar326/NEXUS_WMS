import { api } from './api';

export const clientService = {
  fetchClients: async () => {
    try {
      const response = await api.get('/warehouse-clients');
      return response;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }
};
