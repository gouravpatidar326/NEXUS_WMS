const express = require('express');
const router = express.Router();
const clientsController = require('./clients.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN']));

router.get('/', clientsController.getClients);
router.post('/', clientsController.provisionClient);

module.exports = router;
