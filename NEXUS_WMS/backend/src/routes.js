const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

const superAdminRoutes = require('./modules/super-admin');
const warehouseRoutes = require('./modules/warehouse');
const clientRoutes = require('./modules/client');
const dashboardRoutes = require('./modules/dashboard');

const v1Routes = require('./routes/v1');

// Module routes mounted here
router.use('/v1', v1Routes);
router.use('/', superAdminRoutes);
router.use('/', warehouseRoutes);
router.use('/client', clientRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
