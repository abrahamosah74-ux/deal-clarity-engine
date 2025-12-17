const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  crmId: {
    type: String,
    required: true
  },
  crmType: {
    type: String,
    enum: ['salesforce', 'hubspot', 'pipedrive', 'other'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  amount: Number,
  stage: String,
  closeDate: Date,
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  account: {
    name: String,
    id: String
  },
  contact: {
    name: String,
    email: String,
    phone: String
  },
  nextSteps: String,
  lastCommitmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commitment'
  },
  clarityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  velocity: {
    // Days in each stage
    discoveryDays: Number,
    demoDays: Number,
    proposalDays: Number,
    negotiationDays: Number,
    totalDays: Number
  },
  lastSynced: Date,
  metadata: mongoose.Schema.Types.Mixed,
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
DealSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for fast queries
DealSchema.index({ userId: 1, crmId: 1 }, { unique: true });
DealSchema.index({ userId: 1, stage: 1 });
DealSchema.index({ userId: 1, closeDate: 1 });
DealSchema.index({ userId: 1, 'contact.email': 1 });
DealSchema.index({ userId: 1, clarityScore: -1 });

module.exports = mongoose.model('Deal', DealSchema);