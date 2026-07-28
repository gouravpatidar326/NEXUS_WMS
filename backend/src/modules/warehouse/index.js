const express = require('express');
const router = express.Router();

const productsRoutes = require('./products.routes');
const inventoryRoutes = require('./inventory.routes');
const batchesRoutes = require('./batches.routes');
const poRoutes = require('./purchase-orders.routes');
const transferRoutes = require('./transfer-orders.routes');
const opsRoutes = require('./operations.routes');
const salesOrdersRoutes = require('./sales-orders.routes');

router.use('/products', productsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/batches', batchesRoutes);
router.use('/purchase-orders', poRoutes);
router.use('/transfer-orders', transferRoutes);
router.use('/', opsRoutes);
router.use('/', salesOrdersRoutes);

module.exports = router;
