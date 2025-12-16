// backend/src/models/Commitment.js
const mongoose = require('mongoose');

const CommitmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealId: String, // CRM deal ID
  calendarEventId: String,
  meetingTitle: String,
  participants: [{
    email: String,
    name: String,
    company: String
  }],
  ourCommitments: [{
    action: String,
    owner: String, // 'rep' or specific email
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  theirCommitments: [{
    action: String,
    owner: String, // prospect email
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'overdue', 'non-committal'],
      default: 'pending'
    },
    completedAt: Date
  }],
  meetingDate: Date,
  followUpEmail: {
    sent: Boolean,
    sentAt: Date,
    emailId: String,
    subject: String,
    body: String
  },
  crmSync: {
    synced: Boolean,
    syncedAt: Date,
    fieldUpdated: String,
    error: String
  },
  clarityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast queries
CommitmentSchema.index({ userId: 1, meetingDate: -1 });
CommitmentSchema.index({ 'participants.email': 1 });
CommitmentSchema.index({ dealId: 1 });

module.exports = mongoose.model('Commitment', CommitmentSchema);