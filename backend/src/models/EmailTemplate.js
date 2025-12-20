const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: [
      'follow_up',
      'meeting_summary',
      'commitment_reminder',
      'proposal',
      'closing',
      'rejection',
      'custom'
    ],
    default: 'custom'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  variables: [
    {
      name: String,
      description: String,
      example: String
    }
  ],
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date
  },
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

// Update timestamp on save
emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
emailTemplateSchema.index({ team: 1, category: 1 });
emailTemplateSchema.index({ team: 1, name: 1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
