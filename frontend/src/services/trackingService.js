// frontend/src/services/trackingService.js
import { api } from './api';

/**
 * Frontend tracking service to log user events
 */
export const trackingService = {
  /**
   * Track an event
   */
  async trackEvent(eventType, metadata = {}, duration = null) {
    try {
      const response = await api.post('/tracking/event', {
        eventType,
        metadata,
        duration
      });
      console.log(`📊 Tracked event: ${eventType}`);
      return response;
    } catch (error) {
      // Don't throw - tracking should never break the app
      console.warn(`⚠️ Failed to track event ${eventType}:`, error.message);
      return null;
    }
  },

  /**
   * Track page visit
   */
  async trackPageVisit(pageName) {
    return this.trackEvent('page_visited', {
      page: pageName,
      url: window.location.pathname
    });
  },

  /**
   * Track feature access
   */
  async trackFeatureAccess(featureName) {
    return this.trackEvent('feature_accessed', {
      feature: featureName
    });
  },

  /**
   * Track deal creation
   */
  async trackDealCreated(dealId, metadata = {}) {
    return this.trackEvent('deal_created', {
      dealId,
      ...metadata
    });
  },

  /**
   * Track contact creation
   */
  async trackContactCreated(contactId, metadata = {}) {
    return this.trackEvent('contact_created', {
      contactId,
      ...metadata
    });
  },

  /**
   * Track logout
   */
  async trackLogout() {
    return this.trackEvent('logout', {
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Track error occurrence
   */
  async trackError(errorMessage, errorType = 'general') {
    return this.trackEvent('error_occurred', {
      errorMessage,
      errorType,
      url: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Get user's events
   */
  async getUserEvents(eventType = null, limit = 50) {
    try {
      const params = { limit };
      if (eventType) params.eventType = eventType;

      const response = await api.get('/tracking/user-events', { params });
      return response.events || [];
    } catch (error) {
      console.warn('Failed to fetch user events:', error.message);
      return [];
    }
  },

  /**
   * Get usage analytics (all users)
   */
  async getAnalytics(startDate = null, endDate = null) {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/tracking/analytics', { params });
      return response.analytics || {};
    } catch (error) {
      console.warn('Failed to fetch analytics:', error.message);
      return {};
    }
  },

  /**
   * Get cohort analytics
   */
  async getCohortAnalytics(startDate, endDate) {
    try {
      const response = await api.get('/tracking/cohort', {
        params: { startDate, endDate }
      });
      return response.cohort || {};
    } catch (error) {
      console.warn('Failed to fetch cohort analytics:', error.message);
      return {};
    }
  }
};

export default trackingService;
