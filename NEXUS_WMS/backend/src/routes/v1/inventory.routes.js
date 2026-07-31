const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/inventory.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/bins', inventoryController.getBinInventory);
router.get('/summary', inventoryController.getInventorySummary);
router.get('/transactions', inventoryController.getInventoryTransactions);

// Allocation APIs exposed for Developer 1 (Order Fulfillment module)
router.post('/reserve', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'CLIENT']), inventoryController.reserveStock);
router.post('/release', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'CLIENT']), inventoryController.releaseStock);
router.post('/fulfill', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), inventoryController.fulfillOrderStock);

module.exports = router;
