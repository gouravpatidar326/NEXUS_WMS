import { api } from './api';

export const userService = {
  getUsers: async () => {
    return await api.get('/users');
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
