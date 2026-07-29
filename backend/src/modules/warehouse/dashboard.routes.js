const express = require('express');
const router = express.Router();
const { getManagerSummary } = require('./dashboard.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.get('/manager-summary', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), getManagerSummary);

module.exports = router;
