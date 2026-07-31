const express = require('express');
const router = express.Router();
const prisma = require('../../utils/prisma');
const { verifyToken } = require('../../middlewares/auth');

router.use(verifyToken);

// GET /api/v1/notifications - fetch notifications for user
router.get('/', async (req, res) => {
  try {
    const where = {
      OR: [
        { userId: req.user.id },
        {
          AND: [
            { userId: null },
            { companyId: req.user.companyId || null }
          ]
        }
      ]
    };
    
    // If user is SUPER_ADMIN, they can see notifications that are global or companyId-less
    if (req.user.role === 'SUPER_ADMIN') {
      where.OR.push({ companyId: null });
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PUT /api/v1/notifications/read-all - mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const where = {
      OR: [
        { userId: req.user.id },
        {
          AND: [
            { userId: null },
            { companyId: req.user.companyId || null }
          ]
        }
      ]
    };
    
    if (req.user.role === 'SUPER_ADMIN') {
      where.OR.push({ companyId: null });
    }

    await prisma.notification.updateMany({
      where,
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking read all notifications:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
});

// PUT /api/v1/notifications/:id/read - mark single as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

module.exports = router;
