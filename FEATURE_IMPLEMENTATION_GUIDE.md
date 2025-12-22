# Feature Access Control Implementation Guide

This guide provides step-by-step instructions for implementing feature access control in Deal Clarity based on subscription plans.

## Quick Start

### 1. Check User's Plan (Frontend)

```javascript
import { useFeatureAccess } from '../hooks/useFeatureAccess';

function MyComponent() {
  const { hasFeature, isPlan, getFeatureLimits } = useFeatureAccess();

  if (isPlan('free')) {
    return <FreeUserOnlyContent />;
  }

  if (!hasFeature('analytics.advanced')) {
    return <UpgradePrompt />;
  }

  return <AdvancedAnalyticsComponent />;
}
```

### 2. Protect Routes (Backend)

```javascript
const { checkFeatureAccess, checkDealLimit } = require('../middleware/featureAccess');

// Check feature availability
router.get('/advanced-report', auth, checkFeatureAccess('analytics.advanced'), handler);

// Check resource limits
router.post('/deals', auth, checkDealLimit, handler);
```

### 3. Handle Limit Errors (Frontend)

```javascript
try {
  await createDeal(dealData);
} catch (error) {
  if (error.response?.status === 403) {
    // User hit a limit or feature restriction
    const { error: message, currentCount, limit } = error.response.data;
    showUpgradePrompt(message);
  }
}
```

## Detailed Implementation

### Step 1: Show/Hide UI Based on Plan

#### Option A: Hide entire components

```javascript
import { useFeatureAccess } from '../hooks/useFeatureAccess';

export function Dashboard() {
  const { hasFeature, isPlan } = useFeatureAccess();

  return (
    <div>
      <BasicFeatures />
      
      {hasFeature('analytics.advanced') && (
        <AdvancedAnalyticsSection />
      )}
      
      {isPlan('pro') && (
        <ProFeatureSection />
      )}
    </div>
  );
}
```

#### Option B: Disable actions

```javascript
export function DealCard({ deal }) {
  const { hasFeature } = useFeatureAccess();

  return (
    <div>
      <button disabled={!hasFeature('deals', 'edit')}>
        Edit
      </button>
      
      <button 
        disabled={!hasFeature('deals', 'delete')}
        title={!hasFeature('deals', 'delete') ? 'Upgrade to delete' : ''}
      >
        Delete
      </button>
      
      <button disabled={!hasFeature('deals', 'export')}>
        Export
      </button>
    </div>
  );
}
```

#### Option C: Show upgrade prompts

```javascript
export function AnalyticsSection() {
  const { hasFeature } = useFeatureAccess();
  const navigate = useNavigate();

  if (!hasFeature('analytics.advanced')) {
    return (
      <div className="locked-feature">
        <h3>Advanced Analytics</h3>
        <p>Only available in Pro plan</p>
        <button onClick={() => navigate('/subscriptions')}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return <AdvancedAnalytics />;
}
```

### Step 2: Handle API Errors

```javascript
async function createDeal(dealData) {
  try {
    const response = await api.post('/deals', dealData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      // Feature restricted or limit reached
      const errorData = error.response.data;
      
      // Show banner with upgrade prompt
      toast.error(errorData.message);
      
      // Optionally navigate to subscriptions
      // navigate('/subscriptions');
      
      return null;
    }
    throw error;
  }
}
```

### Step 3: Display Feature Limits

```javascript
export function DealForm() {
  const { getFeatureLimits } = useFeatureAccess();
  const limits = getFeatureLimits('deals');

  return (
    <form>
      <input type="text" placeholder="Deal name" />
      
      {limits?.maxDeals && (
        <p className="text-sm text-gray-500">
          You can create up to {limits.maxDeals} deals in your plan
        </p>
      )}
      
      <button type="submit">Create Deal</button>
    </form>
  );
}
```

### Step 4: Show Feature Comparison

```javascript
export function PricingTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Free</th>
          <th>Pro</th>
          <th>Enterprise</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Max Deals</td>
          <td>5</td>
          <td>Unlimited</td>
          <td>Unlimited</td>
        </tr>
        <tr>
          <td>Delete Deals</td>
          <td>❌</td>
          <td>✅</td>
          <td>✅</td>
        </tr>
        <tr>
          <td>Advanced Analytics</td>
          <td>❌</td>
          <td>✅</td>
          <td>✅</td>
        </tr>
        {/* More features... */}
      </tbody>
    </table>
  );
}
```

## Plan Tiers Overview

### Free Plan Features

✅ Available:
- Basic deal tracking (up to 5 deals)
- Contact management (up to 20 contacts)
- Manual CRM sync
- Commitment tracking
- Basic notes

❌ Restricted:
- Deal deletion
- Contact deletion
- Data export
- Advanced analytics
- Forecasting
- Calendar integration
- CRM auto-sync
- Automations
- Team management
- API access

### Pro Plan Features

✅ All Free features, plus:
- Unlimited deals and contacts
- Full CRUD operations
- Data export
- Advanced analytics
- Revenue forecasting
- Calendar sync
- CRM auto-sync
- Workflow automations
- Team management (up to 10 members)
- Custom reports
- Email support
- API access

### Enterprise Plan Features

✅ All Pro features, plus:
- Unlimited team members
- Priority support
- Custom integrations
- Dedicated support (future)

## Backend Implementation Details

### Feature Access Middleware

Located in: `backend/src/middleware/featureAccess.js`

#### Check Feature Access

