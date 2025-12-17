// backend/src/models/TeamInvite.js
const mongoose = require('mongoose');

const TeamInviteSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'member', 'viewer'],
    default: 'member'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
TeamInviteSchema.index({ team: 1, status: 1 });
TeamInviteSchema.index({ email: 1 });
TeamInviteSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('TeamInvite', TeamInviteSchema);
