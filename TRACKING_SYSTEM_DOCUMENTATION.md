# User Tracking & Analytics System Documentation

## Overview

The Deal Clarity Engine now includes a **comprehensive user tracking and analytics system** that captures detailed information about how users interact with the application. This system enables data-driven insights into user behavior, feature adoption, and engagement metrics.

## Architecture

### Components

#### 1. **Backend Models** (`backend/src/models/UserTrackingEvent.js`)
- Mongoose schema for storing tracking events
- Automatic timestamp recording
- TTL index for auto-deletion of events after 90 days
- Flexible metadata storage for custom event data

**Event Types Supported:**
- `signup` - User creates account
- `email_verified` - User verifies their email address
- `login` - User logs into the system
- `logout` - User logs out
- `deal_created` - New deal created
- `deal_updated` - Deal information modified
- `deal_deleted` - Deal removed
- `deal_viewed` - User views a deal
- `contact_created` - New contact added
- `contact_updated` - Contact information modified
- `contact_deleted` - Contact removed
- `contact_viewed` - User views a contact
- `task_created` - New task created
- `task_completed` - Task marked as complete
- `note_created` - Note added to deal/contact
- `page_visited` - User navigates to a page
- `feature_accessed` - User accesses a feature
- `report_generated` - Report created
- `email_sent` - Email dispatched
- `workflow_executed` - Workflow automation triggered
- `error_occurred` - Error event for monitoring
- `import_completed` - Data import finished
- `export_completed` - Data export finished
- `sync_completed` - Data synchronization finished
- `payment_processed` - Payment transaction

#### 2. **Backend Service** (`backend/src/services/trackingService.js`)
Static class providing tracking functionality:

##### Methods

**`trackEvent(eventData)`**
- Logs a user event to the database
- Parameters:
  - `userId` (ObjectId): User identifier
  - `eventType` (string): Type of event
  - `metadata` (object, optional): Custom event data
  - `ipAddress` (string, optional): User's IP address
  - `userAgent` (string, optional): Browser user agent
  - `duration` (number, optional): Event duration in milliseconds
  - `status` (string, optional): Event status (success/error)
- Returns: Created event document
- Error Handling: Catches and logs errors without throwing

**`getUserEvents(userId, filters = {})`**
- Retrieves events for a specific user
- Parameters:
  - `userId` (ObjectId): User identifier
  - `filters` (object, optional):
    - `eventType`: Filter by event type
    - `startDate`: Events after this date
    - `endDate`: Events before this date
    - `limit`: Number of events to return (default: 100)
    - `skip`: Pagination offset (default: 0)
- Returns: Array of events with pagination info

**`getAnalytics(startDate, endDate)`**
- Comprehensive platform-wide analytics
- Parameters:
  - `startDate` (string): ISO date string
  - `endDate` (string): ISO date string
- Returns: Object containing:
  - `signups`: Total user registrations
  - `logins`: Total login events
  - `emailVerified`: Users who verified email
  - `activeUsers`: Unique users who logged in
  - `featureUsage`: Object mapping features to usage counts
  - `popularFeatures`: Top 10 most-used features
  - `sessionStats`: Average/min/max session duration

**`getCohortAnalytics(startDate, endDate)`**
- User activation and conversion metrics
- Parameters:
  - `startDate` (string): ISO date string
  - `endDate` (string): ISO date string
- Returns: Object containing:
  - `totalSignups`: Users registered in period
  - `activatedUsers`: Users who verified email
  - `activationRate`: Percentage of email verification
  - `dealCreators`: Users who created deals
  - `conversionRate`: Percentage converting to deal creation

**`deleteOldEvents(daysOld = 90)`**
- Cleanup function to remove old tracking data
- Parameters:
  - `daysOld` (number): Days to keep (default: 90)
- Manual cleanup; TTL index handles automatic deletion

#### 3. **Backend Routes** (`backend/src/routes/tracking.js`)
Express routes for tracking API (all authenticated):

**`POST /api/tracking/event`**
```javascript
// Request body:
{
  eventType: 'deal_created',
  metadata: { dealName: 'Big Contract', amount: 50000 }
}
// Automatically includes userId, IP, user agent from request context
```

**`GET /api/tracking/user-events`**
```javascript
// Query parameters:
{
  eventType: 'deal_created', // optional
  startDate: '2025-01-01',   // optional
  endDate: '2025-01-31',     // optional
  limit: 50,                  // optional (default: 100)
  skip: 0                      // optional (pagination)
}
```

**`GET /api/tracking/analytics`**
```javascript
// Query parameters:
{
  startDate: '2025-01-01',
  endDate: '2025-01-31'
}
// Returns comprehensive platform analytics
```

**`GET /api/tracking/cohort`**
```javascript
// Query parameters:
{
  startDate: '2025-01-01',
  endDate: '2025-01-31'
}
// Returns cohort analysis data
```

#### 4. **Frontend Service** (`frontend/src/services/trackingService.js`)
Client-side tracking service with error handling:

##### Methods

**`trackEvent(eventType, metadata = {})`**
- Log a custom event
- Usage:
```javascript
await trackingService.trackEvent('feature_accessed', { 
  featureName: 'Pipeline View' 
});
```

**`trackPageVisit(pageName)`**
- Log page navigation
- Usage:
```javascript
await trackingService.trackPageVisit('/deals');
```

**`trackFeatureAccess(featureName)`**
- Log feature usage
- Usage:
```javascript
await trackingService.trackFeatureAccess('Deal Analytics');
```

**`trackDealCreated(dealData)`**
- Log deal creation event
- Usage:
```javascript
await trackingService.trackDealCreated({ name, value, stage });
```

