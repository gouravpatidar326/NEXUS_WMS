const express = require('express');
const router = express.Router();
const batchesController = require('./batches.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), batchesController.getBatches);
router.post('/:id/unlock-coa', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'CLIENT']), batchesController.unlockCoa);

module.exports = router;
