const express = require('express');
const router = express.Router();
const locationController = require('../../controllers/location.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), locationController.createLocation);
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);
router.put('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), locationController.updateLocation);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER']), locationController.deleteLocation);

module.exports = router;
