const express = require('express');
const router = express.Router();
const poController = require('./purchase-orders.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']));

router.get('/', poController.getPurchaseOrders);
router.post('/', poController.createPurchaseOrder);
router.post('/:id/receive', poController.receiveGoods);

module.exports = router;
