const express = require('express');
const router = express.Router();
const expiryController = require('../../controllers/expiry.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/scan', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), expiryController.scanExpiryAlerts);
router.get('/alerts', expiryController.getExpiryAlerts);
router.patch('/alerts/:id/resolve', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), expiryController.resolveAlert);

module.exports = router;
