const express = require('express');
const router = express.Router();

const salesOrdersRoutes = require('./sales-orders.routes');

router.use('/', salesOrdersRoutes);

module.exports = router;
