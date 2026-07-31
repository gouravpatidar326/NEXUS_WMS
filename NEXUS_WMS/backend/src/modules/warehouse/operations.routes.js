const express = require('express');
const router = express.Router();
const opsController = require('./operations.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

const opsAuth = [verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'])];
const execAuth = [verifyToken, requireRole(['SUPER_ADMIN', 'INVENTORY_CLERK'])];
const managerAuth = [verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER'])];

router.get('/companies', ...opsAuth, opsController.getCompanies);
router.get('/pick-lists', ...opsAuth, opsController.getPickLists);
router.post('/pick-lists/:id/pick', ...execAuth, opsController.completePick);
router.post('/locations/update', ...managerAuth, opsController.updateLocation);
router.post('/shipping/label', ...execAuth, opsController.generateShippingLabel);
router.get('/shipping', ...opsAuth, opsController.getShipments);
router.delete('/shipping/:id', ...execAuth, opsController.deleteShipment);
router.get('/carriers', ...opsAuth, opsController.getCarriers);

module.exports = router;

