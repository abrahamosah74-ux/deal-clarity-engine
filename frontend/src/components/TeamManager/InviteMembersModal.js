// frontend/src/components/TeamManager/InviteMembersModal.js
import React, { useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import './Modal.css';

const InviteMembersModal = ({ isOpen, onClose, onSubmit }) => {
  const [invites, setInvites] = useState([{ email: '', role: 'member' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddInvite = () => {
    setInvites([...invites, { email: '', role: 'member' }]);
  };

  const handleRemoveInvite = (index) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleInviteChange = (index, field, value) => {
    const updated = [...invites];
    updated[index][field] = value;
    setInvites(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate
    const validInvites = invites.filter(i => i.email.trim());
    if (validInvites.length === 0) {
      setError('Please enter at least one email');
      return;
    }

    for (const invite of validInvites) {
      if (!invite.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError(`Invalid email: ${invite.email}`);
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit(validInvites);
      setInvites([{ email: '', role: 'member' }]);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send invites');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Team Members</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="invites-container">
            {invites.map((invite, index) => (
              <div key={index} className="invite-row">
                <div className="form-group flex-1">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={invite.email}
                    onChange={(e) => handleInviteChange(index, 'email', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <select
                    value={invite.role}
                    onChange={(e) => handleInviteChange(index, 'role', e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {invites.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveInvite(index)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-add-invite"
            onClick={handleAddInvite}
          >
            <FiPlus /> Add Another
          </button>

          <div className="invite-info">
            <p>💡 Invites will be sent to the provided emails. Recipients can accept or decline.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : `Send ${invites.filter(i => i.email).length} Invite(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMembersModal;
