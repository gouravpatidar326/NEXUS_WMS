const express = require('express');
const router = express.Router();
const receivingController = require('../../controllers/receiving.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), receivingController.createReceiving);
router.get('/', receivingController.getReceivings);
router.get('/:id', receivingController.getReceivingById);
router.post('/:id/inspect', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), receivingController.processInspection);
router.post('/:id/complete', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), receivingController.completeReceivingAndPutaway);

module.exports = router;
