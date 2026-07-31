const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('./warehouses.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.route('/')
  .get(getWarehouses)
  .post(requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), createWarehouse);

router.route('/:id')
  .put(requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), updateWarehouse)
  .delete(requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), deleteWarehouse);

module.exports = router;
