const express = require('express');
const router = express.Router();
const companiesController = require('./companies.controller');
const { verifyToken, requireRole } = require('../../middlewares/auth');

router.use(verifyToken, requireRole(['SUPER_ADMIN']));

router.get('/', companiesController.getCompanies);
router.post('/', companiesController.createCompany);

module.exports = router;
