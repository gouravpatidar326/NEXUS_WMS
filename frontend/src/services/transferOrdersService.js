import { api } from './api';

export const transferOrdersService = {
  /**
   * Fetch all transfer orders for the current user's company (as source or destination).
   */
  async getTransferOrders() {
    return await api.get('/transfer-orders');
  },

  /**
   * Create a new cross-company transfer order.
   * @param {string} destinationCompanyId - Target company DB id
   * @param {string} productId - Product DB id to transfer
   * @param {number} quantity - Units to transfer
   */
  async createTransferOrder({ destinationCompanyId, productId, quantity }) {
    return await api.post('/transfer-orders', { destinationCompanyId, productId, quantity });
  },

  /**
   * Fetch all companies in the system for destination company dropdown.
   */
  async getCompanies() {
    return await api.get('/companies');
  },
};
