// frontend/src/components/Automation/Automations.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiBarChart2 } from 'react-icons/fi';
import { api } from '../../services/api';
import WorkflowBuilder from './WorkflowBuilder';
import './Automations.css';

const Automations = ({ teamId }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [showStats, setShowStats] = useState(null);

  useEffect(() => {
    if (teamId) {
      fetchWorkflows();
    }
  }, [teamId]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/automations/team/${teamId}`);
      setWorkflows(response.data.workflows);
      setError(null);
    } catch (err) {
      setError('Failed to load workflows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingWorkflow(null);
    setShowBuilder(true);
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleDelete = async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await api.delete(`/automations/${workflowId}`);
        setWorkflows(workflows.filter(w => w._id !== workflowId));
      } catch (err) {
        setError('Failed to delete workflow');
        console.error(err);
      }
    }
  };

  const handleToggle = async (workflowId, currentStatus) => {
    try {
      await api.patch(`/automations/${workflowId}/toggle`);
      setWorkflows(workflows.map(w =>
        w._id === workflowId ? { ...w, enabled: !w.enabled } : w
      ));
    } catch (err) {
      setError('Failed to toggle workflow');
      console.error(err);
    }
  };

  const handleSaveWorkflow = () => {
    setShowBuilder(false);
    setEditingWorkflow(null);
    fetchWorkflows();
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingWorkflow(null);
  };

  if (loading) {
    return <div className="automations loading">Loading automations...</div>;
  }

  return (
    <div className="automations">
      <div className="automations-header">
        <div>
          <h2>Deal Automations</h2>
          <p className="subtitle">Automate repetitive tasks and streamline your sales process</p>
        </div>
        <button className="btn-create" onClick={handleCreateNew}>
          <FiPlus /> Create Workflow
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {workflows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚙️</div>
          <h3>No automations yet</h3>
          <p>Create your first automation to get started</p>
          <button className="btn-create" onClick={handleCreateNew}>
            <FiPlus /> Create First Workflow
          </button>
        </div>
      ) : (
        <div className="workflows-grid">
          {workflows.map(workflow => (
            <div key={workflow._id} className={`workflow-card ${workflow.enabled ? 'active' : 'disabled'}`}>
              <div className="workflow-header">
                <div className="workflow-title">
                  <h3>{workflow.name}</h3>
                  {workflow.description && (
                    <p className="workflow-description">{workflow.description}</p>
                  )}
                </div>
                <div className="workflow-status">
                  <button
                    className="btn-toggle"
                    onClick={() => handleToggle(workflow._id, workflow.enabled)}
                    title={workflow.enabled ? 'Disable' : 'Enable'}
                  >
                    {workflow.enabled ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                </div>
              </div>

              <div className="workflow-details">
                <div className="detail-item">
                  <span className="label">Trigger:</span>
                  <span className="value">{workflow.trigger.type.replace(/_/g, ' ')}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Conditions:</span>
                  <span className="value">{workflow.conditions.length}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Actions:</span>
                  <span className="value">{workflow.actions.length}</span>
                </div>
              </div>

              <div className="workflow-stats">
                <div className="stat">
                  <span className="stat-label">Executions</span>
                  <span className="stat-value">{workflow.stats.totalExecutions}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Success Rate</span>
                  <span className="stat-value">
                    {workflow.stats.totalExecutions > 0
                      ? Math.round((workflow.stats.successfulExecutions / workflow.stats.totalExecutions) * 100)
                      : 0}%
                  </span>
                </div>
              </div>

              <div className="workflow-actions">
                <button
                  className="btn-action btn-stats"
                  onClick={() => setShowStats(showStats === workflow._id ? null : workflow._id)}
                  title="View Stats"
                >
                  <FiBarChart2 /> Stats
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => handleEdit(workflow)}
                  title="Edit"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(workflow._id)}
                  title="Delete"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>

              {showStats === workflow._id && (
                <div className="workflow-stats-detail">
                  <div className="stat-item">
                    <span>Total Executions:</span>
                    <strong>{workflow.stats.totalExecutions}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Successful:</span>
                    <strong className="success">{workflow.stats.successfulExecutions}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Failed:</span>
                    <strong className="error">{workflow.stats.failedExecutions}</strong>
                  </div>
                  <div className="stat-item">
                    <span>Last Executed:</span>
                    <strong>
                      {workflow.stats.lastExecuted
                        ? new Date(workflow.stats.lastExecuted).toLocaleDateString()
                        : 'Never'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showBuilder && (
        <WorkflowBuilder
          teamId={teamId}
          workflowId={editingWorkflow?._id}
          onClose={handleCloseBuilder}
          onSave={handleSaveWorkflow}
        />
      )}
    </div>
  );
};

export default Automations;
