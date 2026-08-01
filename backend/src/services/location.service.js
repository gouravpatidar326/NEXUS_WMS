const locationRepository = require('../repositories/location.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class LocationService {
  async createLocation(companyId, payload) {
    if (!payload.zone || !payload.aisle || !payload.rack || !payload.shelf || !payload.bin) {
      throw new Error('Zone, Aisle, Rack, Shelf, and Bin are required for location hierarchy');
    }

    const code = payload.code || `${payload.zone}-${payload.aisle}-${payload.rack}-${payload.shelf}-${payload.bin}`.toUpperCase();

    const prisma = require('../utils/prisma');
    const warehouseName = payload.warehouse || 'Main Warehouse';
    
    const facility = await prisma.warehouse.findFirst({
      where: { name: warehouseName, companyId }
    });
    if (!facility) {
      throw new Error('Associated facility not found for validation');
    }

    if (payload.capacityType && payload.capacityType !== (facility.capacityType || 'Items')) {
      throw new Error(`Unit mismatch! Warehouse uses '${facility.capacityType || 'Items'}', Bin cannot be created in '${payload.capacityType}'.`);
    }

    const existingLocs = await prisma.location.findMany({
      where: { warehouse: warehouseName, companyId, deletedAt: null }
    });
    
    const currentProvisioned = existingLocs.reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0);
    const newBinCapacity = parseInt(payload.maxCapacity || '1000', 10);

    if (facility.capacityValue !== null && (currentProvisioned + newBinCapacity > facility.capacityValue)) {
      throw new Error(`Warehouse capacity is ${facility.capacityValue}. Existing bins are using ${currentProvisioned}. A new bin can have a maximum capacity of ${facility.capacityValue - currentProvisioned}.`);
    }

    const data = {
      code,
      name: payload.name || `Bin ${code}`,
      warehouse: warehouseName,
      zone: payload.zone.toUpperCase(),
      aisle: payload.aisle.toUpperCase(),
      rack: payload.rack.toUpperCase(),
      shelf: payload.shelf.toUpperCase(),
      bin: payload.bin.toUpperCase(),
      capacityType: facility.capacityType || 'Items',
      maxCapacity: newBinCapacity,
      occupied: 0,
      status: payload.status || 'Active',
      companyId,
    };

    return await locationRepository.create(data);
  }

  async getLocationById(id, companyId) {
    const location = await locationRepository.findById(id, companyId);
    if (!location) {
      throw new Error('Storage bin location not found');
    }
    return location;
  }

  async getLocations(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const warehouse = query.warehouse || null;
    const zone = query.zone || null;
    const status = query.status || null;
    const search = query.search || null;

    const { items, total } = await locationRepository.findAll({
      companyId,
      warehouse,
      zone,
      status,
      search,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async updateLocation(id, companyId, payload) {
    const existingLocation = await this.getLocationById(id, companyId);
    const prisma = require('../utils/prisma');
    
    const facility = await prisma.warehouse.findFirst({
      where: { name: existingLocation.warehouse, companyId }
    });
    if (!facility) {
      throw new Error('Associated facility not found for validation');
    }

    if (payload.capacityType && payload.capacityType !== (facility.capacityType || 'Items')) {
      throw new Error(`Unit mismatch! Warehouse uses '${facility.capacityType || 'Items'}', Bin cannot be created in '${payload.capacityType}'.`);
    }

    if (payload.maxCapacity !== undefined && facility.capacityValue !== null) {
      const newMaxCapacity = parseInt(payload.maxCapacity, 10);
      const allLocs = await prisma.location.findMany({
        where: { warehouse: existingLocation.warehouse, companyId, deletedAt: null }
      });
      // Sum all OTHER bins
      const otherProvisioned = allLocs.filter(l => l.id !== id).reduce((sum, loc) => sum + (loc.maxCapacity || 0), 0);
      if (otherProvisioned + newMaxCapacity > facility.capacityValue) {
        throw new Error(`Warehouse capacity is ${facility.capacityValue}. Existing bins are using ${otherProvisioned}. A new bin can have a maximum capacity of ${facility.capacityValue - otherProvisioned}.`);
      }
    }
    
    const updateData = {};
    if (payload.code) updateData.code = payload.code;
    if (payload.zone) updateData.zone = payload.zone;
    if (payload.aisle) updateData.aisle = payload.aisle;
    if (payload.rack) updateData.rack = payload.rack;
    if (payload.shelf) updateData.shelf = payload.shelf;
    if (payload.bin) updateData.bin = payload.bin;
    if (payload.maxCapacity !== undefined) updateData.maxCapacity = parseInt(payload.maxCapacity, 10);
    if (payload.status) updateData.status = payload.status;
    if (payload.capacityType) updateData.capacityType = payload.capacityType;

    await locationRepository.update(id, companyId, updateData);
    return await this.getLocationById(id, companyId);
  }

  async deleteLocation(id, companyId) {
    await this.getLocationById(id, companyId);
    await locationRepository.softDelete(id, companyId);
    return { id, deleted: true };
  }
}

module.exports = new LocationService();
