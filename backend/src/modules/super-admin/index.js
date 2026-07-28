const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const companiesRoutes = require('./companies.routes');
const clientsRoutes = require('./clients.routes');
const auditLogsRoutes = require('./audit-logs.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/companies', companiesRoutes);
router.use('/clients', clientsRoutes);
router.use('/audit-logs', auditLogsRoutes);

module.exports = router;
