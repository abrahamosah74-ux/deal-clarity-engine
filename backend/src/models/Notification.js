// backend/src/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'deal_created',
      'deal_updated',
      'deal_stage_changed',
      'deal_closed',
      'task_assigned',
      'task_completed',
      'team_member_added',
      'workflow_executed',
      'comment_added',
      'mention',
      'custom'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: String,
  link: {
    resource: String, // 'deal', 'task', 'team', etc.
    resourceId: mongoose.Schema.Types.ObjectId
  },
  data: mongoose.Schema.Types.Mixed,
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  archived: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick queries
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ team: 1, recipient: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
