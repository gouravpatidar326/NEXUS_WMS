const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const { logAudit } = require('../../utils/auditLogger');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        jobTitle: true,
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
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const inviteUser = async (req, res) => {
  try {
    const { name, email, role, companyId, password, phone, jobTitle } = req.body;

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
        phone,
        jobTitle,
        password: hashedPassword,
        role,
        companyId: companyId || null,
        status: 'ACTIVE',
      },
    });

    await logAudit(req, 'USER_INVITED');

    res.status(201).json({ id: user.id, message: 'User invited successfully', user });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, companyId, status, phone, jobTitle } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(jobTitle !== undefined ? { jobTitle } : {}),
        ...(companyId !== undefined ? { companyId } : {}),
        updatedAt: new Date(),
      },
    });

    await logAudit(req, 'USER_UPDATED');

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: error.message || 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(200).json({ message: 'User already deleted or not found', id });
    }

    // Unlink dependent relations before deletion to avoid foreign key errors
    await prisma.auditLog.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    await prisma.notification.deleteMany({
      where: { userId: id },
    });

    await prisma.user.delete({
      where: { id },
    });

    await logAudit(req, 'USER_DELETED');

    res.json({ message: 'User deleted successfully', id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ message: error.message || 'Failed to delete user' });
  }
};

module.exports = { getUsers, inviteUser, updateUser, deleteUser };
