import React, { useState } from 'react';
import { FiCheckSquare, FiTrash2, FiEdit2, FiDownload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import './BulkActions.css';

const BulkActions = ({ selectedDealIds = [], onClear, deals = [], onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const stages = ['lead', 'prospect', 'proposal', 'negotiation', 'won', 'lost'];
  const teamMembers = []; // Would fetch from team context

  const handleBulkUpdate = async (updates) => {
    if (selectedDealIds.length === 0) {
      toast.error('No deals selected');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/deals/bulk/update', {
        dealIds: selectedDealIds,
        updates
      });
      toast.success(response.message);
      onRefresh?.();
      onClear?.();
    } catch (error) {
      toast.error('Failed to update deals');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selectedDealIds.length} deals? This cannot be undone.`)) {
      return;
    }

    handleBulkDeleteConfirmed();
  };

  const handleBulkDeleteConfirmed = async () => {
    try {
      setLoading(true);
      const response = await api.post('/deals/bulk/delete', {
        dealIds: selectedDealIds
      });
      toast.success(response.message);
      onRefresh?.();
      onClear?.();
    } catch (error) {
      toast.error('Failed to delete deals');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDeals = async () => {
    if (!selectedAssignee) {
      toast.error('Please select a team member');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/deals/bulk/assign', {
        dealIds: selectedDealIds,
        assignedTo: selectedAssignee
      });
      toast.success(response.message);
      setShowAssignModal(false);
      setSelectedAssignee('');
      onRefresh?.();
      onClear?.();
    } catch (error) {
      toast.error('Failed to assign deals');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStage = async () => {
    if (!selectedStage) {
      toast.error('Please select a stage');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/deals/bulk/stage', {
        dealIds: selectedDealIds,
        stage: selectedStage
      });
      toast.success(response.message);
      setShowStageModal(false);
      setSelectedStage('');
      onRefresh?.();
      onClear?.();
    } catch (error) {
      toast.error('Failed to update deal stages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTags = async () => {
    if (!tagsInput.trim()) {
      toast.error('Please enter at least one tag');
      return;
    }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    try {
      setLoading(true);
      const response = await api.post('/deals/bulk/tags', {
        dealIds: selectedDealIds,
        tags,
        action: 'add'
      });
      toast.success(response.message);
      setShowTagsModal(false);
      setTagsInput('');
      onRefresh?.();
      onClear?.();
    } catch (error) {
      toast.error('Failed to add tags');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/deals/bulk/export?dealIds=${selectedDealIds.join(',')}`);
      
      // Create and trigger download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deals-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Deals exported successfully');
    } catch (error) {
      toast.error('Failed to export deals');
    } finally {
      setLoading(false);
    }
  };

  if (selectedDealIds.length === 0) {
    return null;
  }

  return (
    <div className="bulk-actions-bar">
      <div className="bulk-info">
        <FiCheckSquare size={20} />
        <span>{selectedDealIds.length} deal{selectedDealIds.length !== 1 ? 's' : ''} selected</span>
      </div>

      <div className="bulk-actions">
        <button
          onClick={() => setShowStageModal(true)}
          disabled={loading}
          className="action-btn"
          title="Change stage"
        >
          <FiEdit2 />
          Change Stage
        </button>

        <button
          onClick={() => setShowAssignModal(true)}
          disabled={loading}
          className="action-btn"
          title="Assign deals"
        >
          <FiEdit2 />
          Assign To
        </button>

        <button
          onClick={() => setShowTagsModal(true)}
          disabled={loading}
          className="action-btn"
          title="Add tags"
        >
          <FiEdit2 />
          Add Tags
        </button>

        <button
          onClick={handleExport}
          disabled={loading}
          className="action-btn"
          title="Export to CSV"
        >
          <FiDownload />
          Export
        </button>

        <button
          onClick={handleBulkDelete}
          disabled={loading}
          className="action-btn delete"
          title="Delete deals"
        >
          <FiTrash2 />
          Delete
        </button>

        <button
          onClick={onClear}
          disabled={loading}
          className="action-btn cancel"
          title="Clear selection"
        >
          <FiX />
          Clear
        </button>
      </div>

      {/* Stage Modal */}
      {showStageModal && (
        <div className="modal-overlay" onClick={() => setShowStageModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Change Deal Stage</h3>
            <select
              value={selectedStage}
              onChange={e => setSelectedStage(e.target.value)}
              className="modal-select"
            >
              <option value="">Select a stage...</option>
              {stages.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowStageModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleChangeStage} disabled={loading} className="btn-primary">
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Assign Deals To</h3>
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="modal-select"
            >
              <option value="">Select a team member...</option>
              {teamMembers.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button onClick={() => setShowAssignModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleAssignDeals} disabled={loading} className="btn-primary">
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags Modal */}
      {showTagsModal && (
        <div className="modal-overlay" onClick={() => setShowTagsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add Tags</h3>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Enter tags separated by commas"
              className="modal-input"
            />
            <p className="modal-hint">Example: "urgent, follow-up, vip"</p>
            <div className="modal-actions">
              <button onClick={() => setShowTagsModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddTags} disabled={loading} className="btn-primary">
                {loading ? 'Adding...' : 'Add Tags'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
