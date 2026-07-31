const express = require('express');
const router = express.Router();
const barcodeController = require('../../controllers/barcode.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken);

router.post('/generate', requireRole(['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK']), barcodeController.generateBarcode);
router.post('/scan', barcodeController.scanBarcode);
router.get('/', barcodeController.getBarcodes);

module.exports = router;
