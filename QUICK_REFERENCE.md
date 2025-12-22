# Feature Access Control - Quick Reference

## For Developers

### Check Feature in Frontend

```javascript
import { useFeatureAccess } from '../hooks/useFeatureAccess';

function MyComponent() {
  const { hasFeature, isPlan } = useFeatureAccess();
  
  // Has feature?
  if (hasFeature('analytics.advanced')) { ... }
  
  // Is specific plan?
  if (isPlan('pro')) { ... }
}
```

### Protect Backend Route

```javascript
const { checkFeatureAccess, checkDealLimit } = require('../middleware/featureAccess');

// Check feature
router.get('/report', auth, checkFeatureAccess('analytics.advanced'), handler);

// Check resource limit
router.post('/deals', auth, checkDealLimit, handler);
```

### Handle Limit Error

```javascript
try {
  await createDeal(data);
} catch (error) {
  if (error.response?.status === 403) {
    // User hit limit or feature restriction
    showUpgradePrompt(error.response.data.message);
  }
}
```

## Plan Feature Matrix

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Max Deals | 5 | ∞ | ∞ |
| Max Contacts | 20 | ∞ | ∞ |
| Delete Deals | ❌ | ✅ | ✅ |
| Delete Contacts | ❌ | ✅ | ✅ |
| Export Data | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| Forecasting | ❌ | ✅ | ✅ |
| Calendar Sync | ❌ | ✅ | ✅ |
| CRM Integration | ❌ | ✅ | ✅ |
| Automations | ❌ | ✅ | ✅ |
| Team Members | 1 | 10 | ∞ |
| API Access | ❌ | ✅ | ✅ |

## Hook Methods Reference

```javascript
const {
  hasFeature,        // (feature, action?) => bool
  isPlan,           // (plan) => bool
  isActive,         // () => bool - is subscription active?
  getPlan,          // () => string - returns 'free', 'pro', 'enterprise'
  getFeatureLimits, // (feature) => object - returns limits for feature
  features,         // raw feature object
  loading,          // boolean
  error             // error message or null
} = useFeatureAccess();
```

## API Endpoints

### Get User Features
```
GET /api/subscriptions/features
```
Returns user's plan and available features

### Create Deal (with limit check)
```
POST /api/deals
```
Returns 403 if user has hit deal limit

### Create Contact (with limit check)
```
POST /api/contacts
```
Returns 403 if user has hit contact limit

## Component Patterns

### Hide Feature for Free Users
```javascript
{isPlan('pro') && <ProFeature />}
```

### Disable Action for Free Users
```javascript
<button disabled={!hasFeature('deals', 'delete')}>Delete</button>
```

### Show Upgrade Prompt
```javascript
{!hasFeature('analytics.advanced') && (
  <UpgradePrompt message="Upgrade to Pro for advanced analytics" />
)}
```

### Display Limits
```javascript
const limits = getFeatureLimits('deals');
<p>Used {currentCount} of {limits.maxDeals}</p>
```

## Files to Know

| File | Purpose |
|------|---------|
| `backend/src/middleware/featureAccess.js` | Middleware & feature definitions |
| `frontend/src/hooks/useFeatureAccess.js` | React hook for feature checking |
| `frontend/src/components/FeatureRestrictionBanner.js` | Upgrade prompt banner |
| `FEATURE_ACCESS_GUIDE.md` | Complete documentation |
| `FEATURE_IMPLEMENTATION_GUIDE.md` | Developer guide with examples |
| `IMPLEMENTATION_SUMMARY.md` | Overview of what was built |

## Common Tasks

### Task: Hide Analytics for Free Users
```javascript
const { hasFeature } = useFeatureAccess();
return hasFeature('analytics.advanced') ? <Analytics /> : <UpgradePrompt />;
```

### Task: Disable Delete for Free Users
```javascript
<button disabled={!hasFeature('deals', 'delete')}>Delete</button>
```

### Task: Prevent Creating Too Many Deals
```javascript
// Handled automatically by POST /api/deals
// Returns 403 if user has 5+ deals on free plan
```

### Task: Show Feature Comparison
```javascript
// See example in FeatureGatingExample.js
// Shows free vs pro vs enterprise features
```

### Task: Add New Restricted Feature

1. Add to `featureAccessMap` in `featureAccess.js`
2. Add middleware to route in backend
3. Add hook check in frontend component

Example:
```javascript
// In featureAccessMap
'newFeature': {
  free: false,
  pro: true,
  enterprise: true
}

// In backend route
router.get('/new-feature', auth, checkFeatureAccess('newFeature'), handler);

// In frontend
if (hasFeature('newFeature')) { ... }
```

## Error Messages Users See

### Hit Deal Limit
```
You've reached the maximum number of deals (5) for your plan
Upgrade to Pro for unlimited deals
```

### Hit Contact Limit
```
You've reached the maximum number of contacts (20) for your plan
Upgrade to Pro for unlimited contacts
```

### Restricted Feature
```
Feature not available in your plan
Upgrade to a higher plan to access [feature]
```

### Restricted Action
```
Action '[action]' not available in your plan
Upgrade to a higher plan to [action] [feature]
```

## Testing

### Free User Flow
1. Create 5 deals (works)
2. Try to create 6th deal (blocked with 403)
3. Try to delete deal (blocked)
4. Try to access analytics (hidden/locked)
5. Try to sync CRM (blocked)

### Pro User Flow
1. Create unlimited deals (works)
2. Delete deals (works)
3. Access analytics (visible/enabled)
4. Sync CRM (works)

## Deployment Status

✅ **Backend (Render)**: Active - https://deal-clarity-engine.onrender.com
✅ **Frontend (Vercel)**: Active - https://app.deal-clarity.com
✅ **Database (MongoDB Atlas)**: Active
✅ **Email (Resend)**: Active with verified domain

## Support Resources

1. **For "Feature not available" errors**: Check user's subscription plan
2. **For "Limit reached" errors**: User needs to upgrade
3. **For undefined features**: Check if hook is being used correctly
4. **For API errors**: Ensure proper authentication with JWT token

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0  
**Last Updated**: Today
