const express = require('express');
const router = express.Router();
const rolesController = require('./roles.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

// Allow all authenticated users to read roles & permissions
router.get('/', verifyToken, rolesController.getRoles);

// Restrict updating permissions to SUPER_ADMIN only
router.put('/:roleKey/permissions', verifyToken, requireRole(['SUPER_ADMIN']), rolesController.updateRolePermissions);

module.exports = router;
