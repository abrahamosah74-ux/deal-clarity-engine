import React, { useState } from 'react';
import { FiX, FiBarChart2, FiTrendingUp, FiUsers, FiTarget, FiCalendar } from 'react-icons/fi';

const ViewAnalytics = ({ isOpen, onClose }) => {
  const [timeRange, setTimeRange] = useState('month');

  const analyticsData = {
    week: {
      revenue: '$125K',
      deals: 8,
      winRate: 65,
      avgDealSize: '$15.6K',
      topPerformer: 'Sarah Johnson'
    },
    month: {
      revenue: '$520K',
      deals: 34,
      winRate: 62,
      avgDealSize: '$15.3K',
      topPerformer: 'Sarah Johnson'
    },
    quarter: {
      revenue: '$1.58M',
      deals: 102,
      winRate: 61,
      avgDealSize: '$15.5K',
      topPerformer: 'Lisa Chen'
    }
  };

  const data = analyticsData[timeRange];

  const teamPerformance = [
    { name: 'Sarah Johnson', deals: 12, revenue: '$185K', winRate: 75 },
    { name: 'Mike Davis', deals: 9, revenue: '$142K', winRate: 67 },
    { name: 'Lisa Chen', deals: 11, revenue: '$168K', winRate: 64 },
    { name: 'John Smith', dogs: 8, revenue: '$125K', winRate: 58 }
  ];

  const pipelineStages = [
    { stage: 'Early', count: 24, value: '$380K', percentage: 24 },
    { stage: 'Qualified', count: 18, value: '$285K', percentage: 18 },
    { stage: 'Negotiating', count: 31, value: '$510K', percentage: 32 },
    { stage: 'Advanced', count: 29, value: '$405K', percentage: 26 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiBarChart2 size={24} />
            Analytics Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['week', 'month', 'quarter'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Revenue</p>
              <p className="text-2xl font-bold text-blue-600">{data.revenue}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Deals</p>
              <p className="text-2xl font-bold text-green-600">{data.deals}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-purple-600">{data.winRate}%</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Avg Deal Size</p>
              <p className="text-2xl font-bold text-orange-600">{data.avgDealSize}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600 mb-1">Top Performer</p>
              <p className="text-lg font-bold text-red-600 line-clamp-1">{data.topPerformer}</p>
            </div>
          </div>

          {/* Team Performance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers size={20} />
              Team Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamPerformance.map((member, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{member.deals} deals</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-medium text-green-600">{member.revenue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Win Rate:</span>
                      <span className="font-medium text-blue-600">{member.winRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Stages */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTarget size={20} />
              Pipeline Breakdown
            </h3>
            <div className="space-y-4">
              {pipelineStages.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{item.stage}</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.value}</p>
                      <p className="text-sm text-gray-500">{item.count} deals</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        idx === 0 ? 'bg-red-500' :
                        idx === 1 ? 'bg-yellow-500' :
                        idx === 2 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <p>Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAnalytics;
