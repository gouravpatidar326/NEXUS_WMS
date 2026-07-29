const transferService = require('../services/transfer.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.createTransfer = async (req, res) => {
  try {
    const transfer = await transferService.createTransfer(req.user.companyId, req.user.id, req.body);
    return successResponse(res, transfer, 'Stock transfer completed and inventory updated', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const { items, meta } = await transferService.getTransfers(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Inventory transfer history retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getTransferById = async (req, res) => {
  try {
    const transfer = await transferService.getTransferById(req.params.id, req.user.companyId);
    return successResponse(res, transfer, 'Transfer details retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};
