const adjustmentService = require('../services/adjustment.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.createAdjustment = async (req, res) => {
  try {
    const adjustment = await adjustmentService.createAdjustment(req.user.companyId, req.user.id, req.body);
    return successResponse(res, adjustment, 'Stock adjustment processed and transaction logged', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.getAdjustments = async (req, res) => {
  try {
    const { items, meta } = await adjustmentService.getAdjustments(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Stock adjustment audit records retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
