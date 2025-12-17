const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, dueDate, priority, dealId, contactId } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }

    const task = new Task({
      userId: req.user._id,
      title,
      description: description || '',
      type: type || 'other',
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      dealId: dealId || null,
      contactId: contactId || null
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, dealId, contactId, sortBy = 'dueDate', order = 'asc', page = 1, limit = 50 } = req.query;

    let filter = { userId: req.user._id };

    if (status) {
      filter.status = Array.isArray(status) ? { $in: status } : status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (dealId) {
      filter.dealId = dealId;
    }

    if (contactId) {
      filter.contactId = contactId;
    }

    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('dealId', 'name')
        .populate('contactId', 'firstName lastName email'),
      Task.countDocuments(filter)
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('dealId')
      .populate('contactId');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'type', 'status', 'priority', 'dueDate', 'reminderDate', 'notes', 'tags', 'completedAt'];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (updates.status === 'completed' && !updates.completedAt) {
      updates.completedAt = new Date();
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    )
      .populate('dealId', 'name')
      .populate('contactId', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get tasks due today
router.get('/due/today', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId: req.user._id,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'completed' }
    })
      .sort({ priority: -1, dueDate: 1 })
      .populate('dealId', 'name')
      .populate('contactId', 'firstName lastName');

    res.json(tasks);
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch today tasks' });
  }
});

// Get overdue tasks
router.get('/overdue/list', auth, async (req, res) => {
  try {
    const now = new Date();

    const tasks = await Task.find({
      userId: req.user._id,
      dueDate: { $lt: now },
      status: { $ne: 'completed' }
    })
      .sort({ dueDate: 1 })
      .populate('dealId', 'name')
      .populate('contactId', 'firstName lastName');

    res.json(tasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue tasks' });
  }
});

// Get task statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          openTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          },
          highPriorityTasks: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalTasks: 1,
          completedTasks: 1,
          openTasks: 1,
          highPriorityTasks: 1,
          overdueTasks: 1,
          completionRate: {
            $round: [
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              2
            ]
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      openTasks: 0,
      highPriorityTasks: 0,
      overdueTasks: 0,
      completionRate: 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
