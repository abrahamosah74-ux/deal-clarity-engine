const mongoose = require('mongoose');

const userTrackingEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: [
        // Auth events
        'signup',
        'login',
        'logout',
        'email_verified',
        'password_reset',
        
        // Deal events
        'deal_created',
        'deal_updated',
        'deal_deleted',
        'deal_viewed',
        
        // Contact events
        'contact_created',
        'contact_updated',
        'contact_deleted',
        'contact_viewed',
        
        // Feature usage
        'analytics_viewed',
        'pipeline_viewed',
        'contacts_viewed',
        'tasks_viewed',
        'calendar_viewed',
        'email_viewed',
        'reports_viewed',
        'settings_viewed',
        'forecasting_viewed',
        'crm_connected',
        'calendar_connected',
        'automation_created',
        'import_executed',
        'export_executed',
        
        // Subscription events
        'subscription_upgrade',
        'subscription_downgrade',
        'subscription_cancel',
        'subscription_renewed',
        
        // Other
        'page_visited',
        'feature_accessed',
        'error_occurred',
        'notification_received'
      ],
      required: true,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: String,
    userAgent: String,
    duration: Number, // Duration in milliseconds for session events
    status: {
      type: String,
      enum: ['success', 'failure', 'pending'],
      default: 'success'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { collection: 'user_tracking_events' }
);

// Compound index for efficient queries
userTrackingEventSchema.index({ userId: 1, createdAt: -1 });
userTrackingEventSchema.index({ eventType: 1, createdAt: -1 });

// Auto-delete tracking events after 90 days (optional, comment out to keep forever)
userTrackingEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('UserTrackingEvent', userTrackingEventSchema);
