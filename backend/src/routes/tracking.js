// backend/src/routes/tracking.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TrackingService = require('../services/trackingService');

/**
 * Track a user event
 * POST /api/tracking/event
 */
router.post('/event', auth, async (req, res) => {
  try {
    const { eventType, metadata = {}, duration = null } = req.body;

    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }

    const event = await TrackingService.trackEvent({
      userId: req.user.id,
      eventType,
      metadata,
      duration,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

/**
 * Get user's tracking events
 * GET /api/tracking/user-events
 */
router.get('/user-events', auth, async (req, res) => {
  try {
    const { eventType = null, limit = 100, skip = 0, startDate = null, endDate = null } = req.query;

    const events = await TrackingService.getUserEvents(req.user.id, {
      eventType,
      limit: parseInt(limit),
      skip: parseInt(skip),
      startDate,
      endDate
    });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * Get overall usage analytics (Admin only)
 * GET /api/tracking/analytics
 */
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin (optional - implement based on your needs)
    // For now, allow any authenticated user to see basic analytics
    
    const { startDate = null, endDate = null } = req.query;

    const analytics = await TrackingService.getAnalytics({
      startDate,
      endDate
    });

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * Get cohort analytics
 * GET /api/tracking/cohort
 */
router.get('/cohort', auth, async (req, res) => {
  try {
    const { startDate = null, endDate = null } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const cohort = await TrackingService.getCohortAnalytics(startDate, endDate);

    res.json({
      success: true,
      cohort
    });
  } catch (error) {
    console.error('Error fetching cohort analytics:', error);
    res.status(500).json({ error: 'Failed to fetch cohort analytics' });
  }
});

module.exports = router;
