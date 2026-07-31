const lotService = require('../services/lot.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.createLot = async (req, res) => {
  try {
    const lot = await lotService.createLot(req.user.companyId, req.body);
    return successResponse(res, lot, 'Lot/Batch created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.getLotById = async (req, res) => {
  try {
    const lot = await lotService.getLotById(req.params.id, req.user.companyId);
    return successResponse(res, lot, 'Lot/Batch retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

exports.getLots = async (req, res) => {
  try {
    const { items, meta } = await lotService.getLots(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Lots/Batches retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateLotStatus = async (req, res) => {
  try {
    const { status, coaLocked } = req.body;
    const lot = await lotService.updateLotStatus(req.params.id, req.user.companyId, status, coaLocked);
    return successResponse(res, lot, 'Lot status updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
