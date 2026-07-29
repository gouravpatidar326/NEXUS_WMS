const express = require('express');
const router = express.Router();
const opsController = require('./operations.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']));

router.get('/companies', opsController.getCompanies);
router.get('/pick-lists', opsController.getPickLists);
router.post('/pick-lists/:id/pick', opsController.completePick);
router.post('/locations/update', opsController.updateLocation);
router.post('/shipping/label', opsController.generateShippingLabel);
router.get('/shipping', opsController.getShipments);

module.exports = router;

