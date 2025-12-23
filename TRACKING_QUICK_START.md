# Tracking System Integration Guide

## Quick Start

The tracking system is now fully operational and tracking the following events automatically:

1. ✅ **User Signup** - Captured when new users register
2. ✅ **Email Verification** - Captured when users verify their email
3. ✅ **User Login** - Captured when users log in

## Viewing Analytics

1. **Login** to the application
2. **Open sidebar menu** and click **"Usage Analytics"**
3. **Select date range** to filter events
4. **View metrics** in three tabs:
   - **Overview**: Key statistics (signups, logins, active users)
   - **Feature Usage**: Track which features are used most
   - **Cohort Analysis**: User activation and conversion rates

## Adding Tracking to Your Features

### Backend Example: Track Deal Creation

In your deal creation endpoint, add:

```javascript
const TrackingService = require('../services/trackingService');

router.post('/', auth, async (req, res) => {
  try {
    const deal = new Deal(req.body);
    deal.userId = req.user._id;
    await deal.save();
    
    // Track the event - non-blocking
    await TrackingService.trackEvent({
      userId: req.user._id,
      eventType: 'deal_created',
      metadata: { 
        dealName: deal.name, 
        amount: deal.value, 
        stage: deal.stage 
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
    
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Frontend Example: Track Feature Usage

In any React component:

```javascript
import trackingService from '../services/trackingService';

export default function MyFeature() {
  const handleAction = async () => {
    // Track feature access
    await trackingService.trackFeatureAccess('My Feature Name');
    
    // Or track custom events
    await trackingService.trackEvent('custom_action', {
      action: 'some_action',
      value: 'some_value'
    });
    
    // Your feature logic here
  };
  
  return <button onClick={handleAction}>Click Me</button>;
}
```

## Available Event Types

```
signup              - User creates account
email_verified      - User verifies email
login               - User logs in
logout              - User logs out
deal_created        - New deal created
deal_updated        - Deal modified
deal_deleted        - Deal removed
deal_viewed         - User views deal
contact_created     - New contact added
contact_updated     - Contact modified
contact_deleted     - Contact removed
contact_viewed      - User views contact
task_created        - New task created
task_completed      - Task marked complete
note_created        - Note added
page_visited        - User navigates to page
feature_accessed    - User uses feature
report_generated    - Report created
email_sent          - Email dispatched
workflow_executed   - Workflow triggered
error_occurred      - Error for monitoring
import_completed    - Data import done
export_completed    - Data export done
sync_completed      - Sync operation done
payment_processed   - Payment transaction
```

## API Endpoints

All endpoints require authentication (JWT token in Authorization header).

### Log a Custom Event
```bash
POST /api/tracking/event
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "eventType": "deal_created",
  "metadata": {
    "dealName": "Big Deal",
    "amount": 50000
  }
}
```

### Get User's Event History
```bash
GET /api/tracking/user-events?limit=50&skip=0&eventType=deal_created
Authorization: Bearer YOUR_TOKEN
```

### Get Platform Analytics
```bash
GET /api/tracking/analytics?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer YOUR_TOKEN
```

### Get Cohort Analysis
```bash
GET /api/tracking/cohort?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer YOUR_TOKEN
```

## Key Features

✅ **Non-blocking** - Tracking never breaks your feature
✅ **Error handling** - Errors are caught and logged, never throw
✅ **Automatic cleanup** - Old events auto-delete after 90 days
✅ **Flexible metadata** - Store any custom data with events
✅ **IP & User Agent** - Automatic capture of request context
✅ **Indexed queries** - Fast analytics on large datasets
✅ **Secure** - All endpoints authenticated, user privacy protected

## Files Modified

- ✅ `backend/src/models/UserTrackingEvent.js` - Event schema
- ✅ `backend/src/services/trackingService.js` - Tracking logic
- ✅ `backend/src/routes/tracking.js` - API endpoints
- ✅ `backend/src/routes/auth.js` - Auto-tracking on auth
- ✅ `backend/src/index.js` - Routes registration
- ✅ `frontend/src/services/trackingService.js` - Client-side tracking
- ✅ `frontend/src/pages/UsageAnalytics.js` - Analytics dashboard
- ✅ `frontend/src/pages/UsageAnalytics.css` - Dashboard styles
- ✅ `frontend/src/App.js` - Route integration

## Next Steps

1. **Test it out** - Sign up a new user and verify events appear in analytics
2. **Add tracking** to key features (deal creation, feature access, etc.)
3. **Monitor analytics** daily to track user engagement
4. **Optimize features** based on usage patterns

## Troubleshooting

**Q: Events not appearing?**
A: Check the date range filter and ensure events were created within that range

**Q: Dashboard loading slow?**
A: Try narrowing the date range to reduce data volume

**Q: 401 error on tracking API?**
A: Ensure authentication token is valid and included in headers

For detailed documentation, see: `TRACKING_SYSTEM_DOCUMENTATION.md`
