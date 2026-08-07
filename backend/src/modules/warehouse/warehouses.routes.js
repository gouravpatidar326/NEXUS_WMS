const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('./warehouses.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/', getWarehouses);
router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), createWarehouse);

router.put('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), updateWarehouse);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), deleteWarehouse);

module.exports = router;
