import { api } from './api';

export const userService = {
  getUsers: async (role, companyId) => {
    let url = '/users';
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (companyId) params.append('companyId', companyId);
    if (params.toString()) url += `?${params.toString()}`;
    return await api.get(url);
  },
  inviteUser: async (data) => {
    return await api.post('/users', data);
  },
  updateUser: async (id, data) => {
    return await api.put(`/users/${id}`, data);
  },
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },
};
