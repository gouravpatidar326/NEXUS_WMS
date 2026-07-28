import { api } from './api';

export const shippingService = {
  async getShipments() {
    // Shipping tracking is mocked in the ShipStation API mock for now
    return [];
  },

  async createShipment(shipmentData) {
    return await api.post('/warehouse/shipping/label', {
      orderId: shipmentData.orderId,
      carrier: shipmentData.carrier
    });
  },
};
