import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiTarget, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import './Forecasting.css';

const Forecasting = () => {
  const [forecast, setForecast] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [forecastRes, metricsRes] = await Promise.all([
        api.get('/forecasting/pipeline'),
        api.get('/forecasting/accuracy')
      ]);
      setForecast(forecastRes.forecast);
      setMetrics(metricsRes.metrics);
    } catch (error) {
      console.error('Failed to fetch forecasting data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading forecast...</div>;
  if (!forecast || !metrics) return <div className="error">Failed to load data</div>;

  return (
    <div className="forecasting-page">
      <div className="page-header">
        <h1>📊 Pipeline Forecast</h1>
        <p>Revenue forecast based on deal probability and stage</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon primary">
            <FiBarChart2 />
          </div>
          <div className="metric-content">
            <p className="metric-label">Total Forecast</p>
            <p className="metric-value">${(forecast.totalForecast || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon success">
            <FiTrendingUp />
          </div>
          <div className="metric-content">
            <p className="metric-label">Win Rate</p>
            <p className="metric-value">{metrics.winRate}%</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon info">
            <FiTarget />
          </div>
          <div className="metric-content">
            <p className="metric-label">Avg Deal Size</p>
            <p className="metric-value">${parseFloat(metrics.avgDealSize || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon warning">
            <FiAlertCircle />
          </div>
          <div className="metric-content">
            <p className="metric-label">Risk Deals</p>
            <p className="metric-value">{forecast.riskDeals?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="forecast-sections">
        <div className="forecast-section">
          <h2>By Stage</h2>
          <div className="stage-list">
            {Object.entries(forecast.byStage || {}).map(([stage, data]) => (
              <div key={stage} className="stage-item">
                <div className="stage-name">{stage.charAt(0).toUpperCase() + stage.slice(1)}</div>
                <div className="stage-bar">
                  <div className="stage-fill" style={{ width: `${(data.value / forecast.totalForecast) * 100}%` }}></div>
                </div>
                <div className="stage-stats">
                  <span>${(data.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  <span>{data.count} deals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="forecast-section">
          <h2>Top Opportunities</h2>
          <div className="opportunities-list">
            {forecast.topOpportunities?.map(opp => (
              <div key={opp._id} className="opportunity-item">
                <div className="opportunity-info">
                  <h4>{opp.dealName}</h4>
                  <p>${(opp.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} • {opp.probability}% probability</p>
                </div>
                <div className="opportunity-value">
                  ${(opp.weightedValue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {forecast.riskDeals?.length > 0 && (
          <div className="forecast-section risk">
            <h2>⚠️ High Risk Deals</h2>
            <div className="risk-list">
              {forecast.riskDeals.map(deal => (
                <div key={deal._id} className="risk-item">
                  <div className="risk-info">
                    <h4>{deal.dealName}</h4>
                    <p>${(deal.value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} • {deal.probability}% probability</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecasting;
