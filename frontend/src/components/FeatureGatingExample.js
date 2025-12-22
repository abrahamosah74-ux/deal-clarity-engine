// frontend/src/components/FeatureGatingExample.js
/**
 * Example component showing how to implement feature gating
 * This demonstrates the usage patterns for the feature access system
 */

import React, { useState } from 'react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import FeatureRestrictionBanner from './FeatureRestrictionBanner';

const FeatureGatingExample = () => {
  const navigate = useNavigate();
  const { hasFeature, isPlan, isActive, getPlan, getFeatureLimits } = useFeatureAccess();
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Handle creating a deal (with limit checking)
  const handleCreateDeal = async () => {
    // First check if feature is available
    if (!hasFeature('deals', 'create')) {
      setBannerMessage('Upgrade to Pro to create unlimited deals');
      setShowUpgradeBanner(true);
      return;
    }

    // Then try to create
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Deal' })
      });

      if (response.status === 403) {
        const error = await response.json();
        setBannerMessage(error.message);
        setShowUpgradeBanner(true);
      } else if (response.ok) {
        // Success
        alert('Deal created!');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const handleDeleteDeal = (dealId) => {
    // Check if user has delete permission
    if (!hasFeature('deals', 'delete')) {
      setBannerMessage('Upgrade to Pro to delete deals');
      setShowUpgradeBanner(true);
      return;
    }

    // Proceed with deletion
    console.log('Deleting deal:', dealId);
  };

  // Example: Show/hide entire feature section
  const canAccessAdvancedAnalytics = hasFeature('analytics.advanced');

  // Example: Get feature limits
  const dealLimits = getFeatureLimits('deals');
  const contactLimits = getFeatureLimits('contacts');

  return (
    <div className="feature-gating-example">
      <h1>Feature Access Examples</h1>

      {/* Current Plan Info */}
      <div className="plan-info-section">
        <h2>Your Current Plan</h2>
        <div className="plan-card">
          <p>
            <strong>Plan:</strong> {getPlan().toUpperCase()}
          </p>
          <p>
            <strong>Status:</strong> {isActive() ? '✅ Active' : '❌ Inactive'}
          </p>
          <p>
            <strong>Max Deals:</strong>{' '}
            {dealLimits?.maxDeals === null ? '∞ Unlimited' : dealLimits?.maxDeals || 0}
          </p>
          <p>
            <strong>Max Contacts:</strong>{' '}
            {contactLimits?.maxContacts === null ? '∞ Unlimited' : contactLimits?.maxContacts || 0}
          </p>
        </div>
      </div>

      {/* Feature Restriction Banner */}
      {showUpgradeBanner && (
        <FeatureRestrictionBanner
          feature="Premium Feature"
          message={bannerMessage}
          onDismiss={() => setShowUpgradeBanner(false)}
        />
      )}

      {/* Example 1: Conditional Features */}
      <section className="feature-section">
        <h2>Advanced Analytics</h2>
        {canAccessAdvancedAnalytics ? (
          <div className="feature-available">
            <FiCheckCircle size={20} /> Advanced analytics is available
            <button onClick={() => navigate('/analytics/advanced')}>
              View Advanced Analytics
            </button>
          </div>
        ) : (
          <div className="feature-locked">
            <FiLock size={20} /> Advanced analytics is only available in Pro plan
            <button onClick={() => navigate('/subscriptions')}>Upgrade to Pro</button>
          </div>
        )}
      </section>

      {/* Example 2: Disabled Actions */}
      <section className="feature-section">
        <h2>Deal Management</h2>
        <div className="action-buttons">
          <button
            onClick={handleCreateDeal}
            className={`action-btn ${!hasFeature('deals', 'create') ? 'disabled' : ''}`}
            disabled={!hasFeature('deals', 'create')}
          >
            {hasFeature('deals', 'create') ? '✓' : '🔒'} Create Deal
          </button>

          <button
            onClick={() => handleDeleteDeal('123')}
            className={`action-btn delete ${!hasFeature('deals', 'delete') ? 'disabled' : ''}`}
            disabled={!hasFeature('deals', 'delete')}
            title={
              !hasFeature('deals', 'delete')
                ? 'Upgrade to Pro to delete deals'
                : ''
            }
          >
            {hasFeature('deals', 'delete') ? '✓' : '🔒'} Delete Deal
          </button>

          <button
            disabled={!hasFeature('deals', 'export')}
            className={`action-btn ${!hasFeature('deals', 'export') ? 'disabled' : ''}`}
            title={
              !hasFeature('deals', 'export')
                ? 'Upgrade to Pro to export deals'
                : ''
            }
          >
            {hasFeature('deals', 'export') ? '✓' : '🔒'} Export Deals
          </button>
        </div>
      </section>

      {/* Example 3: Plan Comparison */}
      <section className="feature-section">
        <h2>Plan Features Comparison</h2>
        <table className="feature-table">
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
              <td>Export Data</td>
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
            <tr>
              <td>Forecasting</td>
              <td>❌</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>CRM Integration</td>
              <td>❌</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Calendar Sync</td>
              <td>❌</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Automations</td>
              <td>❌</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Team Members</td>
              <td>1</td>
              <td>Up to 10</td>
              <td>Unlimited</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Upgrade CTA */}
      {!isPlan('pro') && !isPlan('enterprise') && (
        <div className="upgrade-cta">
          <FiAlertCircle size={24} />
          <div>
            <h3>Unlock All Features</h3>
            <p>Upgrade to Pro for unlimited deals, advanced analytics, and more.</p>
          </div>
          <button onClick={() => navigate('/subscriptions')} className="primary">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default FeatureGatingExample;
