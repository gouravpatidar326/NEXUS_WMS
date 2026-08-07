const bcrypt = require('bcrypt');
const prisma = require('../../utils/prisma');
const { logAudit } = require('../../utils/auditLogger');

const getUsers = async (req, res) => {
  try {
    const where = {};
    if (req.query.role) {
      where.role = req.query.role;
    }
    if (req.query.companyId) {
      where.companyId = req.query.companyId;
    }
    if (req.user.role !== 'SUPER_ADMIN' && req.user.companyId) {
      where.companyId = req.user.companyId;
    }

    const clientWhere = {};
    if (req.query.companyId) {
      clientWhere.companyId = req.query.companyId;
    }
    if (req.user.role !== 'SUPER_ADMIN' && req.user.companyId) {
      clientWhere.companyId = req.user.companyId;
    }

    const [users, clientRecords] = await Promise.all([
      prisma.user.findMany({
        where,
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
      }),
      (!req.query.role || req.query.role === 'CLIENT')
        ? prisma.client.findMany({
            where: clientWhere,
            include: { company: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ]);

    const formattedClients = clientRecords.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email || 'No email registered',
      phone: c.phone || '',
      jobTitle: c.tier ? `Client (${c.tier})` : 'Client Account',
      role: 'CLIENT',
      companyId: c.companyId,
      status: c.status || 'ACTIVE',
      createdAt: c.createdAt,
      company: c.company,
    }));

    const existingEmails = new Set(users.map((u) => (u.email || '').toLowerCase()));
    const uniqueClients = formattedClients.filter((c) => !existingEmails.has((c.email || '').toLowerCase()));

    const allUsers = [...users, ...uniqueClients];
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  const inviteUser = async (req, res) => {
  try {
    const { name, email, password, phone, jobTitle } = req.body;
    let { role, companyId, warehouseId } = req.body;

    if (req.user.role === 'WAREHOUSE_MANAGER') {
      companyId = req.user.companyId;
      const allowedRoles = ['INVENTORY_CLERK'];
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Managers can only create Clerks' });
      }
    } else {
      const validRoles = ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test((email || '').trim())) {
      return res.status(400).json({ message: 'Valid email address is required (e.g. name@domain.com)' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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
        warehouseId: warehouseId || null,
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
    const { name, role, companyId, status, phone, jobTitle, email, password, warehouseId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role === 'WAREHOUSE_MANAGER') {
      if (existingUser.companyId !== req.user.companyId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      if (role && !['INVENTORY_CLERK'].includes(role)) {
        return res.status(403).json({ message: 'Forbidden role' });
      }
    }

    const updateData = {
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(jobTitle !== undefined ? { jobTitle } : {}),
      ...(warehouseId !== undefined ? { warehouseId: warehouseId || null } : {}),
      updatedAt: new Date(),
    };

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'Valid email address is required (e.g. name@domain.com)' });
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (req.user.role === 'SUPER_ADMIN' && companyId !== undefined) {
      updateData.companyId = companyId || null;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    if (req.user.role === 'WAREHOUSE_MANAGER' && existingUser.companyId !== req.user.companyId) {
      return res.status(403).json({ message: 'Forbidden' });
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
