// frontend/src/components/Automation/WorkflowBuilder.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { api } from '../../services/api';
import TriggerSelector from './TriggerSelector';
import ConditionBuilder from './ConditionBuilder';
import ActionBuilder from './ActionBuilder';
import './WorkflowBuilder.css';

const WorkflowBuilder = ({ teamId, workflowId = null, onClose, onSave }) => {
  const [workflow, setWorkflow] = useState({
    name: '',
    description: '',
    enabled: true,
    trigger: null,
    conditions: [],
    actions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTriggers, setAvailableTriggers] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);

  useEffect(() => {
    fetchAvailableTriggers();
    fetchAvailableActions();
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const response = await api.get(`/automations/${workflowId}`);
      setWorkflow(response.data.workflow);
    } catch (err) {
      setError('Failed to load workflow');
      console.error(err);
    }
  };

  const fetchAvailableTriggers = async () => {
    try {
      const response = await api.get('/automations/available/triggers');
      setAvailableTriggers(response.data.triggers);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableActions = async () => {
    try {
      const response = await api.get('/automations/available/actions');
      setAvailableActions(response.data.actions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!workflow.name.trim()) {
      setError('Workflow name is required');
      return;
    }

    if (!workflow.trigger) {
      setError('Please select a trigger');
      return;
    }

    if (workflow.actions.length === 0) {
      setError('Please add at least one action');
      return;
    }

    try {
      setLoading(true);
      const data = { ...workflow, team: teamId };

      if (workflowId) {
        await api.put(`/automations/${workflowId}`, data);
      } else {
        await api.post('/automations', data);
      }

      if (onSave) onSave();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCondition = () => {
    setWorkflow(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: '', operator: 'equals', value: '' }]
    }));
  };

  const handleUpdateCondition = (index, condition) => {
    const updated = [...workflow.conditions];
    updated[index] = condition;
    setWorkflow(prev => ({ ...prev, conditions: updated }));
  };

  const handleRemoveCondition = (index) => {
    setWorkflow(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const handleAddAction = () => {
    setWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, { type: '', config: {} }]
    }));
  };

  const handleUpdateAction = (index, action) => {
    const updated = [...workflow.actions];
    updated[index] = action;
    setWorkflow(prev => ({ ...prev, actions: updated }));
  };

  const handleRemoveAction = (index) => {
    setWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="workflow-builder">
      <div className="builder-header">
        <h2>{workflowId ? 'Edit Workflow' : 'Create New Workflow'}</h2>
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
      </div>

      <div className="builder-content">
        {/* Basic Info */}
        <div className="builder-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="name">Workflow Name *</label>
            <input
              type="text"
              id="name"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
              placeholder="e.g., Auto-advance qualified deals"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={workflow.description}
              onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
              placeholder="What does this workflow do?"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={workflow.enabled}
                onChange={(e) => setWorkflow({ ...workflow, enabled: e.target.checked })}
              />
              <span>Enabled</span>
            </label>
          </div>
        </div>

        {/* Trigger */}
        <div className="builder-section">
          <h3>When</h3>
          <TriggerSelector
            selected={workflow.trigger}
            availableTriggers={availableTriggers}
            onChange={(trigger) => setWorkflow({ ...workflow, trigger })}
          />
        </div>

        {/* Conditions */}
        <div className="builder-section">
          <h3>But Only If</h3>
          <div className="conditions-list">
            {workflow.conditions.map((condition, index) => (
              <div key={index} className="condition-item">
                <ConditionBuilder
                  condition={condition}
                  onChange={(updated) => handleUpdateCondition(index, updated)}
                />
                <button
                  className="btn-remove-condition"
                  onClick={() => handleRemoveCondition(index)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <button
            className="btn-add-condition"
            onClick={handleAddCondition}
          >
            <FiPlus /> Add Condition
          </button>
        </div>

        {/* Actions */}
        <div className="builder-section">
          <h3>Then</h3>
          <div className="actions-list">
            {workflow.actions.map((action, index) => (
              <div key={index} className="action-item">
                <ActionBuilder
                  action={action}
                  availableActions={availableActions}
                  onChange={(updated) => handleUpdateAction(index, updated)}
                />
                <button
                  className="btn-remove-action"
                  onClick={() => handleRemoveAction(index)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <button
            className="btn-add-action"
            onClick={handleAddAction}
          >
            <FiPlus /> Add Action
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="builder-footer">
        <button className="btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className="btn-save"
          onClick={handleSave}
          disabled={loading}
        >
          <FiSave /> {loading ? 'Saving...' : 'Save Workflow'}
        </button>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
