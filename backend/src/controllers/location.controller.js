const locationService = require('../services/location.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.createLocation = async (req, res) => {
  try {
    const location = await locationService.createLocation(req.user.companyId, req.body);
    return successResponse(res, location, 'Storage bin location created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await locationService.getLocationById(req.params.id, req.user.companyId);
    return successResponse(res, location, 'Storage location retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

exports.getLocations = async (req, res) => {
  try {
    const { items, meta } = await locationService.getLocations(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Storage locations retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const location = await locationService.updateLocation(req.params.id, req.user.companyId, req.body);
    return successResponse(res, location, 'Storage location updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const result = await locationService.deleteLocation(req.params.id, req.user.companyId);
    return successResponse(res, result, 'Storage location deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
