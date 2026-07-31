const express = require('express');
const router = express.Router();
const clientsController = require('./clients.controller');
const { verifyToken } = require('../../middlewares/auth');

router.use(verifyToken);
router.get('/warehouse-clients', clientsController.getClients);

module.exports = router;
