const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), categoryController.updateCategory);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), categoryController.deleteCategory);

module.exports = router;
