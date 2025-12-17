import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiBarChart2, FiTrendingUp, FiTarget, FiAward, FiUsers, FiCheckCircle } from 'react-icons/fi';

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [topDeals, setTopDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [summaryRes, forecastRes, dealsRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/forecast'),
        api.get('/analytics/top-deals')
      ]);

      setSummary(summaryRes.data);
      setForecast(forecastRes.data);
      setTopDeals(dealsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!summary) {
    return <div className="p-8 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Track your sales performance and insights</p>
      </div>

      {/* Deals Summary */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiBarChart2 /> Sales Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Deals</p>
                <p className="text-3xl font-bold text-gray-900">{summary.deals.total}</p>
              </div>
              <FiTarget className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  GH₵{summary.deals.revenue?.toLocaleString()}
                </p>
              </div>
              <FiTrendingUp className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-purple-600">{summary.deals.winRate}%</p>
              </div>
              <FiAward className="text-purple-600" size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Deal Size</p>
                <p className="text-3xl font-bold text-orange-600">
                  GH₵{summary.deals.avgDealSize?.toLocaleString()}
                </p>
              </div>
              <FiCheckCircle className="text-orange-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Summary */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiUsers /> Contacts Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Contacts</p>
            <p className="text-3xl font-bold text-blue-600">{summary.contacts.total}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Avg Lead Score</p>
            <p className="text-3xl font-bold text-green-600">{summary.contacts.avgLeadScore}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">High Priority Leads</p>
            <p className="text-3xl font-bold text-red-600">{summary.contacts.highPriority}</p>
          </div>
        </div>
      </div>

      {/* Sales Forecast */}
      {forecast && forecast.totalForecast > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Forecast</h2>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-4">By Stage:</p>
            <div className="space-y-3">
              {forecast.byStage && forecast.byStage.map((stage, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold capitalize">{stage._id}</p>
                    <div className="bg-gray-200 h-2 rounded mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{ width: `${(stage.weightedAmount / forecast.totalForecast) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold">GH₵{stage.weightedAmount?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{stage.count} deals</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <p className="text-gray-600">Total Forecast (Weighted):</p>
              <p className="text-4xl font-bold text-green-600">
                GH₵{forecast.totalForecast?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Deals */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Deals</h2>
        <div className="space-y-2">
          {topDeals.map((deal) => (
            <div key={deal._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{deal.name}</p>
                  {deal.contact && (
                    <p className="text-sm text-gray-600">{deal.contact.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">GH₵{deal.amount?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 capitalize">{deal.stage}</p>
                  <div className="mt-1 flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {deal.probability}%
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Score: {deal.clarityScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Performance */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Task Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Tasks</p>
            <p className="text-3xl font-bold">{summary.tasks.total}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-600">{summary.tasks.completed}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold text-blue-600">{summary.tasks.completionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
