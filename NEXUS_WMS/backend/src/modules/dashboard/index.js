const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/super-admin', requireRole(['SUPER_ADMIN']), dashboardController.getSuperAdminDashboard);
router.get('/manager', requireRole(['WAREHOUSE_MANAGER']), dashboardController.getManagerDashboard);
router.get('/clerk', requireRole(['INVENTORY_CLERK']), dashboardController.getClerkDashboard);
router.get('/client', requireRole(['CLIENT']), dashboardController.getClientDashboard);

module.exports = router;
