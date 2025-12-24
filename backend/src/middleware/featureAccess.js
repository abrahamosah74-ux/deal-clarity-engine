// backend/src/middleware/featureAccess.js
/**
 * Feature access control middleware
 * Enforces feature access based on subscription plan
 */

// Define feature access by plan
const featureAccessMap = {
  free: {
    // Free plan features
    deals: {
      maxDeals: 5,
      create: true,
      view: true,
      edit: true,
      delete: false,
      export: false
    },
    contacts: {
      maxContacts: 20,
      create: true,
      view: true,
      edit: true,
      delete: false,
      import: false
    },
    commitments: {
      create: true,
      view: true,
      edit: true,
      delete: false,
      tracking: true,
      autoSync: false
    },
    calendar: {
      enabled: false
    },
    analytics: {
      basic: true,
      advanced: false,
      forecasting: false,
      reporting: false
    },
    team: {
      maxMembers: 1,
      create: false,
      manage: false
    },
    integrations: {
      crm: false,
      calendar: true,
      email: false
    },
    automations: false,
    bulkOperations: false,
    customReports: false,
    api: false
  },
  pro: {
    // Pro plan features
    deals: {
      maxDeals: null, // unlimited
      create: true,
      view: true,
      edit: true,
      delete: true,
      export: true
    },
    contacts: {
      maxContacts: null, // unlimited
      create: true,
      view: true,
      edit: true,
      delete: true,
      import: true
    },
    commitments: {
      create: true,
      view: true,
      edit: true,
      delete: true,
      tracking: true,
      autoSync: true
    },
    calendar: {
      enabled: true
    },
    analytics: {
      basic: true,
      advanced: true,
      forecasting: true,
      reporting: true
    },
    team: {
      maxMembers: 10,
      create: true,
      manage: true
    },
    integrations: {
      crm: true,
      calendar: true,
      email: true
    },
    automations: true,
    bulkOperations: true,
    customReports: true,
    api: true
  },
  enterprise: {
    // Enterprise plan features (all features)
    deals: {
      maxDeals: null,
      create: true,
      view: true,
      edit: true,
      delete: true,
      export: true
    },
    contacts: {
      maxContacts: null,
      create: true,
      view: true,
      edit: true,
      delete: true,
      import: true
    },
    commitments: {
      create: true,
      view: true,
      edit: true,
      delete: true,
      tracking: true,
      autoSync: true
    },
    calendar: {
      enabled: true
    },
    analytics: {
      basic: true,
      advanced: true,
      forecasting: true,
      reporting: true
    },
    team: {
      maxMembers: null, // unlimited
      create: true,
      manage: true
    },
    integrations: {
      crm: true,
      calendar: true,
      email: true
    },
    automations: true,
    bulkOperations: true,
    customReports: true,
    api: true
  }
};

/**
 * Middleware to check if user has access to a feature
 * @param {string} feature - Feature name (e.g., 'analytics.advanced')
 * @param {string} action - Action type (e.g., 'create', 'delete')
 */
