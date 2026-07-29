const express = require('express');
const router = express.Router();
const lotController = require('../../controllers/lot.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), lotController.createLot);
router.get('/', lotController.getLots);
router.get('/:id', lotController.getLotById);
router.patch('/:id/status', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), lotController.updateLotStatus);

module.exports = router;
