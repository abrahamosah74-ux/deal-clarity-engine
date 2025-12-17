const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: String,
  email: {
    type: String,
    required: true
  },
  phone: String,
  mobile: String,
  company: String,
  jobTitle: String,
  department: String,
  industry: String,
  address: String,
  city: String,
  state: String,
  country: String,
  notes: String,
  deals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal'
  }],
  tags: [String],
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'crm', 'referral', 'event', 'other'],
    default: 'other'
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastContactedAt: Date,
  nextFollowUp: Date,
  socialProfiles: {
    linkedin: String,
    twitter: String
  },
  preferences: {
    communicationPreference: {
      type: String,
      enum: ['email', 'phone', 'sms'],
      default: 'email'
    },
    doNotContact: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

ContactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ContactSchema.index({ userId: 1, email: 1 }, { unique: true });
ContactSchema.index({ userId: 1, company: 1 });
ContactSchema.index({ userId: 1, leadScore: -1 });

module.exports = mongoose.model('Contact', ContactSchema);