**`trackContactCreated(contactData)`**
- Log contact creation event
- Usage:
```javascript
await trackingService.trackContactCreated({ name, email, company });
```

**`trackLogout()`**
- Log user logout event

**`trackError(errorMessage, context = {})`**
- Log error events for monitoring
- Usage:
```javascript
await trackingService.trackError('API request failed', { endpoint: '/deals' });
```

**Query Methods:**
- `getUserEvents(filters)` - Fetch user's event history
- `getAnalytics(startDate, endDate)` - Get platform analytics
- `getCohortAnalytics(startDate, endDate)` - Get cohort metrics

#### 5. **Analytics Dashboard** (`frontend/src/pages/UsageAnalytics.js`)
Interactive dashboard for viewing tracking data:

**Features:**
- **Date Range Filter**: Select custom date ranges for analysis
- **Overview Tab**: Key metrics (signups, logins, active users, email verified)
- **Feature Usage Tab**: Visualization of feature adoption with bar charts
- **Cohort Analysis Tab**: User activation and conversion metrics

**Metrics Displayed:**
- Total Signups
- Email Verified Count
- Active Users
- Total Logins
- Average Session Duration
- Feature Usage Breakdown
- Activation Rate
- Conversion Rate

## Integration Points

### Automatic Tracking

The following events are automatically tracked:

**User Registration** (`backend/src/routes/auth.js`):
```javascript
await TrackingService.trackEvent({
  userId: user._id,
  eventType: 'signup',
  metadata: { email, company },
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

**Email Verification** (`backend/src/routes/auth.js`):
```javascript
await TrackingService.trackEvent({
  userId: user._id,
  eventType: 'email_verified',
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

**User Login** (`backend/src/routes/auth.js`):
```javascript
await TrackingService.trackEvent({
  userId: user._id,
  eventType: 'login',
  ipAddress: req.ip,
  userAgent: req.get('user-agent')
});
```

### Adding Tracking to New Features

#### Backend Example
Add tracking to deal creation endpoint:

```javascript
// In backend/src/routes/deals.js (POST handler)
const TrackingService = require('../services/trackingService');

router.post('/', auth, async (req, res) => {
  try {
    const deal = new Deal(req.body);
    deal.userId = req.user._id;
    await deal.save();
    
    // Track the event
    await TrackingService.trackEvent({
      userId: req.user._id,
      eventType: 'deal_created',
      metadata: { dealName: deal.name, amount: deal.value, stage: deal.stage },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### Frontend Example
Add tracking to feature usage:

```javascript
// In any React component
import trackingService from '../services/trackingService';

const MyComponent = () => {
  const handleFeatureAccess = async () => {
    // Use the feature
    await trackingService.trackFeatureAccess('My Feature Name');
    // ... rest of logic
  };
  
  return <button onClick={handleFeatureAccess}>Use Feature</button>;
};
```

## Analytics Queries

### Get User Signup Metrics
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tracking/analytics?startDate=2025-01-01&endDate=2025-12-31"
```

### Get User Event History
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tracking/user-events?eventType=deal_created&limit=50"
```

### Get Cohort Analysis
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tracking/cohort?startDate=2025-01-01&endDate=2025-12-31"
```

## Data Storage

- **Database**: MongoDB (tracked in `UserTrackingEvent` collection)
- **Retention**: Events auto-delete after 90 days (configurable)
- **Indexes**: Optimized queries on userId, eventType, createdAt
- **Size**: Minimal overhead (~500 bytes per event)

## Security & Privacy

- All tracking endpoints require authentication
- User can only view their own event history
- IP addresses and user agents are logged but not used for identification
- Events are immutable once created (audit trail)
- GDPR-compliant: Can implement user data deletion on account removal

## Performance Considerations

- **Non-blocking**: Tracking calls use async/await but don't block user actions
- **Error Handling**: Tracking failures never prevent normal app operations
- **Database**: Uses efficient indexes to minimize query impact
- **TTL Index**: Automatic cleanup prevents unlimited growth

## Troubleshooting

### Events Not Appearing in Analytics
1. Verify user has `authenticate` middleware applied to routes
2. Check `UserTrackingEvent` collection exists in MongoDB
3. Ensure event has all required fields: userId, eventType
4. Check date range filter in analytics dashboard

### High Query Latency
1. Verify MongoDB indexes are present: `userId`, `eventType`, `createdAt`
2. Check database connection pool size
3. Consider archiving old events beyond 90-day retention

### Tracking API Returns 401
1. Ensure auth token is included in Authorization header
2. Verify JWT token is valid and not expired
3. Check authentication middleware is registered in auth.js

## Future Enhancements

- [ ] Real-time event streaming with WebSockets
- [ ] Advanced cohort segmentation
- [ ] Funnel analysis (signup → email verify → deal create)
- [ ] Custom event definitions via admin dashboard
- [ ] Event data export (CSV/JSON)
- [ ] Behavioral heatmaps
- [ ] A/B testing framework
- [ ] Machine learning for churn prediction

## API Reference Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/tracking/event` | POST | Yes | Log custom event |
| `/api/tracking/user-events` | GET | Yes | Get user's events |
| `/api/tracking/analytics` | GET | Yes | Get platform analytics |
| `/api/tracking/cohort` | GET | Yes | Get cohort analysis |

## Support

For issues or questions regarding the tracking system, check:
1. Backend logs for error messages
2. MongoDB `UserTrackingEvent` collection for data integrity
3. Frontend console for JavaScript errors
4. Network tab for API request/response details
