const express = require('express');
const router = express.Router();
const inventoryController = require('./inventory.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']));

router.get('/', inventoryController.getInventory);
router.post('/adjust', inventoryController.adjustStock);

module.exports = router;
