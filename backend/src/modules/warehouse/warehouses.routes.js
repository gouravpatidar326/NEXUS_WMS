const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('./warehouses.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);
router.use(requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']));

router.route('/')
  .get(getWarehouses)
  .post(createWarehouse);

router.route('/:id')
  .put(updateWarehouse)
  .delete(deleteWarehouse);

module.exports = router;
