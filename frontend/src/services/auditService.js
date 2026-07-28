import { api } from './api';

export const auditService = {
  async getLogs() {
    return await api.get('/audit-logs');
  },

  async logAction({ action, module, performedBy, details }) {
    // Actions are logged automatically by the backend in phase 1-3.
    // Frontend-driven manual logs are not currently supported by backend,
    // so we just return a mock success for UI continuity if it's called.
    return { success: true };
  },
};
