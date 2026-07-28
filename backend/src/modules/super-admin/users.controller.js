const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        status: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const inviteUser = async (req, res) => {
  try {
    const { name, email, role, companyId, password } = req.body;
    
    // Validate role
    const validRoles = ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK', 'CLIENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // In a real flow, an invite would generate a token and email it to the user.
    // For this implementation, we allow passing a password to provision them immediately for testing.
    const hashedPassword = await bcrypt.hash(password || 'nexus123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: companyId || null
      }
    });

    await prisma.auditLog.create({
      data: {
        event: 'USER_INVITED',
        userId: req.user.id,
        ipAddress: req.ip
      }
    });

    res.status(201).json({ id: user.id, message: 'User invited successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getUsers, inviteUser };
