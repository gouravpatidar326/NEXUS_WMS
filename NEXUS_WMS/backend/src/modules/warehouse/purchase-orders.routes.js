const express = require('express');
const router = express.Router();
const poController = require('./purchase-orders.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);
const readAuth = requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']);
const execAuth = requireRole(['SUPER_ADMIN', 'INVENTORY_CLERK']);
const deleteAuth = requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']);

router.get('/', readAuth, poController.getPurchaseOrders);
router.post('/', execAuth, poController.createPurchaseOrder);
router.post('/:id/receive', execAuth, poController.receiveGoods);
router.delete('/:id', deleteAuth, poController.deletePurchaseOrder);

module.exports = router;
