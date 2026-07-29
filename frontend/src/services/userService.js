import { api } from './api';

export const userService = {
  getUsers: async () => {
    return await api.get('/users');
  },
  inviteUser: async (userData) => {
    return await api.post('/users', userData);
  },
  updateUser: async (id, userData) => {
    return await api.put(`/users/${id}`, userData);
  },
  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },
};
