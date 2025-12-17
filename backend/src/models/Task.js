const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'follow-up', 'reminder', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'canceled'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  reminderDate: Date,
  reminderSent: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: String,
    default: null
  },
  completedAt: Date,
  notes: String,
  attachments: [String],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

TaskSchema.index({ userId: 1, status: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, dealId: 1 });
TaskSchema.index({ userId: 1, contactId: 1 });

module.exports = mongoose.model('Task', TaskSchema);