const checkFeatureAccess = (feature, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get user's plan (default to 'free')
      const userPlan = req.user.subscription?.plan || 'free';
      const planFeatures = featureAccessMap[userPlan];

      if (!planFeatures) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      // Navigate nested feature path (e.g., 'analytics.advanced')
      const featurePath = feature.split('.');
      let hasAccess = planFeatures;

      for (const key of featurePath) {
        if (hasAccess && typeof hasAccess === 'object') {
          hasAccess = hasAccess[key];
        } else {
          return res.status(403).json({
            error: 'Feature not available in your plan',
            feature,
            plan: userPlan,
            message: `Upgrade to a higher plan to access ${feature}`
          });
        }
      }

      // Check if the specific action is allowed
      if (action) {
        if (typeof hasAccess === 'object' && hasAccess[action] !== undefined) {
          if (!hasAccess[action]) {
            return res.status(403).json({
              error: `Action '${action}' not available in your plan`,
              feature,
              action,
              plan: userPlan,
              message: `Upgrade to a higher plan to ${action} ${feature}`
            });
          }
        } else if (hasAccess !== true) {
          return res.status(403).json({
            error: 'Feature not available in your plan',
            feature,
            plan: userPlan,
            message: `Upgrade to a higher plan to access ${feature}`
          });
        }
      } else {
        // If no action specified, just check if feature is enabled
        if (!hasAccess && hasAccess !== true) {
          return res.status(403).json({
            error: 'Feature not available in your plan',
            feature,
            plan: userPlan,
            message: `Upgrade to a higher plan to access ${feature}`
          });
        }
      }

      // Store user's feature access level in request for later use
      req.userPlan = userPlan;
      req.planFeatures = planFeatures;
      next();
    } catch (error) {
      console.error('❌ Feature access check error:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
};

/**
 * Check if user can create more deals
 */
const checkDealLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPlan = req.user.subscription?.plan || 'free';
    const planFeatures = featureAccessMap[userPlan];

    // If user doesn't have create access for deals
    if (!planFeatures.deals.create) {
      return res.status(403).json({
        error: 'You cannot create deals in your current plan',
        plan: userPlan,
        message: 'Upgrade to Pro to create unlimited deals'
      });
    }

    // Check deal limit
    const maxDeals = planFeatures.deals.maxDeals;
    if (maxDeals !== null) {
      const Deal = require('../models/Deal');
      const dealCount = await Deal.countDocuments({
        userId: req.user.id,
        team: req.user.currentTeam
      });

      if (dealCount >= maxDeals) {
        return res.status(403).json({
          error: `You've reached the maximum number of deals (${maxDeals}) for your plan`,
          plan: userPlan,
          currentCount: dealCount,
          limit: maxDeals,
          message: `Upgrade to Pro for unlimited deals`
        });
      }
    }

    next();
  } catch (error) {
    console.error('❌ Deal limit check error:', error);
    res.status(500).json({ error: 'Failed to check deal limit' });
  }
};

/**
 * Check if user can create more contacts
 */
const checkContactLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPlan = req.user.subscription?.plan || 'free';
    const planFeatures = featureAccessMap[userPlan];

    // If user doesn't have create access for contacts
    if (!planFeatures.contacts.create) {
      return res.status(403).json({
        error: 'You cannot create contacts in your current plan',
        plan: userPlan,
        message: 'Upgrade to Pro to create unlimited contacts'
      });
    }

    // Check contact limit
    const maxContacts = planFeatures.contacts.maxContacts;
    if (maxContacts !== null) {
      const Contact = require('../models/Contact');
      const contactCount = await Contact.countDocuments({
        userId: req.user.id,
        team: req.user.currentTeam
      });

      if (contactCount >= maxContacts) {
        return res.status(403).json({
          error: `You've reached the maximum number of contacts (${maxContacts}) for your plan`,
          plan: userPlan,
          currentCount: contactCount,
          limit: maxContacts,
          message: `Upgrade to Pro for unlimited contacts`
        });
      }
    }

    next();
  } catch (error) {
    console.error('❌ Contact limit check error:', error);
    res.status(500).json({ error: 'Failed to check contact limit' });
  }
};

/**
 * Get user's available features
 */
const getUserFeatures = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPlan = req.user.subscription?.plan || 'free';
    const planFeatures = featureAccessMap[userPlan];

    res.json({
      plan: userPlan,
      status: req.user.subscription?.status || 'inactive',
      features: planFeatures,
      isActive: req.user.subscription?.status === 'active'
    });
  } catch (error) {
    console.error('❌ Get features error:', error);
    res.status(500).json({ error: 'Failed to get features' });
  }
};

module.exports = {
  checkFeatureAccess,
  checkDealLimit,
  checkContactLimit,
  getUserFeatures,
  featureAccessMap
};
