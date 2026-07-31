const express = require('express');
const router = express.Router();
const transferController = require('./transfer-orders.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']));

router.get('/', transferController.getTransferOrders);
router.post('/', transferController.createTransferOrder);

module.exports = router;
