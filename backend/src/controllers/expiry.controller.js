const expiryService = require('../services/expiry.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.scanExpiryAlerts = async (req, res) => {
  try {
    const summary = await expiryService.scanAndGenerateExpiryAlerts(req.user.companyId);
    return successResponse(res, summary, 'Expiry alert scan completed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getExpiryAlerts = async (req, res) => {
  try {
    const { items, meta } = await expiryService.getExpiryAlerts(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Expiry alerts retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const result = await expiryService.resolveAlert(req.params.id, req.user.companyId);
    return successResponse(res, result, 'Expiry alert resolved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
