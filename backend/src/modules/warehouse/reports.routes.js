const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK', 'CLIENT']));

router.get('/stock-valuation', reportsController.getStockValuation);
router.get('/inventory-velocity', reportsController.getInventoryVelocity);

module.exports = router;
