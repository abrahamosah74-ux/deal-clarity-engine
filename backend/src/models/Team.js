// backend/src/models/Team.js
const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    autoNotifications: {
      type: Boolean,
      default: true
    },
    dealStages: {
      type: [String],
      default: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']
    }
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canViewReports: { type: Boolean, default: true },
      canManageTeam: { type: Boolean, default: false },
      canDeleteDeals: { type: Boolean, default: false },
      canManageIntegrations: { type: Boolean, default: false }
    }
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    seats: {
      type: Number,
      default: 5
    },
    currentPeriodEnd: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
TeamSchema.index({ owner: 1 });
TeamSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Team', TeamSchema);
