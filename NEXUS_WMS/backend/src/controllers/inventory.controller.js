const inventoryService = require('../services/inventory.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.getBinInventory = async (req, res) => {
  try {
    const { items, meta } = await inventoryService.getBinInventory(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Bin inventory stock mapping retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getInventorySummary = async (req, res) => {
  try {
    const { items, meta } = await inventoryService.getInventorySummary(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Company inventory aggregate totals retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getInventoryTransactions = async (req, res) => {
  try {
    const { items, meta } = await inventoryService.getInventoryTransactions(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Immutable inventory transaction ledger retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.reserveStock = async (req, res) => {
  try {
    const result = await inventoryService.reserveStock(req.user.companyId, req.body);
    return successResponse(res, result, 'Stock reserved successfully for order allocation');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.releaseStock = async (req, res) => {
  try {
    const result = await inventoryService.releaseStock(req.user.companyId, req.body);
    return successResponse(res, result, 'Stock reservation released successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.fulfillOrderStock = async (req, res) => {
  try {
    const result = await inventoryService.fulfillOrderStock(req.user.companyId, req.user.id, req.body);
    return successResponse(res, result, 'Order stock pick & ship transaction completed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
