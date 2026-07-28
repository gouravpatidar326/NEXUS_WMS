const prisma = require('../../utils/prisma');

const getCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createCompany = async (req, res) => {
  try {
    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    const company = await prisma.company.create({
      data: { name, industry }
    });

    await prisma.auditLog.create({
      data: {
        event: 'COMPANY_PROVISIONED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getCompanies, createCompany };
