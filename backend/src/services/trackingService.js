// backend/src/services/trackingService.js
const UserTrackingEvent = require('../models/UserTrackingEvent');

/**
 * Track user events for analytics
 */
class TrackingService {
  /**
   * Log a user event
   */
  static async trackEvent({
    userId,
    eventType,
    metadata = {},
    ipAddress = null,
    userAgent = null,
    duration = null,
    status = 'success'
  }) {
    try {
      if (!userId || !eventType) {
        console.warn('⚠️ Tracking event missing required fields:', { userId, eventType });
        return null;
      }

      const event = new UserTrackingEvent({
        userId,
        eventType,
        metadata,
        ipAddress,
        userAgent,
        duration,
        status
      });

      await event.save();
      console.log(`📊 Event tracked: ${eventType} for user ${userId}`);
      return event;
    } catch (error) {
      console.error('❌ Error tracking event:', error.message);
      // Don't throw - tracking should never break the app
      return null;
    }
  }

  /**
   * Get user's tracking events
   */
  static async getUserEvents(userId, options = {}) {
    try {
      const {
        eventType = null,
        limit = 100,
        skip = 0,
        startDate = null,
        endDate = null
      } = options;

      const query = { userId };

      if (eventType) {
        query.eventType = eventType;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      return await UserTrackingEvent.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();
    } catch (error) {
      console.error('❌ Error fetching user events:', error.message);
      return [];
    }
  }

  /**
   * Get usage analytics
   */
  static async getAnalytics(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;
      const query = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Total signups
      const signups = await UserTrackingEvent.countDocuments({
        ...query,
        eventType: 'signup'
      });

      // Total logins
      const logins = await UserTrackingEvent.countDocuments({
        ...query,
        eventType: 'login'
      });

      // Features used
      const featureEvents = [
        'deal_created',
        'contact_created',
        'analytics_viewed',
        'pipeline_viewed',
        'automation_created',
        'import_executed',
        'export_executed'
      ];

      const featureUsage = await Promise.all(
        featureEvents.map(async (feature) => ({
          feature,
          count: await UserTrackingEvent.countDocuments({
            ...query,
            eventType: feature
          })
        }))
      );

      // Active users (users who logged in)
      const activeUsers = await UserTrackingEvent.distinct('userId', {
        ...query,
        eventType: 'login'
      });

      // Email verified users
      const emailVerified = await UserTrackingEvent.countDocuments({
        ...query,
        eventType: 'email_verified'
      });

      // Most popular features
      const popularFeatures = await UserTrackingEvent.aggregate([
        { $match: { ...query } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Average session duration
      const sessionStats = await UserTrackingEvent.aggregate([
        { $match: { ...query, duration: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: '$duration' },
            maxDuration: { $max: '$duration' },
            minDuration: { $min: '$duration' }
          }
        }
      ]);

      return {
        signups,
        logins,
        activeUsers: activeUsers.length,
        emailVerified,
        featureUsage: Object.fromEntries(
          featureUsage.map(f => [f.feature, f.count])
        ),
        popularFeatures: Object.fromEntries(
          popularFeatures.map(f => [f._id, f.count])
        ),
        sessionStats: sessionStats[0] || {
          avgDuration: 0,
          maxDuration: 0,
          minDuration: 0
        },
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      console.error('❌ Error getting analytics:', error.message);
      return {
        signups: 0,
        logins: 0,
        activeUsers: 0,
        emailVerified: 0,
        featureUsage: {},
        popularFeatures: {},
        sessionStats: {}
      };
    }
  }

  /**
   * Get user cohort analytics
   */
  static async getCohortAnalytics(startDate, endDate) {
    try {
      // Users who signed up in date range
      const newUsers = await UserTrackingEvent.distinct('userId', {
        eventType: 'signup',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      });

      // Check which signed up users also logged in
      const activatedUsers = await UserTrackingEvent.distinct('userId', {
        userId: { $in: newUsers },
        eventType: 'login',
        createdAt: { $gte: new Date(startDate) }
      });

      // Check which signed up users created deals
      const dealCreators = await UserTrackingEvent.distinct('userId', {
        userId: { $in: newUsers },
        eventType: 'deal_created',
        createdAt: { $gte: new Date(startDate) }
      });

      return {
        totalSignups: newUsers.length,
        activatedUsers: activatedUsers.length,
        activationRate: newUsers.length > 0 ? (activatedUsers.length / newUsers.length * 100).toFixed(2) + '%' : '0%',
        dealCreators: dealCreators.length,
        conversionRate: newUsers.length > 0 ? (dealCreators.length / newUsers.length * 100).toFixed(2) + '%' : '0%'
      };
    } catch (error) {
      console.error('❌ Error getting cohort analytics:', error.message);
      return {
        totalSignups: 0,
        activatedUsers: 0,
        activationRate: '0%',
        dealCreators: 0,
        conversionRate: '0%'
      };
    }
  }

  /**
   * Delete old tracking events (for cleanup)
   */
  static async deleteOldEvents(days = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await UserTrackingEvent.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      console.log(`🗑️ Deleted ${result.deletedCount} tracking events older than ${days} days`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error deleting old events:', error.message);
      return 0;
    }
  }
}

module.exports = TrackingService;
