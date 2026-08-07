const productService = require('../services/product.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.createProduct = async (req, res) => {
  try {
    let companyId = req.user.companyId;
    if (!companyId) {
      const prisma = require('../utils/prisma');
      const defaultCompany = await prisma.company.findFirst();
      if (!defaultCompany) throw new Error('No company found in database');
      companyId = defaultCompany.id;
    }

    const product = await productService.createProduct(companyId, req.body);
    return successResponse(res, product, 'Product created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id, req.user.companyId);
    return successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { items, meta } = await productService.getProducts(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Products retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.user.companyId, req.body);
    return successResponse(res, product, 'Product updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id, req.user.companyId);
    return successResponse(res, result, 'Product deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.createBulkProducts = async (req, res) => {
  try {
    let companyId = req.user.companyId;
    if (!companyId) {
      const prisma = require('../utils/prisma');
      const defaultCompany = await prisma.company.findFirst();
      if (!defaultCompany) throw new Error('No company found in database');
      companyId = defaultCompany.id;
    }

    const result = await productService.createBulkProducts(companyId, req.body.products);
    return successResponse(res, result, 'Products created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
