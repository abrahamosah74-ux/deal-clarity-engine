import React, { useState } from 'react';
import { FiX, FiFilter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const FilterPanel = ({ isOpen, onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    clarityRange: [0, 100],
    dealValue: [0, 5000000],
    owner: '',
    status: 'all',
    sortBy: 'clarity'
  });

  const handleClarityChange = (e, index) => {
    const newRange = [...filters.clarityRange];
    newRange[index] = parseInt(e.target.value);
    setFilters({ ...filters, clarityRange: newRange });
  };

  const handleValueChange = (e, index) => {
    const newRange = [...filters.dealValue];
    newRange[index] = parseInt(e.target.value);
    setFilters({ ...filters, dealValue: newRange });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    toast.success('Filters applied successfully! ✨');
    onClose();
  };

  const handleReset = () => {
    setFilters({
      clarityRange: [0, 100],
      dealValue: [0, 5000000],
      owner: '',
      status: 'all',
      sortBy: 'clarity'
    });
    toast.success('Filters reset! 🔄');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <FiFilter size={24} />
            <h2 className="text-xl font-bold">Filter Options</h2>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition">
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Clarity Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🎯 Deal Clarity Range: {filters.clarityRange[0]}% - {filters.clarityRange[1]}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.clarityRange[0]}
                onChange={(e) => handleClarityChange(e, 0)}
                className="w-full accent-blue-600"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={filters.clarityRange[1]}
                onChange={(e) => handleClarityChange(e, 1)}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Deal Value */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              💰 Deal Value Range: ${(filters.dealValue[0] / 1000000).toFixed(1)}M - ${(filters.dealValue[1] / 1000000).toFixed(1)}M
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={filters.dealValue[0]}
                onChange={(e) => handleValueChange(e, 0)}
                className="w-full accent-green-600"
              />
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={filters.dealValue[1]}
                onChange={(e) => handleValueChange(e, 1)}
                className="w-full accent-green-600"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">📊 Deal Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold"
            >
              <option value="all">All Deals</option>
              <option value="active">Active Deals</option>
              <option value="low_clarity">Low Clarity</option>
              <option value="high_clarity">High Clarity</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Owner Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">👤 Sales Owner</label>
            <select
              value={filters.owner}
              onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold"
            >
              <option value="">All Team Members</option>
              <option value="sarah">Sarah Johnson</option>
              <option value="mike">Mike Davis</option>
              <option value="lisa">Lisa Chen</option>
              <option value="john">John Smith</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">🔄 Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-semibold"
            >
              <option value="clarity">Clarity (Low to High)</option>
              <option value="clarity_desc">Clarity (High to Low)</option>
              <option value="value">Deal Value (Low to High)</option>
              <option value="value_desc">Deal Value (High to Low)</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
          >
            🔄 Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition"
          >
            ✨ Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
