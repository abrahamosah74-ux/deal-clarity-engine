// Security: Authorization middleware to verify resource ownership
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Note = require('../models/Note');
const { validateObjectId } = require('./validation');

/**
 * Verify that the user owns the deal they're trying to access
 */
const checkDealOwnership = async (req, res, next) => {
  try {
    const dealId = req.params.id || req.params.dealId;
    
    if (!dealId || !validateObjectId(dealId)) {
      return res.status(400).json({ error: 'Invalid deal ID' });
    }

    const deal = await Deal.findById(dealId);
    
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    if (deal.userId.toString() !== req.user._id.toString()) {
      console.warn(`⚠️ Unauthorized access attempt: User ${req.user._id} tried to access deal ${dealId} owned by ${deal.userId}`);
      return res.status(403).json({ error: 'Forbidden: You do not have access to this deal' });
    }

    req.deal = deal;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify that the user owns the contact they're trying to access
 */
const checkContactOwnership = async (req, res, next) => {
  try {
    const contactId = req.params.id || req.params.contactId;
    
    if (!contactId || !validateObjectId(contactId)) {
      return res.status(400).json({ error: 'Invalid contact ID' });
    }

    const contact = await Contact.findById(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (contact.userId.toString() !== req.user._id.toString()) {
      console.warn(`⚠️ Unauthorized access attempt: User ${req.user._id} tried to access contact ${contactId} owned by ${contact.userId}`);
      return res.status(403).json({ error: 'Forbidden: You do not have access to this contact' });
    }

    req.contact = contact;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify that the user owns the task they're trying to access
 */
const checkTaskOwnership = async (req, res, next) => {
  try {
    const taskId = req.params.id || req.params.taskId;
    
    if (!taskId || !validateObjectId(taskId)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId.toString() !== req.user._id.toString()) {
      console.warn(`⚠️ Unauthorized access attempt: User ${req.user._id} tried to access task ${taskId} owned by ${task.userId}`);
      return res.status(403).json({ error: 'Forbidden: You do not have access to this task' });
    }

    req.task = task;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify that the user owns the note they're trying to access
 */
const checkNoteOwnership = async (req, res, next) => {
  try {
    const noteId = req.params.id || req.params.noteId;
    
    if (!noteId || !validateObjectId(noteId)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.userId.toString() !== req.user._id.toString()) {
      console.warn(`⚠️ Unauthorized access attempt: User ${req.user._id} tried to access note ${noteId} owned by ${note.userId}`);
      return res.status(403).json({ error: 'Forbidden: You do not have access to this note' });
    }

    req.note = note;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  checkDealOwnership,
  checkContactOwnership,
  checkTaskOwnership,
  checkNoteOwnership
};
