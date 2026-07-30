const express = require('express');
const router = express.Router();
const adjustmentController = require('../../controllers/adjustment.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), adjustmentController.createAdjustment);
router.get('/', adjustmentController.getAdjustments);

module.exports = router;
