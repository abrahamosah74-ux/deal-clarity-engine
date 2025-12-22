// frontend/src/components/FeatureRestrictionBanner.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import './FeatureRestrictionBanner.css';

/**
 * Banner to show when user hits a feature limit or restriction
 */
const FeatureRestrictionBanner = ({
  feature,
  currentCount,
  limit,
  message,
  onDismiss
}) => {
  const navigate = useNavigate();

  if (!message) return null;

  return (
    <div className="feature-restriction-banner">
      <div className="banner-content">
        <div className="banner-icon">
          <FiLock size={20} />
        </div>
        <div className="banner-text">
          <h3>{message}</h3>
          {currentCount !== undefined && limit !== undefined && (
            <p className="banner-sub-text">
              You've used {currentCount} of {limit} {feature}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/subscriptions')}
          className="banner-action"
        >
          Upgrade Now
          <FiArrowRight size={16} className="ml-2" />
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="banner-close"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default FeatureRestrictionBanner;
