# Feature Access Control System

## Overview

This document describes the feature access control system that enforces subscription plan-based restrictions on Deal Clarity features.

## Plan Tiers

### Free Plan
- **Price**: $0/forever
- **Max Deals**: 5
- **Max Contacts**: 20
- **Available Features**:
  - Basic deal tracking
  - Contact management (read-only email imports)
  - Manual CRM sync
  - Basic commitment tracking
  - Email notifications (disabled)
  - Basic reporting (disabled)
  - Team creation (disabled)
  - Integrations (disabled)

**Restrictions**:
- Cannot delete deals
- Cannot delete contacts
- Cannot export data
- Cannot import contacts in bulk
- Cannot sync CRM automatically
- No access to advanced analytics
- No access to forecasting
- No access to calendar integration
- No access to team management
- No API access

### Pro Plan
- **Price**: $29/month or $290/year
- **Max Deals**: Unlimited
- **Max Contacts**: Unlimited
- **All features from Free**, plus:
  - Unlimited deal creation
  - Unlimited contact management
  - Full deal editing and deletion
  - Data export functionality
  - Contact bulk import
  - Auto CRM sync
  - Advanced analytics
  - Forecasting tools
  - Email notifications
  - Calendar integration
  - Team management (up to 10 members)
  - Custom reports
  - Email support
  - API access

### Enterprise Plan
- **Price**: Custom pricing
- **Max Deals**: Unlimited
- **Max Contacts**: Unlimited
- **All features from Pro**, plus:
  - Unlimited team members
  - Priority support
  - Custom integrations
  - Dedicated account manager (future)

## Architecture

### Backend Implementation

#### Feature Access Middleware (`backend/src/middleware/featureAccess.js`)

The middleware checks user's plan and enforces feature access:

```javascript
// Check generic feature access
router.get('/advanced-report', auth, checkFeatureAccess('analytics.advanced', 'view'), handler);

// Check specific action on feature
router.delete('/deals/:id', auth, checkFeatureAccess('deals', 'delete'), handler);
```

#### Feature Access Map

Defines which features are available in each plan:

```javascript
const featureAccessMap = {
  free: {
    deals: { maxDeals: 5, create: true, delete: false, ... },
    contacts: { maxContacts: 20, create: true, ... },
    ...
  },
  pro: { /* all features enabled */ },
  enterprise: { /* all features with unlimited */ }
};
```

#### Limit Checkers

**Deal Limit Middleware** (`checkDealLimit`):
- Applies to: `POST /api/deals`
- Checks if user can create more deals
- Returns 403 if limit reached

**Contact Limit Middleware** (`checkContactLimit`):
- Applies to: `POST /api/contacts`
- Checks if user can create more contacts
- Returns 403 if limit reached

### Frontend Implementation

#### useFeatureAccess Hook (`frontend/src/hooks/useFeatureAccess.js`)

Custom React hook for checking feature availability:

```javascript
import { useFeatureAccess } from '../hooks/useFeatureAccess';

function MyComponent() {
  const { hasFeature, isPlan, getFeatureLimits } = useFeatureAccess();

  if (!hasFeature('analytics.advanced')) {
    return <UpgradePrompt />;
  }

  const dealLimits = getFeatureLimits('deals');
  // { maxDeals: 5, create: true, delete: false, ... }
}
```

**Available Methods**:
- `hasFeature(feature, action)` - Check if feature/action is available
- `isPlan(plan)` - Check if user is on specific plan
- `isActive()` - Check if subscription is active
- `getPlan()` - Get current plan name
- `getFeatureLimits(feature)` - Get feature limits/details

#### FeatureRestrictionBanner Component

Shows upgrade banner when user hits a limit:

```javascript
<FeatureRestrictionBanner
  feature="deals"
  currentCount={5}
  limit={5}
  message="You've reached your deal limit. Upgrade to Pro for unlimited deals."
  onDismiss={() => setShowBanner(false)}
/>
```

## API Endpoints

### GET /api/subscriptions/features

Returns user's available features and plan information.

