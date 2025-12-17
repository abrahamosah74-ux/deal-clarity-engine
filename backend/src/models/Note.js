const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internal', 'call-summary', 'meeting-summary', 'email', 'note'],
    default: 'internal'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  pinnedAt: Date,
  attachments: [String],
  mentions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

NoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

NoteSchema.index({ userId: 1, dealId: 1 });
NoteSchema.index({ dealId: 1, createdAt: -1 });

module.exports = mongoose.model('Note', NoteSchema);
