const express = require('express');
const router = express.Router();
const auditLogsController = require('./audit-logs.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']));

router.get('/', auditLogsController.getAuditLogs);

module.exports = router;
