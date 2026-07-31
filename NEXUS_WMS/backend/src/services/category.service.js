const categoryRepository = require('../repositories/category.repository');
const { getPaginationParams, formatPaginationMeta } = require('../utils/pagination');

class CategoryService {
  async createCategory(companyId, payload) {
    if (!payload.name) {
      throw new Error('Category name is required');
    }
    const data = {
      name: payload.name,
      code: payload.code || payload.name.substring(0, 3).toUpperCase(),
      description: payload.description || null,
      companyId,
    };
    return await categoryRepository.create(data);
  }

  async getCategoryById(id, companyId) {
    const category = await categoryRepository.findById(id, companyId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async getCategories(companyId, query) {
    const { page, limit, skip, sortBy, sortOrder } = getPaginationParams(query);
    const search = query.search || null;

    const { items, total } = await categoryRepository.findAll({
      companyId,
      skip,
      limit,
      sortBy,
      sortOrder,
      search,
    });

    const meta = formatPaginationMeta(total, page, limit);
    return { items, meta };
  }

  async updateCategory(id, companyId, payload) {
    await this.getCategoryById(id, companyId);
    await categoryRepository.update(id, companyId, payload);
    return await this.getCategoryById(id, companyId);
  }

  async deleteCategory(id, companyId) {
    await this.getCategoryById(id, companyId);
    await categoryRepository.softDelete(id, companyId);
    return { id, deleted: true };
  }
}

module.exports = new CategoryService();
