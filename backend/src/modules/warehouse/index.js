const express = require('express');
const router = express.Router();

const productsRoutes = require('./products.routes');
const inventoryRoutes = require('./inventory.routes');
const batchesRoutes = require('./batches.routes');
const poRoutes = require('./purchase-orders.routes');
const transferRoutes = require('./transfer-orders.routes');
const opsRoutes = require('./operations.routes');
const salesOrdersRoutes = require('./sales-orders.routes');

const dashboardRoutes = require('./dashboard.routes');

router.use('/products', productsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/batches', batchesRoutes);
router.use('/purchase-orders', poRoutes);
router.use('/transfer-orders', transferRoutes);
router.use('/', opsRoutes);
router.use('/', salesOrdersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', require('./reports.routes'));
router.use('/locations', require('./locations.routes'));
router.use('/', require('./clients.routes'));

module.exports = router;
