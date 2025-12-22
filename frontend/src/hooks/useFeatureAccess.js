// frontend/src/hooks/useFeatureAccess.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI } from '../services/api';

/**
 * Custom hook to check feature access based on user's subscription plan
 */
export const useFeatureAccess = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const response = await subscriptionAPI.getFeatures();
        setFeatures(response.data);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to fetch features:', err);
        setError(err.message);
        // Default to free plan features if fetch fails
        setFeatures({
          plan: 'free',
          status: 'inactive',
          isActive: false,
          features: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [user]);

  /**
   * Check if a specific feature is available
   * @param {string} feature - Feature path (e.g., 'analytics.advanced')
   * @param {string} action - Optional action (e.g., 'delete')
   * @returns {boolean} Whether the feature is available
   */
  const hasFeature = (feature, action = null) => {
    if (!features) return false;

    const featurePath = feature.split('.');
    let current = features.features;

    for (const key of featurePath) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return false;
      }
    }

    // If action specified, check if it's allowed
    if (action && typeof current === 'object') {
      return current[action] === true;
    }

    return current === true;
  };

  /**
   * Check if user is on a specific plan
   * @param {string} plan - Plan name ('free', 'pro', 'enterprise')
   * @returns {boolean}
   */
  const isPlan = (plan) => {
    return features?.plan === plan;
  };

  /**
   * Check if user has an active subscription
   * @returns {boolean}
   */
  const isActive = () => {
    return features?.isActive === true;
  };

  /**
   * Get the current plan
   * @returns {string} Plan name
   */
  const getPlan = () => {
    return features?.plan || 'free';
  };

  /**
   * Get feature limits for current plan
   * @param {string} feature - Feature name (e.g., 'deals', 'contacts')
   * @returns {object|null}
   */
  const getFeatureLimits = (feature) => {
    if (!features?.features[feature]) return null;
    return features.features[feature];
  };

  return {
    features,
    loading,
    error,
    hasFeature,
    isPlan,
    isActive,
    getPlan,
    getFeatureLimits,
    plan: features?.plan || 'free'
  };
};

export default useFeatureAccess;
