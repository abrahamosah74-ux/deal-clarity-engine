// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: String,
  emailVerificationExpiry: Date,
  password: {
    type: String,
    required: true
  },
  company: String,
  role: {
    type: String,
    enum: ['rep', 'manager', 'admin'],
    default: 'rep'
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  currentTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'trialing'],
      default: 'inactive'
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    paystackCustomerCode: String,
    paystackSubscriptionCode: String,
    currentPeriodEnd: Date
  },
  integrations: {
    calendar: {
      provider: String,
      accessToken: String,
      refreshToken: String,
      connectedAt: Date
    },
    crm: {
      provider: String, // 'salesforce', 'hubspot'
      accessToken: String,
      refreshToken: String,
      connectedAt: Date
    },
    email: {
      provider: String, // 'gmail', 'outlook'
      accessToken: String,
      refreshToken: String,
      connectedAt: Date
    }
  },
  settings: {
    autoRecordCalls: {
      type: Boolean,
      default: false
    },
    defaultEmailTemplate: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);