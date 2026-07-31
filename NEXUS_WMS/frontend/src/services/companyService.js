import { api } from './api';

export const companyService = {
  getCompanies: async () => {
    return await api.get('/companies');
  },
  createCompany: async (data) => {
    return await api.post('/companies', data);
  },
  updateCompany: async (id, data) => {
    return await api.put(`/companies/${id}`, data);
  },
  deleteCompany: async (id) => {
    return await api.delete(`/companies/${id}`);
  },
};
