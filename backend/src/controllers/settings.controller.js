const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getSettings = async (req, res) => {
  try {
    let companyId = req.user.companyId;
    if (!companyId) {
      const firstCompany = await prisma.company.findFirst();
      companyId = firstCompany?.id;
    }

    let company = null;
    if (companyId) {
      company = await prisma.company.findUnique({
        where: { id: companyId }
      });
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: companyId ? { companyId } : {}
    });

    const settingsData = {
      companyName: company?.name || 'NEXUS Logistics Enterprise',
      email: company?.email || req.user.email || 'admin@nexuswms.com',
      phone: company?.phone || '+1 800 555 0199',
      industry: company?.industry || 'Supply Chain & Logistics',
      currency: 'USD ($)',
      facilityName: warehouse?.name || 'Primary Warehouse Facility',
      facilityAddress: [warehouse?.address, warehouse?.city, warehouse?.state, warehouse?.country].filter(Boolean).join(', ') || '100 Supply Chain Blvd, Suite 400, Dallas TX',
      lowStockThreshold: 10,
      expiryWarningDays: 30,
      emailAlerts: true,
      dbStatus: 'OPERATIONAL'
    };

    return successResponse(res, settingsData, 'System settings retrieved successfully');
  } catch (error) {
    console.error('Error fetching settings:', error);
    return errorResponse(res, error.message || 'Failed to fetch settings', 500);
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { companyName, email, phone, industry, facilityName, facilityAddress } = req.body;

    let companyId = req.user.companyId;
    if (!companyId) {
      const firstCompany = await prisma.company.findFirst();
      companyId = firstCompany?.id;
    }

    if (companyId && companyName) {
      await prisma.company.update({
        where: { id: companyId },
        data: {
          name: companyName,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(industry ? { industry } : {})
        }
      });
    }

    // Update primary warehouse address if present
    const primaryWarehouse = await prisma.warehouse.findFirst({
      where: companyId ? { companyId } : {}
    });

    if (primaryWarehouse) {
      await prisma.warehouse.update({
        where: { id: primaryWarehouse.id },
        data: {
          ...(facilityName ? { name: facilityName } : {}),
          ...(facilityAddress ? { address: facilityAddress } : {})
        }
      });
    }

    return successResponse(res, req.body, 'System settings saved successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
    return errorResponse(res, error.message || 'Failed to save settings', 500);
  }
};
