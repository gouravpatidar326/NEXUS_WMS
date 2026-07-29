const categoryService = require('../services/category.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');

exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.user.companyId, req.body);
    return successResponse(res, category, 'Category created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id, req.user.companyId);
    return successResponse(res, category, 'Category retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { items, meta } = await categoryService.getCategories(req.user.companyId, req.query);
    return paginatedResponse(res, items, meta, 'Categories retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.user.companyId, req.body);
    return successResponse(res, category, 'Category updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id, req.user.companyId);
    return successResponse(res, result, 'Category deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
