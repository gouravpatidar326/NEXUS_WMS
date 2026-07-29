import { api } from './api';

export const shippingService = {
  async getShipments() {
    return await api.get('/shipping');
  },

  async createShipment(shipmentData) {
    return await api.post('/shipping/label', {
      orderId: shipmentData.orderId,
      carrier: shipmentData.carrier,
      recipient: shipmentData.recipient,
      destination: shipmentData.destination
    });
  },
};
