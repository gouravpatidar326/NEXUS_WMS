const express = require('express');
const router = express.Router();
const { getLocations, createLocation } = require('./locations.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.get('/', verifyToken, getLocations);
router.post('/', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), createLocation);

module.exports = router;
