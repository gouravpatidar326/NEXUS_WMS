const express = require('express');
const router = express.Router();
const clientsController = require('./clients.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

// Allow all authenticated users to read clients list for order selection
router.get('/', verifyToken, clientsController.getClients);

// Provisioning, editing, deleting clients requires SUPER_ADMIN or WAREHOUSE_MANAGER
router.post('/', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), clientsController.provisionClient);
router.put('/:id', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), clientsController.updateClient);
router.delete('/:id', verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), clientsController.deleteClient);

module.exports = router;
