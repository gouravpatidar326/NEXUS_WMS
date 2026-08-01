const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Case-insensitive status check ('Active' or 'ACTIVE')
      if (user.status && user.status.toUpperCase() !== 'ACTIVE') {
        return res.status(403).json({ message: 'User account is inactive' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, companyId: user.companyId, warehouseId: user.warehouseId },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          warehouseId: user.warehouseId,
          companyName: user.company ? user.company.name : null,
          company: user.company ? { id: user.company.id, name: user.company.name } : null
        }
      });
    }

    // If no user found, check Client table
    const client = await prisma.client.findFirst({
      where: { email },
      include: { company: true }
    });

    if (client && client.password) {
      const isMatch = await bcrypt.compare(password, client.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (client.status && client.status.toUpperCase() !== 'ACTIVE') {
        return res.status(403).json({ message: 'Client account is inactive' });
      }

      const token = jwt.sign(
        { id: client.id, role: 'CLIENT', companyId: client.companyId, warehouseId: client.warehouseId },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      return res.json({
        token,
        user: {
          id: client.id,
          name: client.name,
          email: client.email,
          role: 'CLIENT',
          companyId: client.companyId,
          warehouseId: client.warehouseId,
          companyName: client.company ? client.company.name : null,
          company: client.company ? { id: client.company.id, name: client.company.name } : null
        }
      });
    }

    // Neither User nor Client matched
    return res.status(401).json({ message: 'Invalid credentials' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  res.json({ message: 'Reset link sent' });
};

module.exports = { login, forgotPassword };
