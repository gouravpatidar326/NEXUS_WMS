const locationRepository = require('../repositories/location.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');
const prisma = require('../utils/prisma');

class LocationService {
  async createLocation(companyId, payload) {
    if (!payload.zone || !payload.aisle || !payload.rack || !payload.shelf || !payload.bin) {
      throw new Error('Zone, Aisle, Rack, Shelf, and Bin are required for location hierarchy');
    }

    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      if (payload.warehouse) {
        const warehouseRecord = await prisma.warehouse.findFirst({
          where: { name: payload.warehouse }
        });
        if (warehouseRecord) {
          targetCompanyId = warehouseRecord.companyId;
        }
      }

      if (!targetCompanyId) {
        const defaultCompany = await prisma.company.findFirst();
        if (defaultCompany) {
          targetCompanyId = defaultCompany.id;
        } else {
          throw new Error('No company found to associate location with');
        }
      }
    }

    const code = payload.code || `${payload.zone}-${payload.aisle}-${payload.rack}-${payload.shelf}-${payload.bin}`.toUpperCase();

    const data = {
      code,
      name: payload.name || `Bin ${code}`,
      warehouse: payload.warehouse || 'Main Warehouse',
      zone: payload.zone.toUpperCase(),
      aisle: payload.aisle.toUpperCase(),
      rack: payload.rack.toUpperCase(),
      shelf: payload.shelf.toUpperCase(),
      bin: payload.bin.toUpperCase(),
      capacityType: payload.capacityType || 'Items',
      maxCapacity: parseInt(payload.maxCapacity || '1000', 10),
      occupied: 0,
      status: payload.status || 'Active',
      companyId: targetCompanyId,
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
    const zone = query.zone || null;
    const status = query.status || null;
    const search = query.search || null;

    const { items, total } = await locationRepository.findAll({
      companyId,
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
    await this.getLocationById(id, companyId);
    
    const updateData = {};
    if (payload.code) updateData.code = payload.code;
    if (payload.warehouse) updateData.warehouse = payload.warehouse;
    if (payload.zone) updateData.zone = payload.zone;
    if (payload.aisle) updateData.aisle = payload.aisle;
    if (payload.rack) updateData.rack = payload.rack;
    if (payload.shelf) updateData.shelf = payload.shelf;
    if (payload.bin) updateData.bin = payload.bin;
    if (payload.capacityType) updateData.capacityType = payload.capacityType;
    if (payload.maxCapacity) updateData.maxCapacity = parseInt(payload.maxCapacity, 10);
    if (payload.status) updateData.status = payload.status;

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
