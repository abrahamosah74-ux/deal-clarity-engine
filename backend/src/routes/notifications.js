// backend/src/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const socketManager = require('../services/socketManager');

/**
 * Create a new notification
 */
router.post('/create', auth, async (req, res) => {
  try {
    const { type, title, message, teamId, recipient, link, priority = 'medium', channels = { inApp: true } } = req.body;

    const notification = new Notification({
      team: teamId,
      recipient: recipient || req.user.id,
      sender: req.user.id,
      type,
      title,
      message,
      link,
      priority,
      channels
    });

    await notification.save();
    await notification.populate('sender', 'name avatar');

    // Emit via Socket.io
    if (socketManager.getSocket()) {
      if (recipient) {
        // Send to specific user
        socketManager.notifyUser(recipient, notification);
      } else {
        // Send to entire team
        socketManager.notifyTeam(teamId, notification, req.user.id);
      }
    }

    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get user notifications
 */
router.get('/', auth, async (req, res) => {
  try {
    const { read, limit = 50, skip = 0, archived = false } = req.query;

    let query = {
      recipient: req.user.id,
      archived: archived === 'true'
    };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
      archived: false
    });

    res.json({
      notifications,
      total,
      unreadCount,
      hasMore: skip + parseInt(limit) < total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Mark notification as read
 */
router.patch('/:notificationId/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Mark all notifications as read
 */
router.patch('/mark-all/read', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Archive notification
 */
router.patch('/:notificationId/archive', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { archived: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Delete notification
 */
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get notification stats
 */
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
      archived: false
    });

    const unreadByType = await Notification.aggregate([
      {
        $match: {
          recipient: req.user.id,
          read: false,
          archived: false
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      unreadCount,
      unreadByType
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