```javascript
const { checkFeatureAccess } = require('../middleware/featureAccess');

router.delete('/deals/:id', 
  auth, 
  checkFeatureAccess('deals', 'delete'), 
  async (req, res) => {
    // Only reaches here if user can delete
  }
);
```

#### Check Resource Limits

```javascript
const { checkDealLimit, checkContactLimit } = require('../middleware/featureAccess');

router.post('/deals', auth, checkDealLimit, async (req, res) => {
  // Checks if user has room to create more deals
});

router.post('/contacts', auth, checkContactLimit, async (req, res) => {
  // Checks if user has room to create more contacts
});
```

### API Endpoint: Get User Features

**Endpoint**: `GET /api/subscriptions/features`

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
    "contacts": {
      "maxContacts": 20,
      "create": true,
      "view": true,
      "edit": true,
      "delete": false
    },
    "analytics": {
      "basic": true,
      "advanced": false,
      "forecasting": false,
      "reporting": false
    },
    "calendar": {
      "enabled": false
    },
    "integrations": {
      "crm": false,
      "email": false
    },
    "automations": false,
    "team": {
      "maxMembers": 1,
      "create": false,
      "manage": false
    }
  }
}
```

## Protected Routes

### Analytics
- `GET /api/analytics/velocity` - Requires `analytics.advanced`
- `GET /api/analytics/pipeline` - Available to all (basic)

### Forecasting
- `GET /api/forecasting/pipeline` - Requires `analytics.forecasting`

### CRM Integration
- `POST /api/crm/connect` - Requires `integrations.crm`
- `GET /api/crm/sync` - Requires `integrations.crm`

### Calendar
- `GET /api/calendar/events` - Requires `calendar.enabled`

### Automations/Workflows
- `POST /api/automations` - Requires `automations`
- `PUT /api/automations/:id` - Requires `automations`

### Deals
- `POST /api/deals` - Requires `checkDealLimit` middleware

### Contacts
- `POST /api/contacts` - Requires `checkContactLimit` middleware

## Common Patterns

### Pattern 1: Conditional Feature Access

```javascript
// Show different UI based on plan
const renderAnalyticsSection = () => {
  const { hasFeature, getPlan } = useFeatureAccess();

  if (hasFeature('analytics.advanced')) {
    return <AdvancedAnalytics />;
  }

  if (hasFeature('analytics.basic')) {
    return <BasicAnalytics />;
  }

  return (
    <div>
      <p>Analytics not available in {getPlan()} plan</p>
      <button>Upgrade</button>
    </div>
  );
};
```

### Pattern 2: Graceful Degradation

```javascript
// Attempt action, handle restriction gracefully
const handleAction = async (action) => {
  try {
    await executeAction(action);
    toast.success('Action completed');
  } catch (error) {
    if (error.response?.status === 403) {
      // Show upgrade option instead of error
      showUpgradeModal(error.response.data.message);
    } else {
      // Show actual error
      toast.error(error.message);
    }
  }
};
```

### Pattern 3: Progressive Feature Unlocking

```javascript
// Guide users through upgrade path
const showFeatureGuide = () => {
  const { isPlan, hasFeature } = useFeatureAccess();

  return (
    <div className="feature-guide">
      <h3>Your Sales Pipeline Journey</h3>
      
      <Step completed={true}>
        <span>✓ Basic Deal Tracking</span>
        <span className="plan-tag">Free</span>
      </Step>

      <Step completed={isPlan('pro')}>
        <span>{isPlan('pro') ? '✓' : '🔒'} Unlimited Deals</span>
        <span className="plan-tag">Pro</span>
      </Step>

      <Step completed={hasFeature('analytics.advanced')}>
        <span>{hasFeature('analytics.advanced') ? '✓' : '🔒'} Advanced Analytics</span>
        <span className="plan-tag">Pro</span>
      </Step>

      {!isPlan('pro') && (
        <button onClick={() => navigate('/subscriptions')}>
          Upgrade to Pro
        </button>
      )}
    </div>
  );
};
```

## Testing Checklist

- [ ] Free plan users can create up to 5 deals
- [ ] Free plan users cannot delete deals
- [ ] Free plan users cannot export data
- [ ] Free plan users cannot access advanced analytics
- [ ] Free plan users cannot access calendar
- [ ] Free plan users cannot create CRM integrations
- [ ] Free plan users cannot create automations
- [ ] Pro users have all features enabled
- [ ] Error messages clearly explain why action is blocked
- [ ] UI properly disables/hides restricted features
- [ ] useFeatureAccess hook works correctly
- [ ] Feature limits are enforced server-side
- [ ] Backend returns proper 403 responses for violations

## Files Reference

- **Backend Middleware**: `backend/src/middleware/featureAccess.js`
- **Frontend Hook**: `frontend/src/hooks/useFeatureAccess.js`
- **Banner Component**: `frontend/src/components/FeatureRestrictionBanner.js`
- **API Service**: `frontend/src/services/api.js` (has `subscriptionAPI.getFeatures()`)
- **Documentation**: `FEATURE_ACCESS_GUIDE.md`
- **Example Component**: `frontend/src/components/FeatureGatingExample.js`

## Support

For questions about feature access control, check:
1. FEATURE_ACCESS_GUIDE.md - Complete system documentation
2. FeatureGatingExample.js - Working example implementation
3. useFeatureAccess.js - Hook implementation details
4. featureAccess.js - Backend middleware implementation
