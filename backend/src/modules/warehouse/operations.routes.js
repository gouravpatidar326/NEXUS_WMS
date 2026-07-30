const express = require('express');
const router = express.Router();
const opsController = require('./operations.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

const opsAuth = [verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'])];

router.get('/companies', ...opsAuth, opsController.getCompanies);
router.get('/pick-lists', ...opsAuth, opsController.getPickLists);
router.post('/pick-lists/:id/pick', ...opsAuth, opsController.completePick);
router.post('/locations/update', ...opsAuth, opsController.updateLocation);
router.post('/shipping/label', ...opsAuth, opsController.generateShippingLabel);
router.get('/shipping', ...opsAuth, opsController.getShipments);
router.delete('/shipping/:id', ...opsAuth, opsController.deleteShipment);
router.get('/carriers', ...opsAuth, opsController.getCarriers);

module.exports = router;

