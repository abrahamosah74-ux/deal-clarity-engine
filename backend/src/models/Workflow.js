// backend/src/models/Workflow.js
const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  enabled: {
    type: Boolean,
    default: true
  },
  // Trigger configuration
  trigger: {
    type: {
      type: String,
      enum: [
        'deal_created',
        'deal_updated',
        'deal_stage_changed',
        'deal_amount_changed',
        'deal_closed',
        'deal_days_in_stage',
        'contact_created',
        'contact_updated',
        'custom_date'
      ],
      required: true
    },
    // Specific trigger data based on type
    config: mongoose.Schema.Types.Mixed
  },
  // Conditions (optional - use AND logic)
  conditions: [{
    field: String, // e.g., 'amount', 'stage', 'probability', 'customField'
    operator: {
      type: String,
      enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'is_empty', 'is_not_empty'],
      required: true
    },
    value: mongoose.Schema.Types.Mixed
  }],
  // Actions to execute
  actions: [{
    type: {
      type: String,
      enum: [
        'send_email',
        'create_task',
        'update_field',
        'notify_user',
        'change_stage',
        'add_tag',
        'webhook',
        'slack_notification'
      ],
      required: true
    },
    config: mongoose.Schema.Types.Mixed // Action-specific configuration
  }],
  // Execution history
  executionHistory: [{
    dealId: mongoose.Schema.Types.ObjectId,
    executedAt: Date,
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      default: 'success'
    },
    actionsExecuted: Number,
    error: String
  }],
  stats: {
    totalExecutions: { type: Number, default: 0 },
    successfulExecutions: { type: Number, default: 0 },
    failedExecutions: { type: Number, default: 0 },
    lastExecuted: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Index for queries
WorkflowSchema.index({ team: 1, enabled: 1 });
WorkflowSchema.index({ 'trigger.type': 1 });

module.exports = mongoose.model('Workflow', WorkflowSchema);
