import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiMove, FiEdit2, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import './Kanban.css';

// Fallback Kanban without dnd-kit if not installed
const SimpleKanban = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stages] = useState(['discovery', 'demo', 'proposal', 'negotiation', 'won', 'lost']);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    stage: 'discovery',
    probability: 50,
    contact: { name: '', email: '' }
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await api.get('/deals');
      setDeals(response.deals || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setLoading(false);
    }
  };

  const handleUpdateStage = async (dealId, newStage) => {
    try {
      await api.put(`/crm/deals/${dealId}`, { stage: newStage });
      fetchDeals();
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/crm/deals', formData);
      setFormData({
        name: '',
        amount: '',
        stage: 'discovery',
        probability: 50,
        contact: { name: '', email: '' }
      });
      setShowForm(false);
      fetchDeals();
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal');
    }
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const stageColors = {
    discovery: 'bg-blue-50 border-blue-200',
    demo: 'bg-purple-50 border-purple-200',
    proposal: 'bg-yellow-50 border-yellow-200',
    negotiation: 'bg-orange-50 border-orange-200',
    won: 'bg-green-50 border-green-200',
    lost: 'bg-red-50 border-red-200'
  };

  const stageLabels = {
    discovery: '🔍 Discovery',
    demo: '📊 Demo',
    proposal: '📝 Proposal',
    negotiation: '🤝 Negotiation',
    won: '🏆 Won',
    lost: '❌ Lost'
  };

  if (loading) {
    return <div className="p-8 text-center">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlus /> New Deal
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Create New Deal</h2>
          <form onSubmit={handleCreateDeal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Deal Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Amount ($)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            />
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="p-2 border border-gray-300 rounded"
            >
              {stages.map(stage => (
                <option key={stage} value={stage} className="capitalize">{stageLabels[stage]}</option>
              ))}
            </select>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
              className="p-2"
            />
            <input
              type="text"
              placeholder="Contact Name"
              value={formData.contact.name}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, name: e.target.value } })}
              className="p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={formData.contact.email}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
              className="p-2 border border-gray-300 rounded"
            />
            <div className="flex gap-2 col-span-1 md:col-span-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage}
            className={`flex-shrink-0 w-80 lg:w-72 rounded-lg border-2 p-4 ${stageColors[stage]}`}
          >
            {/* Stage Header */}
            <div className="mb-4">
              <h3 className="font-bold text-lg">{stageLabels[stage]}</h3>
              <p className="text-sm text-gray-600">{getDealsByStage(stage).length} deals</p>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {getDealsByStage(stage).map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-move"
                  draggable
                  onDragStart={(e) => e.dataTransfer.effectAllowed = 'move'}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{deal.name}</h4>
                      {deal.contact && (
                        <p className="text-xs text-gray-600 mt-1">{deal.contact.name}</p>
                      )}
                      {deal.amount && (
                        <p className="text-sm font-bold text-blue-600 mt-2">${deal.amount.toLocaleString()}</p>
                      )}
                    </div>
                    <FiMove className="text-gray-400" size={16} />
                  </div>
                  <div className="flex gap-2 mt-3 text-xs">
                    <span className="bg-gray-200 px-2 py-1 rounded">{deal.probability}%</span>
                    {deal.clarityScore && (
                      <span className="bg-purple-200 px-2 py-1 rounded">Score: {deal.clarityScore}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 justify-end">
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <FiEye size={14} />
                    </button>
                    <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                      <FiEdit2 size={14} />
                    </button>
                  </div>

                  {/* Stage Selector */}
                  <select
                    value={stage}
                    onChange={(e) => handleUpdateStage(deal._id, e.target.value)}
                    className="w-full mt-2 text-xs p-1 border border-gray-300 rounded"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{stageLabels[s]}</option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Empty State */}
              {getDealsByStage(stage).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No deals yet</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stage Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-lg mb-4">Pipeline Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Total Deals</p>
            <p className="text-3xl font-bold">{deals.length}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Pipeline Value</p>
            <p className="text-3xl font-bold text-green-600">
              ${deals.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Won Deals</p>
            <p className="text-3xl font-bold text-blue-600">{deals.filter(d => d.stage === 'won').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleKanban;
