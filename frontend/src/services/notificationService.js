import { api } from './api';

export const notificationService = {
  fetchNotifications() {
    return api.get('/v1/notifications');
  },

  markAllAsRead() {
    return api.put('/v1/notifications/read-all', {});
  },

  markAsRead(id) {
    return api.put(`/v1/notifications/${id}/read`, {});
  }
};

export default notificationService;
