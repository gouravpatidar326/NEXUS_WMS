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
        createdAt: true,
        company: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
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

    const validRoles = ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK', 'CLIENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'nexus123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: companyId || null,
        status: 'Active',
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'USER_INVITED',
        userId: req.user.id,
        ipAddress: req.ip,
      },
    });

    res.status(201).json({ id: user.id, message: 'User invited successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, companyId, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(companyId !== undefined ? { companyId } : {}),
        updatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'USER_UPDATED',
        userId: req.user.id,
        ipAddress: req.ip,
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        event: 'USER_DELETED',
        userId: req.user.id,
        ipAddress: req.ip,
      },
    });

    res.json({ message: 'User deleted successfully', id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Failed to delete user' });
  }
};

module.exports = { getUsers, inviteUser, updateUser, deleteUser };
