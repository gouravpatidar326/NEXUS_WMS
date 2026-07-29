const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const companiesRoutes = require('./companies.routes');
const clientsRoutes = require('./clients.routes');
const auditLogsRoutes = require('./audit-logs.routes');
const rolesRoutes = require('./roles.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/companies', companiesRoutes);
router.use('/clients', clientsRoutes);
router.use('/audit-logs', auditLogsRoutes);
router.use('/roles', rolesRoutes);

module.exports = router;
