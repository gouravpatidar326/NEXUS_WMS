import { api } from './api';

export const roleService = {
  getRoles: async () => {
    return await api.get('/roles');
  },
  updateRolePermissions: async (roleKey, permissions) => {
    return await api.put(`/roles/${roleKey}/permissions`, { permissions });
  },
};
