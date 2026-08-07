const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/settings.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.get('/', settingsController.getSettings);
router.put('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), settingsController.updateSettings);

module.exports = router;
