// frontend/src/components/TeamManager/TeamSettingsModal.js
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './Modal.css';

const TeamSettingsModal = ({ isOpen, onClose, team, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: {
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        settings: team.settings || {
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY'
        }
      });
    }
  }, [team, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Team Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Team Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Team description"
              rows="3"
            />
          </div>

          <h3 className="section-title">Preferences</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.settings.currency}
                onChange={handleSettingChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.settings.timezone}
                onChange={handleSettingChange}
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="CST">CST</option>
                <option value="MST">MST</option>
                <option value="PST">PST</option>
                <option value="GMT">GMT</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dateFormat">Date Format</label>
              <select
                id="dateFormat"
                name="dateFormat"
                value={formData.settings.dateFormat}
                onChange={handleSettingChange}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamSettingsModal;
