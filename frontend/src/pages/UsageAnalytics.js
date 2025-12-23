import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiUserCheck, FiActivity, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import trackingService from '../services/trackingService';
import './UsageAnalytics.css';

const UsageAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, cohortAnalytics] = await Promise.all([
        trackingService.getAnalytics(dateRange.start, dateRange.end),
        trackingService.getCohortAnalytics(dateRange.start, dateRange.end)
      ]);

      setAnalytics(analyticsData);
      setCohortData(cohortAnalytics);
    } catch (error) {
      toast.error('Failed to load analytics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (icon, label, value, description) => (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-label">{label}</div>
        <div className="metric-value">{value}</div>
        {description && <div className="metric-description">{description}</div>}
      </div>
    </div>
  );

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usage-analytics">
      {/* Header */}
      <div className="analytics-header">
        <h1>Usage Analytics</h1>
        <p>Track user engagement and app usage metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <div className="filter-group">
          <label>
            <FiCalendar size={20} />
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>
            <FiCalendar size={20} />
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
        <button onClick={fetchAnalytics} className="btn-refresh" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart2 size={18} /> Overview
        </button>
        <button
          className={`tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          <FiActivity size={18} /> Feature Usage
        </button>
        <button
          className={`tab ${activeTab === 'cohort' ? 'active' : ''}`}
          onClick={() => setActiveTab('cohort')}
        >
          <FiUsers size={18} /> Cohort Analysis
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="analytics-content">
          <div className="metrics-grid">
            {renderMetricCard(
              <FiUsers size={28} className="text-blue-600" />,
              'Total Signups',
              analytics.signups || 0,
              'New users registered'
            )}
            {renderMetricCard(
              <FiUserCheck size={28} className="text-green-600" />,
              'Email Verified',
              analytics.emailVerified || 0,
              'Users who verified email'
            )}
            {renderMetricCard(
              <FiTrendingUp size={28} className="text-purple-600" />,
              'Active Users',
              analytics.activeUsers || 0,
              'Users who logged in'
            )}
            {renderMetricCard(
              <FiActivity size={28} className="text-orange-600" />,
              'Total Logins',
              analytics.logins || 0,
              'Total login events'
            )}
          </div>

          {/* Session Statistics */}
          <div className="stats-card">
            <h3>Session Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Average Session Duration</span>
                <span className="stat-value">
                  {analytics.sessionStats?.avgDuration
                    ? (analytics.sessionStats.avgDuration / 1000 / 60).toFixed(2)
                    : '0'}
                  {' min'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Session Duration</span>
                <span className="stat-value">
                  {analytics.sessionStats?.maxDuration
                    ? (analytics.sessionStats.maxDuration / 1000 / 60).toFixed(2)
                    : '0'}
                  {' min'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Min Session Duration</span>
                <span className="stat-value">
                  {analytics.sessionStats?.minDuration
                    ? (analytics.sessionStats.minDuration / 1000 / 60).toFixed(2)
                    : '0'}
                  {' min'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Usage Tab */}
      {activeTab === 'features' && analytics && (
        <div className="analytics-content">
          <div className="features-section">
            <h3>Feature Usage</h3>
            <div className="features-list">
              {Object.entries(analytics.featureUsage || {}).map(([feature, count]) => (
                <div key={feature} className="feature-item">
                  <div className="feature-name">{feature}</div>
                  <div className="feature-bar">
                    <div
                      className="feature-bar-fill"
                      style={{
                        width: `${Math.min(
                          (count / (Math.max(...Object.values(analytics.featureUsage || {})) || 1)) * 100,
                          100
                        )}%`
                      }}
                    ></div>
                  </div>
                  <div className="feature-count">{count}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="features-section">
            <h3>Most Popular Features</h3>
            <div className="popular-list">
              {Object.entries(analytics.popularFeatures || {})
                .slice(0, 10)
                .map(([feature, count]) => (
                  <div key={feature} className="popular-item">
                    <span className="popular-name">{feature}</span>
                    <span className="popular-badge">{count} events</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Cohort Analysis Tab */}
      {activeTab === 'cohort' && cohortData && (
        <div className="analytics-content">
          <div className="cohort-card">
            <h3>Cohort Analysis</h3>
            <div className="cohort-stats">
              <div className="cohort-stat">
                <div className="cohort-value">{cohortData.totalSignups}</div>
                <div className="cohort-label">Total Signups</div>
              </div>
              <div className="cohort-stat">
                <div className="cohort-value">{cohortData.activatedUsers}</div>
                <div className="cohort-label">Activated Users</div>
              </div>
              <div className="cohort-stat">
                <div className="cohort-value">{cohortData.activationRate}</div>
                <div className="cohort-label">Activation Rate</div>
              </div>
              <div className="cohort-stat">
                <div className="cohort-value">{cohortData.dealCreators}</div>
                <div className="cohort-label">Deal Creators</div>
              </div>
              <div className="cohort-stat">
                <div className="cohort-value">{cohortData.conversionRate}</div>
                <div className="cohort-label">Conversion Rate</div>
              </div>
            </div>
          </div>

          <div className="insights-card">
            <h3>Key Insights</h3>
            <ul className="insights-list">
              <li>
                {cohortData.activationRate === '0%'
                  ? 'No users have been activated yet'
                  : `${cohortData.activationRate} of new signups verify their email`}
              </li>
              <li>
                {cohortData.conversionRate === '0%'
                  ? 'No conversion activity yet'
                  : `${cohortData.conversionRate} of new users create deals`}
              </li>
              <li>
                Focus on improving email verification to increase activation rate
              </li>
              <li>
                Track deal creation as a key engagement metric
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageAnalytics;
