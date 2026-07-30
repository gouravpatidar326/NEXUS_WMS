const express = require('express');
const router = express.Router();
const { getLocations, createLocation, updateLocation, deleteLocation } = require('./locations.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.get('/', verifyToken, getLocations);
router.post('/', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), createLocation);
router.put('/:id', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), updateLocation);
router.delete('/:id', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), deleteLocation);

module.exports = router;
