const express = require('express');
const router = express.Router();
const { getManagerSummary, getClerkDashboard } = require('./dashboard.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.get('/manager-summary', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), getManagerSummary);
router.get('/clerk', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), getClerkDashboard);

module.exports = router;
