const barcodeService = require('../services/barcode.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.generateBarcode = async (req, res) => {
  try {
    const barcode = await barcodeService.generateBarcode(req.user.companyId, req.body);
    return successResponse(res, barcode, 'Barcode generated successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.scanBarcode = async (req, res) => {
  try {
    const { code } = req.body;
    const barcode = await barcodeService.scanBarcode(code || req.params.code, req.user.companyId);
    return successResponse(res, barcode, 'Barcode scanned successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

exports.getBarcodes = async (req, res) => {
  try {
    const { items, meta } = await barcodeService.getBarcodes(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Barcodes retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
