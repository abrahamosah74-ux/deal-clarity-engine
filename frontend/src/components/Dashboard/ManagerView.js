import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  FiUsers,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
  FiTarget,
  FiBarChart2,
  FiFilter,
  FiDownload,
  FiEye,
  FiMessageSquare,
  FiArrowUp,
  FiAlertCircle
} from 'react-icons/fi';
import api from '../../services/api';
import MessagePanel from './MessagePanel';
import MeetingScheduler from './MeetingScheduler';
import ViewAllDeals from './ViewAllDeals';
import ViewAnalytics from './ViewAnalytics';
import FilterPanel from './FilterPanel';

const ManagerView = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('week');
  const [showMessages, setShowMessages] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [showDeals, setShowDeals] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  useEffect(() => {
    fetchManagerData();
  }, [timeRange]);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    } catch (error) {
      console.error('Error loading manager data:', error);
      toast.error('Failed to load manager data');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dashboard data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleFilter = () => {
    setShowFilter(true);
  };

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
  };

  // Extended deals data with status
  const allDeals = [
    { id: 1, prospect: 'Acme Corp', owner: 'sarah', clarity: 42, valueNum: 150000, value: '$150K', nextStep: 'Follow-up call', status: 'active' },
    { id: 2, prospect: 'TechStart Inc', owner: 'mike', clarity: 38, valueNum: 95000, value: '$95K', nextStep: 'Send proposal', status: 'active' },
    { id: 3, prospect: 'Global Solutions', owner: 'lisa', clarity: 51, valueNum: 320000, value: '$320K', nextStep: 'Discovery meeting', status: 'active' },
    { id: 4, prospect: 'InnovateTech', owner: 'john', clarity: 65, valueNum: 500000, value: '$500K', nextStep: 'Proposal review', status: 'high_clarity' },
    { id: 5, prospect: 'StartupHub', owner: 'sarah', clarity: 28, valueNum: 50000, value: '$50K', nextStep: 'Initial contact', status: 'low_clarity' },
    { id: 6, prospect: 'CloudSync Co', owner: 'mike', clarity: 72, valueNum: 750000, value: '$750K', nextStep: 'Contract prep', status: 'high_clarity' },
  ];

  // Filter and sort deals
  const getFilteredDeals = () => {
    let filtered = [...allDeals];

    if (appliedFilters) {
      // Filter by clarity range
      filtered = filtered.filter(deal => 
        deal.clarity >= appliedFilters.clarityRange[0] && 
        deal.clarity <= appliedFilters.clarityRange[1]
      );

      // Filter by deal value
      filtered = filtered.filter(deal => 
        deal.valueNum >= appliedFilters.dealValue[0] && 
        deal.valueNum <= appliedFilters.dealValue[1]
      );

      // Filter by status
      if (appliedFilters.status !== 'all') {
        filtered = filtered.filter(deal => deal.status === appliedFilters.status);
      }

      // Filter by owner
      if (appliedFilters.owner) {
        filtered = filtered.filter(deal => deal.owner === appliedFilters.owner);
      }

      // Sort results
      if (appliedFilters.sortBy === 'clarity') {
        filtered.sort((a, b) => a.clarity - b.clarity);
      } else if (appliedFilters.sortBy === 'clarity_desc') {
        filtered.sort((a, b) => b.clarity - a.clarity);
      } else if (appliedFilters.sortBy === 'value') {
        filtered.sort((a, b) => a.valueNum - b.valueNum);
      } else if (appliedFilters.sortBy === 'value_desc') {
        filtered.sort((a, b) => b.valueNum - a.valueNum);
      } else if (appliedFilters.sortBy === 'recent') {
        filtered.sort((a, b) => b.id - a.id);
      }
    } else {
      // Default: show only low clarity deals, sorted by clarity (lowest first)
      filtered = filtered.filter(deal => deal.clarity < 60);
      filtered.sort((a, b) => a.clarity - b.clarity);
    }

    return filtered;
  };

  const lowClarityDeals = getFilteredDeals();

  const handleSendMessage = () => {
    setShowMessages(true);
  };

  const handleScheduleMeeting = () => {
    setShowMeetingScheduler(true);
  };

  const handleViewAllDeals = () => {
    setShowDeals(true);
  };

  const handleViewAnalytics = () => {
    setShowAnalytics(true);
  };

  const mockStats = [
    { title: 'Total Team Members', value: '12', change: 8, icon: FiUsers, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
    { title: 'Avg Clarity Score', value: '78%', change: 12, icon: FiTrendingUp, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' },
    { title: 'Pipeline Value', value: '$2.4M', change: -5, icon: FiTarget, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
    { title: 'Deals This Week', value: '18', change: 23, icon: FiBarChart2, color: 'from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-50' }
  ];

  const teamPerformance = [
    { name: 'Sarah Johnson', deals: 12, clarity: 82, trend: 'up' },
    { name: 'Mike Davis', deals: 9, clarity: 75, trend: 'up' },
    { name: 'Lisa Chen', deals: 11, clarity: 68, trend: 'down' },
    { name: 'John Smith', deals: 8, clarity: 71, trend: 'up' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <FilterPanel isOpen={showFilter} onClose={() => setShowFilter(false)} onApplyFilters={handleApplyFilters} />
      <MessagePanel isOpen={showMessages} onClose={() => setShowMessages(false)} />
      <MeetingScheduler isOpen={showMeetingScheduler} onClose={() => setShowMeetingScheduler(false)} />
      <ViewAllDeals isOpen={showDeals} onClose={() => setShowDeals(false)} />
      <ViewAnalytics isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            📊 Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Team performance and deal clarity insights</p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-8 items-center flex-wrap">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white font-semibold"
          >
            <option value="day">📅 Today</option>
            <option value="week">📆 This Week</option>
            <option value="month">📊 This Month</option>
            <option value="quarter">📈 This Quarter</option>
          </select>
          <button onClick={handleExport} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 flex items-center gap-2 transition-all">
            <FiDownload size={18} />
            Export
          </button>
          <button onClick={handleFilter} className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-blue-300 flex items-center gap-2 transition-all">
            <FiFilter size={18} />
            Filter
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-gradient-to-br ${stat.bgColor} border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-200`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white`}>
                    <Icon size={24} />
                  </div>
                  {stat.change !== undefined && (
                    <div className={`flex items-center gap-1 font-bold text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <FiArrowUp size={14} style={{ transform: stat.change < 0 ? 'rotate(180deg)' : 'none' }} />
                      {Math.abs(stat.change)}%
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Low Clarity Deals */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiAlertCircle className="text-red-500" size={28} />
                {appliedFilters ? '🔍 Filtered Deals' : '⚠️ Low Clarity Deals'}
              </h2>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${appliedFilters ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                {appliedFilters ? `✨ ${lowClarityDeals.length} results` : `⚠️ ${lowClarityDeals.length} deals`}
              </span>
            </div>
            {lowClarityDeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg font-semibold">🎉 No deals match your filters!</p>
                <button 
                  onClick={() => setShowFilter(true)}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition"
                >
                  Adjust Filters
                </button>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Prospect</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Owner</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Clarity</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Value</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Next Step</th>
                  </tr>
                </thead>
                <tbody>
                  {lowClarityDeals.map((deal) => {
                    const ownerNames = { 'sarah': 'Sarah Johnson', 'mike': 'Mike Davis', 'lisa': 'Lisa Chen', 'john': 'John Smith' };
                    return (
                      <tr key={deal.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-gray-900">{deal.prospect}</td>
                        <td className="py-4 px-4 text-gray-600">{ownerNames[deal.owner] || deal.owner}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${deal.clarity}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-red-600">{deal.clarity}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-green-600">{deal.value}</td>
                        <td className="py-4 px-4 text-sm bg-blue-100 text-blue-800 rounded-lg px-3 py-1 inline-block">{deal.nextStep}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiUsers className="text-blue-600" size={28} />
              Team Performance
            </h2>
            <div className="space-y-4">
              {teamPerformance.map((member, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{member.name}</h3>
                    <span className={`text-sm font-bold ${member.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {member.trend === 'up' ? '📈' : '📉'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deals:</span>
                      <span className="font-bold text-gray-900">{member.deals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Clarity:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${member.clarity}%` }}></div>
                        </div>
                        <span className="font-bold text-blue-600 text-xs">{member.clarity}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={handleSendMessage} className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center gap-2 transition-all">
              <FiMessageSquare size={20} />
              Send Message
            </button>
            <button onClick={handleScheduleMeeting} className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center gap-2 transition-all">
              <FiCalendar size={20} />
              Schedule Meeting
            </button>
            <button onClick={handleViewAllDeals} className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center gap-2 transition-all">
              <FiEye size={20} />
              View All Deals
            </button>
            <button onClick={handleViewAnalytics} className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center gap-2 transition-all">
              <FiActivity size={20} />
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerView;
