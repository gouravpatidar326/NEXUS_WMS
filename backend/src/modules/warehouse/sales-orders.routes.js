const express = require('express');
const router = express.Router();
const salesOrdersController = require('./sales-orders.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

const baseAuth = [verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK', 'CLIENT'])];

// Managers/Clerks can view all orders
router.get('/sales-orders', ...baseAuth, salesOrdersController.getSalesOrders);
router.post('/sales-orders', ...baseAuth, salesOrdersController.createSalesOrder);

// Only Managers can approve or reject
router.post('/sales-orders/:id/approve', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), salesOrdersController.approveSalesOrder);
router.post('/sales-orders/:id/reject', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), salesOrdersController.rejectSalesOrder);

module.exports = router;