**Response**:
```json
{
  "plan": "free",
  "status": "inactive",
  "isActive": false,
  "features": {
    "deals": {
      "maxDeals": 5,
      "create": true,
      "view": true,
      "edit": true,
      "delete": false,
      "export": false
    },
    "contacts": { ... },
    "analytics": { ... },
    ...
  }
}
```

### POST /api/deals (with limits)

Creating a deal checks limits first:

**On Success (under limit)**:
```json
{ "success": true, "deal": { ... } }
```

**On Limit Reached**:
```json
{
  "error": "You've reached the maximum number of deals (5) for your plan",
  "plan": "free",
  "currentCount": 5,
  "limit": 5,
  "message": "Upgrade to Pro for unlimited deals"
}
```

### POST /api/contacts (with limits)

Same as deals endpoint, checks contact limits.

## Integration Examples

### Example 1: Show/Hide Feature Based on Plan

```javascript
function DashboardPage() {
  const { hasFeature, isPlan } = useFeatureAccess();

  return (
    <div>
      {hasFeature('analytics.advanced') && (
        <AdvancedAnalytics />
      )}

      {!hasFeature('analytics.advanced') && (
        <UpgradePrompt feature="Advanced Analytics" />
      )}

      {isPlan('pro') && <ProFeature />}
    </div>
  );
}
```

### Example 2: Disable Actions for Free Users

```javascript
function DealActions({ dealId }) {
  const { hasFeature } = useFeatureAccess();

  return (
    <div>
      <button>Edit</button>
      
      <button
        disabled={!hasFeature('deals', 'delete')}
        title={!hasFeature('deals', 'delete') ? 'Upgrade to delete deals' : ''}
      >
        Delete
      </button>
    </div>
  );
}
```

### Example 3: Handle API Errors for Limits

```javascript
async function createDeal(dealData) {
  try {
    const response = await dealsAPI.create(dealData);
    return response;
  } catch (error) {
    if (error.response?.status === 403 && error.response?.data?.error?.includes('limit')) {
      // Show upgrade banner
      showUpgradeBanner(error.response.data);
    }
    throw error;
  }
}
```

## Enforcement Points

### Backend Enforcement (Server-side)

1. **Authentication**: All protected routes require valid JWT
2. **Feature Check**: Middleware verifies plan-based access
3. **Limit Check**: For deals/contacts, count existing resources
4. **Error Response**: 403 status code with detailed message

### Frontend Enforcement (Client-side)

1. **Hook-based Checks**: `useFeatureAccess` for all components
2. **UI Hiding**: Premium features not shown to free users
3. **Button Disabling**: Actions disabled based on plan
4. **Graceful Fallback**: Toast/banner prompts users to upgrade

## Future Enhancements

1. **Feature Flags**: Add real-time feature toggles
2. **Trial Period**: Automatic trial plan (14 days)
3. **Feature Metering**: Track feature usage in detail
4. **Downgrade Protection**: Warn before downgrading
5. **Team Seat Billing**: Per-user team member pricing
6. **Custom Plans**: Ability for enterprises to customize features
7. **Usage Notifications**: Alert users near limits

## Testing Checklist

- [ ] Free user can create 5 deals then blocked
- [ ] Free user can create 20 contacts then blocked
- [ ] Free user cannot delete deals
- [ ] Pro user can create unlimited deals
- [ ] Pro user can delete deals
- [ ] Pro user has access to analytics
- [ ] Free user sees upgrade prompts for restricted features
- [ ] Features endpoint returns correct plan info
- [ ] Middleware returns 403 for restricted features
- [ ] Contact/deal limits enforce correctly

## Troubleshooting

### Issue: User can create more items than limit allows

**Solution**: Ensure middleware is applied to create routes before the handler

### Issue: Feature access hook returns null

**Solution**: Make sure user is authenticated before calling hook

### Issue: Features not updating after subscription change

**Solution**: Clear localStorage and refresh page to refetch features

## References

- Feature Access Middleware: `backend/src/middleware/featureAccess.js`
- useFeatureAccess Hook: `frontend/src/hooks/useFeatureAccess.js`
- FeatureRestrictionBanner: `frontend/src/components/FeatureRestrictionBanner.js`
