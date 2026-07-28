const express = require('express');
const router = express.Router();
const salesOrdersController = require('./sales-orders.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']));

// Managers/Clerks can view all orders
router.get('/sales-orders', salesOrdersController.getSalesOrders);

// Only Managers can approve or reject
router.post('/sales-orders/:id/approve', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), salesOrdersController.approveSalesOrder);
router.post('/sales-orders/:id/reject', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), salesOrdersController.rejectSalesOrder);

module.exports = router;
