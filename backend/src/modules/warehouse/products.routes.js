const express = require('express');
const router = express.Router();
const productsController = require('./products.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken); // All endpoints require auth

// Clients can view products, but creating products is for managers/admins
router.get('/', productsController.getProducts);
router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), productsController.createProduct);

module.exports = router;
