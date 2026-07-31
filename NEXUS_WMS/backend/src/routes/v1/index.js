const express = require('express');
const router = express.Router();

const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const receivingRoutes = require('./receiving.routes');
const lotRoutes = require('./lot.routes');
const barcodeRoutes = require('./barcode.routes');
const locationRoutes = require('./location.routes');
const inventoryRoutes = require('./inventory.routes');
const transferRoutes = require('./transfer.routes');
const adjustmentRoutes = require('./adjustment.routes');
const expiryRoutes = require('./expiry.routes');

router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/receiving', receivingRoutes);
router.use('/lots', lotRoutes);
router.use('/barcodes', barcodeRoutes);
router.use('/locations', locationRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/transfers', transferRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/expiry', expiryRoutes);

module.exports = router;
