const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { content, dealId, contactId, type, visibility } = req.body;

    if (!content || !dealId) {
      return res.status(400).json({ error: 'Content and deal ID are required' });
    }

    const note = new Note({
      userId: req.user._id,
      content,
      dealId,
      contactId: contactId || null,
      type: type || 'internal',
      visibility: visibility || 'private'
    });

    await note.save();
    await note.populate('userId', 'firstName lastName avatar');
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Get notes for deal
router.get('/deal/:dealId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'createdAt', order = 'desc' } = req.query;

    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find({ dealId: req.params.dealId, userId: req.user._id })
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'firstName lastName avatar'),
      Note.countDocuments({ dealId: req.params.dealId, userId: req.user._id })
    ]);

    res.json({
      notes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const { type, visibility, dealId, contactId, pinnedOnly = false, page = 1, limit = 50 } = req.query;

    let filter = { userId: req.user._id };

    if (type) {
      filter.type = type;
    }

    if (visibility) {
      filter.visibility = visibility;
    }

    if (dealId) {
      filter.dealId = dealId;
    }

    if (contactId) {
      filter.contactId = contactId;
    }

    if (pinnedOnly === 'true') {
      filter.pinnedAt = { $exists: true, $ne: null };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ pinnedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'firstName lastName avatar')
        .populate('dealId', 'name'),
      Note.countDocuments(filter)
    ]);

    res.json({
      notes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get note by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('userId', 'firstName lastName avatar')
      .populate('dealId', 'name');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedFields = ['content', 'type', 'visibility', 'pinnedAt'];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName avatar');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Pin/unpin note
router.post('/:id/pin', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.pinnedAt = note.pinnedAt ? null : new Date();
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Pin note error:', error);
    res.status(500).json({ error: 'Failed to pin note' });
  }
});

module.exports = router;
