import { api } from './api';

export const warehouseService = {
  async getLocations() {
    // Note: The backend doesn't have a dedicated location CRUD in Phase 1-3.
    // It assumes locations are string identifiers (e.g. 'A-01'). 
    // Returning an empty array for now.
    return [];
  },

  async createLocation(locationData) {
    return {
      id: `LOC-${locationData.zone?.substring(5, 6) || 'X'}-${locationData.aisle}-${locationData.rack}`,
      status: 'Active',
      occupied: 0,
      ...locationData,
    };
  },
};
