const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

// All user routes require SUPER_ADMIN
router.use(verifyToken, requireRole(['SUPER_ADMIN']));

router.get('/', usersController.getUsers);
router.post('/', usersController.inviteUser);

module.exports = router;
