import React, { useState } from 'react';
import { FiX, FiEye, FiSearch, FiDollarSign, FiTrendingUp } from 'react-icons/fi';

const ViewAllDeals = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const mockDeals = [
    { id: 1, prospect: 'Acme Corp', owner: 'Sarah Johnson', value: '$150K', status: 'negotiating', clarity: 42 },
    { id: 2, prospect: 'TechStart Inc', owner: 'Mike Davis', value: '$95K', status: 'qualified', clarity: 38 },
    { id: 3, prospect: 'Global Solutions', owner: 'Lisa Chen', value: '$320K', status: 'advanced', clarity: 51 },
    { id: 4, prospect: 'NextGen Systems', owner: 'John Smith', value: '$220K', status: 'negotiating', clarity: 68 },
    { id: 5, prospect: 'CloudFirst Ltd', owner: 'Sarah Johnson', value: '$180K', status: 'qualified', clarity: 55 },
    { id: 6, prospect: 'DataCore Analytics', owner: 'Mike Davis', value: '$280K', status: 'advanced', clarity: 72 },
    { id: 7, prospect: 'Innovation Hub', owner: 'Lisa Chen', value: '$145K', status: 'early', clarity: 25 },
    { id: 8, prospect: 'Enterprise Solutions', owner: 'John Smith', value: '$425K', status: 'advanced', clarity: 85 }
  ];

  const filteredDeals = mockDeals.filter(deal => {
    const matchesSearch = deal.prospect.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || deal.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      early: 'bg-red-100 text-red-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-blue-100 text-blue-800',
      advanced: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getClarityColor = (clarity) => {
    if (clarity >= 70) return 'text-green-600';
    if (clarity >= 50) return 'text-blue-600';
    if (clarity >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  const totalValue = filteredDeals.reduce((sum, deal) => {
    const value = parseInt(deal.value.replace(/[$,K]/g, '')) * 1000;
    return sum + value;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FiEye size={24} />
            All Deals ({filteredDeals.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Deals</p>
              <p className="text-2xl font-bold text-blue-600">{filteredDeals.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">${(totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Avg Clarity</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(filteredDeals.reduce((sum, d) => sum + d.clarity, 0) / filteredDeals.length || 0)}%
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by prospect or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="early">Early</option>
              <option value="qualified">Qualified</option>
              <option value="negotiating">Negotiating</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Deals Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Prospect</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Clarity</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{deal.prospect}</td>
                    <td className="py-3 px-4 text-gray-600">{deal.owner}</td>
                    <td className="py-3 px-4 font-medium text-gray-900 flex items-center gap-1">
                      <FiDollarSign size={16} className="text-green-600" />
                      {deal.value}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FiTrendingUp size={16} className={getClarityColor(deal.clarity)} />
                        <span className={`font-semibold ${getClarityColor(deal.clarity)}`}>{deal.clarity}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDeals.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No deals found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAllDeals;
