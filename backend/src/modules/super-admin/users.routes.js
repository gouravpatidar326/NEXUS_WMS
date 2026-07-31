const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']));

router.get('/', usersController.getUsers);
router.post('/', usersController.inviteUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
