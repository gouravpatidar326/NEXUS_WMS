const express = require('express');
const router = express.Router();
const productController = require('../../controllers/product.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/bulk', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'CLIENT']), productController.createBulkProducts);
router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'CLIENT']), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'CLIENT']), productController.updateProduct);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), productController.deleteProduct);

module.exports = router;
